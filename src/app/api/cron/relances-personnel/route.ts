// Route /api/cron/relances-personnel
//   Tâche planifiée (cron Vercel) — exécutée automatiquement chaque jour.
//   Signale au PERSONNEL (pas aux clients) les dossiers qui traînent sans
//   suivi depuis au moins SEUIL_JOURS jours : devis sans proposition envoyée
//   (ou proposition envoyée mais non choisie), sinistres non traités,
//   rendez-vous non confirmés.
//
//   • Une notification in-app par dossier concerné, RENOUVELÉE chaque jour
//     tant que le dossier reste dans cet état (au maximum 1 fois/jour/dossier,
//     grâce à derniereRelance).
//   • Un SEUL e-mail récapitulatif envoyé à l'équipe (pas un e-mail par
//     dossier), pour ne pas noyer la boîte mail.
//
//   Important : dès qu'un agent agit sur un dossier (proposition envoyée,
//   statut changé, rdv confirmé) — y compris après un appel téléphonique ou
//   un échange WhatsApp que le système ne peut pas détecter lui-même — le
//   dossier sort automatiquement de cette liste, donc les rappels s'arrêtent.
//
// Sécurité : identique à /api/cron/relances (en-tête Authorization: Bearer <CRON_SECRET>).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerEmail, gabaritNotification } from "@/lib/email";

const SEUIL_JOURS = 2;
const JOUR_MS = 24 * 60 * 60 * 1000;
const EMAIL_OPS = process.env.EMAIL_OPS ?? "infos@karhonassurance.com";
const APP_URL = (process.env.APP_URL ?? "https://karhonassurance.com").replace(/\/$/, "");

// Un dossier est "à relancer" si son dernier rappel remonte à plus d'un jour
// (ou n'a jamais eu lieu) — pour au plus 1 rappel par dossier et par jour.
function pasEncoreRelanceAujourdhui(derniereRelance: Date | null): boolean {
  if (!derniereRelance) return true;
  const hier = new Date(Date.now() - JOUR_MS);
  return derniereRelance < hier;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const entete = req.headers.get("authorization");
  if (!secret || entete !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const seuil = new Date(Date.now() - SEUIL_JOURS * JOUR_MS);
    const recap: string[] = [];
    let total = 0;

    // 1) Devis en attente / en cours, sans proposition choisie, restés
    //    inactifs depuis SEUIL_JOURS (couvre aussi le cas où le client n'a
    //    pas encore choisi une offre déjà envoyée).
    const devis = await prisma.devis.findMany({
      where: {
        supprime: false,
        statut: { in: ["en_attente", "en_cours", "envoye"] },
        dateCreation: { lte: seuil },
      },
      include: { user: { select: { nom: true, prenom: true } }, produit: { select: { nom: true } } },
    });
    for (const d of devis) {
      if (!pasEncoreRelanceAujourdhui(d.derniereRelance)) continue;
      const titre = "Devis à relancer";
      const message = `Le devis « ${d.produit?.nom ?? ""} » de ${d.user?.prenom ?? ""} ${d.user?.nom ?? ""} est sans suite depuis ${SEUIL_JOURS} jours ou plus.`;
      await prisma.notification.create({
        data: { cible: "agent", type: "devis", titre, message, lien: `/admin?onglet=devis&ref=${d.id}` },
      });
      await prisma.devis.update({
        where: { id: d.id },
        data: { derniereRelance: new Date(), nombreRelances: { increment: 1 } },
      });
      recap.push(`Devis : ${d.produit?.nom ?? ""} — ${d.user?.prenom ?? ""} ${d.user?.nom ?? ""}`);
      total++;
    }

    // 2) Sinistres déclarés ou en cours, restés inactifs depuis SEUIL_JOURS.
    const sinistres = await prisma.sinistre.findMany({
      where: {
        supprime: false,
        statut: { in: ["declare", "en_cours"] },
        dateDeclaration: { lte: seuil },
      },
      include: { user: { select: { nom: true, prenom: true } } },
    });
    for (const s of sinistres) {
      if (!pasEncoreRelanceAujourdhui(s.derniereRelance)) continue;
      const titre = "Sinistre à relancer";
      const message = `Le sinistre déclaré par ${s.user?.prenom ?? ""} ${s.user?.nom ?? ""} est sans suite depuis ${SEUIL_JOURS} jours ou plus.`;
      await prisma.notification.create({
        data: { cible: "agent", type: "sinistre", titre, message, lien: `/admin?onglet=sinistres&ref=${s.id}` },
      });
      await prisma.sinistre.update({
        where: { id: s.id },
        data: { derniereRelance: new Date(), nombreRelances: { increment: 1 } },
      });
      recap.push(`Sinistre : ${s.user?.prenom ?? ""} ${s.user?.nom ?? ""}`);
      total++;
    }

    // 3) Rendez-vous en attente de confirmation, restés inactifs depuis SEUIL_JOURS.
    const rdvs = await prisma.rendezVous.findMany({
      where: {
        supprime: false,
        statut: "en_attente",
        createdAt: { lte: seuil },
      },
      include: { user: { select: { nom: true, prenom: true } } },
    });
    for (const r of rdvs) {
      if (!pasEncoreRelanceAujourdhui(r.derniereRelance)) continue;
      const titre = "Rendez-vous à confirmer";
      const message = `La demande de rendez-vous de ${r.user?.prenom ?? ""} ${r.user?.nom ?? ""} n'est toujours pas confirmée depuis ${SEUIL_JOURS} jours ou plus.`;
      await prisma.notification.create({
        data: { cible: "agent", type: "rendezvous", titre, message, lien: `/admin?onglet=rdv&ref=${r.id}` },
      });
      await prisma.rendezVous.update({
        where: { id: r.id },
        data: { derniereRelance: new Date(), nombreRelances: { increment: 1 } },
      });
      recap.push(`Rendez-vous : ${r.user?.prenom ?? ""} ${r.user?.nom ?? ""}`);
      total++;
    }

    // Un seul e-mail récapitulatif, uniquement s'il y a quelque chose à signaler.
    if (total > 0) {
      await envoyerEmail({
        to: EMAIL_OPS,
        subject: `KARHON : ${total} dossier${total > 1 ? "s" : ""} à relancer aujourd'hui`,
        html: gabaritNotification({
          titre: `${total} dossier${total > 1 ? "s" : ""} en attente de suivi`,
          message: recap.join("\n"),
          lienTexte: "Ouvrir le back-office",
          lienUrl: `${APP_URL}/admin`,
        }),
      });
    }

    return NextResponse.json({ ok: true, total, date: new Date().toISOString() });
  } catch (e) {
    console.error("[cron relances-personnel]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
