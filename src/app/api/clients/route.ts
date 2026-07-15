// GET /api/clients — Liste des clients inscrits (réservée au personnel).
// Renvoie les coordonnées et la date d'inscription de chaque client, plus le
// nombre de cotations / contrats / sinistres qu'il a générés.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerStaff } from "@/lib/session";

export async function GET() {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    const clients = await prisma.user.findMany({
      where: { role: "client" },
      orderBy: { dateInscription: "desc" },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        adresse: true,
        dateInscription: true,
        _count: { select: { devis: true, contrats: true, sinistres: true } },
      },
    });
    return NextResponse.json({ clients });
  } catch (e) {
    console.error("[clients GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
