// Route /api/rendez-vous/[id]
//   PATCH → un membre du personnel change le statut d'un rendez-vous
//           (confirmé / annulé / terminé).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerStaff } from "@/lib/session";

const STATUTS = ["en_attente", "confirme", "annule", "termine"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { statut } = await req.json().catch(() => ({}));

    if (!STATUTS.includes(statut)) {
      return NextResponse.json({ erreur: "Statut invalide." }, { status: 400 });
    }

    const maj = await prisma.rendezVous.update({
      where: { id },
      data: { statut },
      include: { user: { select: { nom: true, prenom: true, email: true, telephone: true } } },
    });

    return NextResponse.json({ rendezVous: maj });
  } catch (e) {
    console.error("[rendez-vous PATCH]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
