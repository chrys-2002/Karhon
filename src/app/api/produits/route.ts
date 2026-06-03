// GET /api/produits — Liste publique des produits d'assurance.
// Sert notamment à alimenter le formulaire de devis (choix du produit).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const produits = await prisma.produit.findMany({
      orderBy: { nom: "asc" },
    });
    return NextResponse.json({ produits });
  } catch (e) {
    console.error("[produits]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
