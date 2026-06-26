// Route /api/notifications
//   GET  → liste des notifications du viewer (selon son rôle) + nb non lues.
//   POST → marque comme lues (toutes, ou une seule via { id }).
//
// Sécurité : connexion obligatoire. Un client ne voit QUE ses notifications ;
// le personnel voit les notifications "agent".
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth } from "@/lib/session";

const ROLES_STAFF = ["agent", "gerant", "admin"];

// Construit le filtre Prisma correspondant au viewer.
function filtrePour(session: { userId: string; role: string }) {
  if (ROLES_STAFF.includes(session.role)) return { cible: "agent" };
  return { cible: "client", userId: session.userId };
}

export async function GET(): Promise<NextResponse> {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  const where = filtrePour(auth);
  try {
    const [notifications, nonLues] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: 30 }),
      prisma.notification.count({ where: { ...where, lu: false } }),
    ]);
    return NextResponse.json({ notifications, nonLues });
  } catch (e) {
    console.error("[notifications:get]", e);
    return NextResponse.json({ notifications: [], nonLues: 0 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  const where = filtrePour(auth);
  let id: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    id = body?.id;
  } catch {}

  try {
    await prisma.notification.updateMany({
      where: id ? { ...where, id } : { ...where, lu: false },
      data: { lu: true },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notifications:post]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
