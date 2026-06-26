// Route /api/messages/lire — marque les messages reçus comme lus.
//   staff  : { userId } → marque lus les messages "client" de ce client.
//   client : {}         → marque lus les messages "staff" reçus.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth } from "@/lib/session";

const ROLES_STAFF = ["agent", "gerant", "admin"];

export async function POST(req: Request): Promise<NextResponse> {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;
  const estStaff = ROLES_STAFF.includes(auth.role);

  try {
    if (estStaff) {
      const { userId } = await req.json().catch(() => ({}));
      if (!userId) return NextResponse.json({ erreur: "Client manquant." }, { status: 400 });
      await prisma.message.updateMany({
        where: { userId: String(userId), expediteur: "client", lu: false },
        data: { lu: true },
      });
    } else {
      await prisma.message.updateMany({
        where: { userId: auth.userId, expediteur: "staff", lu: false },
        data: { lu: true },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[messages lire]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
