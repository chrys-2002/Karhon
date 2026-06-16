// Route /api/cron/relances
//   Tâche planifiée (cron Vercel) — exécutée automatiquement chaque jour.
//   Détecte les contrats entrant dans leur fenêtre de relance et envoie
//   l'email de renouvellement, UNE seule fois par fenêtre.
//
// Sécurité : la route n'est exécutable que par le cron Vercel, qui envoie
//   l'en-tête  Authorization: Bearer <CRON_SECRET>.  Toute requête sans ce
//   jeton est refusée (401). Définir CRON_SECRET dans les variables d'env.
//
// Remarque : seul l'EMAIL peut être envoyé automatiquement. WhatsApp et SMS
//   nécessitent une action humaine (lien) ou un fournisseur dédié, et restent
//   donc déclenchés manuellement depuis le back-office.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerEmail, gabaritRelance } from "@/lib/email";
import { infoRelance } from "@/lib/contrats";

export async function GET(req: Request) {
  // 1) Authentification du cron.
  const secret = process.env.CRON_SECRET;
  const entete = req.headers.get("authorization");
  if (!secret || entete !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    // 2) On ne considère que les contrats actifs (les autres ne se renouvellent pas).
    const contrats = await prisma.contrat.findMany({
      where: { statut: "actif", supprime: false },
      include: {
        user: { select: { prenom: true, email: true } },
        produit: { select: { nom: true } },
      },
    });

    const maintenant = new Date();
    let envoyes = 0;
    let ignores = 0;
    const erreurs: string[] = [];

    for (const c of contrats) {
      const info = infoRelance(c.dateFin, c.dureeMois, maintenant);

      // On relance si : on est dans la fenêtre, pas expiré, et pas encore
      // relancé POUR CETTE fenêtre (derniereRelance avant l'ouverture de fenêtre).
      const dejaRelanceFenetre =
        c.derniereRelance != null && new Date(c.derniereRelance) >= info.dateRelance;

      if (!info.fenetreOuverte || dejaRelanceFenetre) {
        ignores++;
        continue;
      }

      const finFr = new Date(c.dateFin).toLocaleDateString("fr-FR", {
        timeZone: "Africa/Abidjan", day: "2-digit", month: "long", year: "numeric",
      });
      const sujet = `le renouvellement de votre contrat ${c.produit?.nom ?? ""} (n° ${c.numeroContrat})`.trim();
      const corps =
        `Votre contrat arrive à échéance le ${finFr}` +
        `${info.joursRestants > 0 ? ` (dans ${info.joursRestants} jour${info.joursRestants > 1 ? "s" : ""})` : ""}. ` +
        `Pour rester couvert sans interruption, nous vous invitons à le renouveler dès maintenant. ` +
        `Notre équipe se tient à votre disposition pour préparer votre nouvelle cotation.`;

      const email = await envoyerEmail({
        to: c.user.email,
        subject: "KARHON Assurances — Renouvellement de votre contrat",
        html: gabaritRelance({ prenom: c.user.prenom, sujet, message: corps }),
      });

      if (email.ok) {
        await prisma.contrat.update({
          where: { id: c.id },
          data: { derniereRelance: new Date(), nombreRelances: { increment: 1 } },
        });
        envoyes++;
      } else {
        erreurs.push(`${c.numeroContrat}: ${email.erreur}`);
      }
    }

    return NextResponse.json({
      ok: true,
      total: contrats.length,
      envoyes,
      ignores,
      erreurs,
      date: maintenant.toISOString(),
    });
  } catch (e) {
    console.error("[cron relances]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
