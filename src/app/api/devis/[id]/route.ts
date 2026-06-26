// Route /api/devis/[id]
//   PATCH  → met à jour le statut, OU restaure un devis archivé (gérant).
//   DELETE → suppression douce (archivage) par le personnel ;
//            ?purge=1 → suppression définitive (gérant uniquement).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerStaff, exigerGerant } from "@/lib/session";
import { journaliser } from "@/lib/audit";
import { notifierClient } from "@/lib/notifications";

// Libellés clients lisibles pour chaque statut de devis.
const LABEL_STATUT_DEVIS: Record<string, string> = {
  en_attente: "en attente",
  en_cours: "en cours d'étude",
  envoye: "des offres vous ont été envoyées",
  accepte: "accepté",
  refuse: "refusé",
};

const STATUTS_VALIDES = ["en_attente", "en_cours", "envoye", "accepte", "refuse"] as const;
type StatutDevis = (typeof STATUTS_VALIDES)[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json();

    const existant = await prisma.devis.findUnique({
      where: { id },
      include: { produit: { select: { nom: true } }, user: { select: { nom: true, prenom: true } } },
    });
    if (!existant) {
      return NextResponse.json({ erreur: "Cotation introuvable." }, { status: 404 });
    }

    // Cas 1 : restauration d'un devis archivé (réservé au gérant).
    if (body?.restaurer === true) {
      const g = await exigerGerant();
      if (g instanceof NextResponse) return g;
      const devis = await prisma.devis.update({
        where: { id },
        data: { supprime: false, supprimePar: null, supprimeLe: null },
        include: { produit: { select: { nom: true, type: true } }, user: { select: { nom: true, prenom: true, email: true, telephone: true } } },
      });
      await journaliser({
        action: "restauration", entite: "devis", entiteId: id,
        resume: `Cotation ${existant.produit?.nom ?? ""} — ${existant.user?.prenom ?? ""} ${existant.user?.nom ?? ""}`.trim(),
        auteurEmail: auth.email,
      });
      return NextResponse.json({ devis });
    }

    // Cas 2 : changement de statut.
    const { statut } = body;
    if (!statut || !STATUTS_VALIDES.includes(statut)) {
      return NextResponse.json({ erreur: "Statut invalide." }, { status: 400 });
    }
    const devis = await prisma.devis.update({
      where: { id },
      data: { statut: statut as StatutDevis },
      include: {
        produit: { select: { nom: true, type: true } },
        user: { select: { nom: true, prenom: true, email: true, telephone: true } },
      },
    });

    // Prévient le client du changement de statut (in-app + e-mail).
    await notifierClient({
      userId: existant.userId,
      email: devis.user?.email,
      type: "statut",
      titre: "Mise à jour de votre cotation",
      message: `Votre cotation « ${devis.produit?.nom ?? "produit"} » est désormais : ${LABEL_STATUT_DEVIS[statut] ?? statut}.`,
      onglet: "devis",
    });

    return NextResponse.json({ devis });
  } catch (e) {
    console.error("[devis PATCH]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const purge = new URL(req.url).searchParams.get("purge") === "1";

    const existant = await prisma.devis.findUnique({
      where: { id },
      include: { produit: { select: { nom: true } }, user: { select: { nom: true, prenom: true } } },
    });
    if (!existant) {
      return NextResponse.json({ erreur: "Cotation introuvable." }, { status: 404 });
    }
    const resume = `Cotation ${existant.produit?.nom ?? ""} — ${existant.user?.prenom ?? ""} ${existant.user?.nom ?? ""}`.trim();

    if (purge) {
      // Suppression DÉFINITIVE — réservée au gérant.
      const g = await exigerGerant();
      if (g instanceof NextResponse) return g;
      await prisma.devis.delete({ where: { id } });
      await journaliser({ action: "purge", entite: "devis", entiteId: id, resume, auteurEmail: auth.email });
      return NextResponse.json({ ok: true, purge: true });
    }

    // Suppression DOUCE (archivage) — le gérant garde la trace + l'auteur.
    await prisma.devis.update({
      where: { id },
      data: { supprime: true, supprimePar: auth.email, supprimeLe: new Date() },
    });
    await journaliser({ action: "archivage", entite: "devis", entiteId: id, resume, auteurEmail: auth.email });
    return NextResponse.json({ ok: true, archive: true });
  } catch (e) {
    console.error("[devis DELETE]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
