// Route GET /api/auth/google
//   Démarre la connexion Google : redirige l'utilisateur vers la page de
//   consentement Google avec un paramètre `state` anti-CSRF (stocké en cookie).
//
// Config (.env) :
//   GOOGLE_CLIENT_ID     = ...apps.googleusercontent.com
//   GOOGLE_CLIENT_SECRET = ...   (utilisé seulement côté callback)
// Le redirect_uri est calculé depuis l'URL de la requête → marche en local
// ET en production sans configuration supplémentaire.
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  if (!clientId) {
    // Pas configuré : on renvoie vers la page de connexion avec un message.
    return NextResponse.redirect(`${origin}/client?erreur=google_non_configure`);
  }

  // Jeton anti-CSRF : on le pose en cookie et on le renverra dans `state`.
  const state = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  res.cookies.set("g_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });
  return res;
}
