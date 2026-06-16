// Route /api/devis/[id]/propositions
//   POST → un membre du personnel envoie une proposition (cotation) d'une
//          compagnie partenaire pour ce devis (fiche PDF + prime optionnelle).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerStaff } from "@/lib/session";
import { estPartenaireValide } from "@/lib/partenaires";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { compagnie, documents, prime, message } = await req.json().catch(() => ({}));

    if (!estPartenaireValide(compagnie)) {
      return NextResponse.json({ erreur: "Compagnie partenaire invalide." }, { status: 400 });
    }

    // Le devis doit exister.
    const devis = await prisma.devis.findUnique({ where: { id } });
    if (!devis) {
      return NextResponse.json({ erreur: "Devis introuvable." }, { status: 404 });
    }

    // Sécurité : n'accepte que des fiches "Libellé|url" pointant vers Vercel Blob.
    const docsValides = Array.isArray(documents)
      ? documents
          .filter(
            (d): d is string =>
              typeof d === "string" &&
              /\|https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\//i.test(d)
          )
          .slice(0, 6)
      : [];

    if (docsValides.length === 0) {
      return NextResponse.json({ erreur: "Joignez au moins la fiche (PDF) de la compagnie." }, { status: 400 });
    }

    const proposition = await prisma.proposition.create({
      data: {
        devisId: id,
        compagnie,
        documents: docsValides,
        prime: typeof prime === "number" ? prime : null,
        message: typeof message === "string" && message.trim() ? message.slice(0, 500) : null,
      },
    });

    // Le devis passe à "envoyé" (propositions transmises au client).
    await prisma.devis.update({ where: { id }, data: { statut: "envoye" } });

    return NextResponse.json({ proposition }, { status: 201 });
  } catch (e) {
    console.error("[propositions POST]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
