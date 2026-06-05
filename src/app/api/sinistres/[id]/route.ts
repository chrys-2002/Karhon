// Route /api/sinistres/[id]
//   PATCH → un admin met à jour le statut d'un sinistre (workflow courtier).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/session";

// Valeurs autorisées pour le statut (alignées sur l'enum StatutSinistre).
const STATUTS_VALIDES = ["declare", "en_cours", "indemnise", "refuse"] as const;
type StatutSinistre = (typeof STATUTS_VALIDES)[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Seul un admin peut faire évoluer un sinistre.
  const auth = await exigerAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { statut } = await req.json();

    // Validation : le statut doit faire partie des valeurs autorisées.
    if (!statut || !STATUTS_VALIDES.includes(statut)) {
      return NextResponse.json({ erreur: "Statut invalide." }, { status: 400 });
    }

    // Vérifie que le sinistre existe avant de tenter la mise à jour.
    const existant = await prisma.sinistre.findUnique({ where: { id } });
    if (!existant) {
      return NextResponse.json({ erreur: "Sinistre introuvable." }, { status: 404 });
    }

    const sinistre = await prisma.sinistre.update({
      where: { id },
      data: { statut: statut as StatutSinistre },
      include: {
        user: { select: { nom: true, prenom: true, email: true } },
      },
    });

    return NextResponse.json({ sinistre });
  } catch (e) {
    console.error("[sinistres PATCH]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

// ── DELETE : supprimer définitivement un sinistre (admin) ────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    const existant = await prisma.sinistre.findUnique({ where: { id } });
    if (!existant) {
      return NextResponse.json({ erreur: "Sinistre introuvable." }, { status: 404 });
    }

    await prisma.sinistre.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[sinistres DELETE]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
