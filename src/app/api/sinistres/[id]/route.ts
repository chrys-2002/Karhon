// Route /api/sinistres/[id]
//   PATCH  → met à jour le statut, OU restaure un sinistre archivé (gérant).
//   DELETE → suppression douce (archivage) par le personnel ;
//            ?purge=1 → suppression définitive (gérant uniquement).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerStaff, exigerGerant } from "@/lib/session";
import { journaliser } from "@/lib/audit";
import { notifierClient } from "@/lib/notifications";

// Libellés clients lisibles pour chaque statut de sinistre.
const LABEL_STATUT_SINISTRE: Record<string, string> = {
  declare: "déclaré",
  en_cours: "en cours de traitement",
  indemnise: "indemnisé",
  refuse: "refusé",
};

const STATUTS_VALIDES = ["declare", "en_cours", "indemnise", "refuse"] as const;
type StatutSinistre = (typeof STATUTS_VALIDES)[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json();

    const existant = await prisma.sinistre.findUnique({
      where: { id },
      include: { user: { select: { nom: true, prenom: true } } },
    });
    if (!existant) {
      return NextResponse.json({ erreur: "Sinistre introuvable." }, { status: 404 });
    }
    const resume = `Sinistre ${existant.typeAssurance ?? ""} — ${existant.user?.prenom ?? ""} ${existant.user?.nom ?? ""}`.trim();

    // Cas 1 : restauration (réservé au gérant).
    if (body?.restaurer === true) {
      const g = await exigerGerant();
      if (g instanceof NextResponse) return g;
      const sinistre = await prisma.sinistre.update({
        where: { id },
        data: { supprime: false, supprimePar: null, supprimeLe: null },
        include: { user: { select: { nom: true, prenom: true, email: true, telephone: true } } },
      });
      await journaliser({ action: "restauration", entite: "sinistre", entiteId: id, resume, auteurEmail: auth.email });
      return NextResponse.json({ sinistre });
    }

    // Cas 2 : changement de statut.
    const { statut } = body;
    if (!statut || !STATUTS_VALIDES.includes(statut)) {
      return NextResponse.json({ erreur: "Statut invalide." }, { status: 400 });
    }
    const sinistre = await prisma.sinistre.update({
      where: { id },
      data: { statut: statut as StatutSinistre },
      include: { user: { select: { nom: true, prenom: true, email: true, telephone: true } } },
    });

    // Prévient le client du changement de statut (in-app + e-mail).
    await notifierClient({
      userId: existant.userId,
      email: sinistre.user?.email,
      type: "statut",
      titre: "Mise à jour de votre sinistre",
      message: `Votre sinistre (${sinistre.typeAssurance ?? "assurance"}) est désormais : ${LABEL_STATUT_SINISTRE[statut] ?? statut}.`,
      onglet: "sinistres",
      ref: id,
    });

    return NextResponse.json({ sinistre });
  } catch (e) {
    console.error("[sinistres PATCH]", e);
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

    const existant = await prisma.sinistre.findUnique({
      where: { id },
      include: { user: { select: { nom: true, prenom: true } } },
    });
    if (!existant) {
      return NextResponse.json({ erreur: "Sinistre introuvable." }, { status: 404 });
    }
    const resume = `Sinistre ${existant.typeAssurance ?? ""} — ${existant.user?.prenom ?? ""} ${existant.user?.nom ?? ""}`.trim();

    if (purge) {
      const g = await exigerGerant();
      if (g instanceof NextResponse) return g;
      await prisma.sinistre.delete({ where: { id } });
      await journaliser({ action: "purge", entite: "sinistre", entiteId: id, resume, auteurEmail: auth.email });
      return NextResponse.json({ ok: true, purge: true });
    }

    await prisma.sinistre.update({
      where: { id },
      data: { supprime: true, supprimePar: auth.email, supprimeLe: new Date() },
    });
    await journaliser({ action: "archivage", entite: "sinistre", entiteId: id, resume, auteurEmail: auth.email });
    return NextResponse.json({ ok: true, archive: true });
  } catch (e) {
    console.error("[sinistres DELETE]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
