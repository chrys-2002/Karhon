// Route /api/devis/[id]
//   PATCH → un admin met à jour le statut d'un devis (workflow courtier).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/session";

// Valeurs autorisées pour le statut (alignées sur l'enum StatutDevis).
const STATUTS_VALIDES = ["en_attente", "en_cours", "envoye", "accepte", "refuse"] as const;
type StatutDevis = (typeof STATUTS_VALIDES)[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Seul un admin peut faire évoluer un devis.
  const auth = await exigerAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { statut } = await req.json();

    // Validation : le statut doit faire partie des valeurs autorisées.
    if (!statut || !STATUTS_VALIDES.includes(statut)) {
      return NextResponse.json(
        { erreur: "Statut invalide." },
        { status: 400 }
      );
    }

    // Vérifie que le devis existe avant de tenter la mise à jour.
    const existant = await prisma.devis.findUnique({ where: { id } });
    if (!existant) {
      return NextResponse.json({ erreur: "Devis introuvable." }, { status: 404 });
    }

    const devis = await prisma.devis.update({
      where: { id },
      data: { statut: statut as StatutDevis },
      include: {
        produit: { select: { nom: true, type: true } },
        user: { select: { nom: true, prenom: true, email: true } },
      },
    });

    return NextResponse.json({ devis });
  } catch (e) {
    console.error("[devis PATCH]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
