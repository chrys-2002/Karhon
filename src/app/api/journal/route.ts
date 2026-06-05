// Route /api/journal
//   GET → le journal d'audit (archivages, restaurations, purges).
//         Réservé au gérant : c'est l'outil de contrôle des agents.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerGerant } from "@/lib/session";

export async function GET() {
  const auth = await exigerGerant();
  if (auth instanceof NextResponse) return auth;

  try {
    const entrees = await prisma.journalAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: 200, // on borne pour ne pas tout charger
    });
    return NextResponse.json({ entrees });
  } catch (e) {
    console.error("[journal GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
