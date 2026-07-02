// Route /api/devis/[id]/vues
//   POST → le client marque les propositions de SA cotation comme consultées.
//          Sert à distinguer les offres « nouvelles » (jamais vues) des autres.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth } from "@/lib/session";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Vérifie que la cotation appartient bien au client connecté.
    const devis = await prisma.devis.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!devis) return NextResponse.json({ erreur: "Cotation introuvable." }, { status: 404 });
    if (devis.userId !== auth.userId) {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }

    // Marque toutes les propositions non encore vues comme consultées.
    await prisma.proposition.updateMany({
      where: { devisId: id, vueClient: false },
      data: { vueClient: true },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[devis vues]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
