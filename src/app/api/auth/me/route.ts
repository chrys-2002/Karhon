// GET /api/auth/me — Renvoie l'utilisateur actuellement connecté.
// Utilisé par le front pour savoir qui est connecté (ex. dashboard).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUtilisateurConnecte } from "@/lib/session";

export async function GET() {
  const session = await getUtilisateurConnecte();
  if (!session) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  // Personnel (agent/gérant) → table Admin ; client → table User.
  if (session.role !== "client") {
    const admin = await prisma.admin.findUnique({
      where: { id: session.userId },
      select: { id: true, nom: true, prenom: true, email: true, role: true, dateCreation: true },
    });
    if (!admin) {
      return NextResponse.json({ erreur: "Compte introuvable." }, { status: 404 });
    }
    return NextResponse.json({ utilisateur: admin });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      adresse: true,
      role: true,
      dateInscription: true,
    },
  });

  if (!user) {
    return NextResponse.json({ erreur: "Utilisateur introuvable." }, { status: 404 });
  }

  return NextResponse.json({ utilisateur: user });
}
