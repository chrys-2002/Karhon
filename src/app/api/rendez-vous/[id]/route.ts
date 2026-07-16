// Route /api/rendez-vous/[id]
//   PATCH  → un membre du personnel change le statut d'un rendez-vous
//            (confirmé / annulé / terminé).
//   DELETE → suppression douce (archivage) : le client retire son rendez-vous
//            de sa liste ; le personnel peut aussi archiver.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth, exigerStaff } from "@/lib/session";

const ROLES_STAFF = ["agent", "gerant", "admin"];
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

// ── DELETE : suppression douce (archivage) ───────────────────
//   Le client ne peut archiver QUE ses propres rendez-vous ; le personnel tous.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const rdv = await prisma.rendezVous.findUnique({ where: { id }, select: { userId: true } });
    if (!rdv) {
      return NextResponse.json({ erreur: "Rendez-vous introuvable." }, { status: 404 });
    }
    const estStaff = ROLES_STAFF.includes(auth.role);
    if (!estStaff && rdv.userId !== auth.userId) {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }

    await prisma.rendezVous.update({
      where: { id },
      data: { supprime: true, supprimeLe: new Date() },
    });
    return NextResponse.json({ ok: true, archive: true });
  } catch (e) {
    console.error("[rendez-vous DELETE]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
