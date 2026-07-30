// Route PUBLIQUE /api/verifier/[id]?s=CODE
//   Vérifie l'authenticité d'un reçu KARHON. On ne renvoie les informations
//   du reçu QUE si le code de signature fourni correspond à celui recalculé
//   côté serveur : cela protège la vie privée (pas d'énumération possible)
//   et atteste que le reçu n'a pas été falsifié.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierRecu } from "@/lib/signature";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const code = new URL(req.url).searchParams.get("s");

    const contrat = await prisma.contrat.findUnique({
      where: { id },
      include: {
        produit: { select: { nom: true } },
        user: { select: { nom: true, prenom: true } },
      },
    });

    // Reçu introuvable OU code qui ne correspond pas → non authentique,
    // et on ne divulgue aucune donnée.
    if (!contrat || contrat.supprime || !verifierRecu(contrat, code)) {
      return NextResponse.json({ valide: false });
    }

    return NextResponse.json({
      valide: true,
      recu: {
        numeroContrat: contrat.numeroContrat,
        produit: contrat.produit?.nom ?? null,
        compagnie: contrat.compagnie ?? null,
        assure: `${contrat.user?.prenom ?? ""} ${contrat.user?.nom ?? ""}`.trim(),
        dateDebut: contrat.dateDebut,
        dateFin: contrat.dateFin,
        primeAnnuelle: contrat.primeAnnuelle,
        statut: contrat.statut,
      },
    });
  } catch (e) {
    console.error("[verifier GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
