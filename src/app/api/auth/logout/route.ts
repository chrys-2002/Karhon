// POST /api/auth/logout — Déconnexion : on efface le cookie de session.
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Supprime le cookie en le vidant et en l'expirant immédiatement.
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
