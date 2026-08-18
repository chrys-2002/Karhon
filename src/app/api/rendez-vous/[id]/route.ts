// Route /api/rendez-vous/[id]
//   PATCH  → un membre du personnel change le statut d'un rendez-vous
//            (confirmé / annulé / terminé).
//   DELETE → suppression douce (archivage) : le client retire son rendez-vous
//            de sa liste ; le personnel peut aussi archiver.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth, exigerStaff } from "@/lib/session";
import { notifierClient } from "@/lib/notifications";

const ROLES_STAFF = ["agent", "gerant", "admin"];
const STATUTS = ["en_attente", "confirme", "annule", "termine"] as const;

// Libellés utilisés dans les notifications envoyées au client selon le nouveau statut.
const LIBELLE_STATUT: Record<string, string> = {
  confirme: "confirmé",
  annule: "annulé",
  termine: "marqué comme terminé",
  en_attente: "remis en attente",
};

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
      include: { user: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } } },
    });

    // Prévient le client (in-app + e-mail) du changement de statut de son rendez-vous.
    if (maj.user?.id) {
      const quand = new Date(maj.dateHeure).toLocaleString("fr-FR", {
        timeZone: "Africa/Abidjan",
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
      await notifierClient({
        userId: maj.user.id,
        email: maj.user.email,
        type: "rendezvous",
        titre: "Votre rendez-vous a été mis à jour",
        message: `Votre rendez-vous du ${quand} (${maj.motif}) a été ${LIBELLE_STATUT[statut] ?? statut}.`,
        ref: maj.id,
      });
    }

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
