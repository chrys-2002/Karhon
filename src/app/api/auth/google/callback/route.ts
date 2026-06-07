// Route GET /api/auth/google/callback
//   Google renvoie l'utilisateur ici après consentement.
//   1) Vérifie le state anti-CSRF.
//   2) Échange le `code` contre un jeton d'accès.
//   3) Récupère le profil (email vérifié, nom, avatar).
//   4) Crée/retrouve le User, puis émet NOTRE cookie de session JWT.
//   5) Redirige : personnel → /admin, client → /client/dashboard.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { genererToken } from "@/lib/auth";
import { COOKIE_NAME, cookieOptions } from "@/lib/session";

const ROLES_STAFF = ["agent", "gerant", "admin"];

export async function GET(req: Request) {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // Helper : retour vers la page de connexion avec un message d'erreur.
  const echec = (raison: string) =>
    NextResponse.redirect(`${origin}/client?erreur=${raison}`);

  if (!clientId || !clientSecret) return echec("google_non_configure");
  if (!code) return echec("google_annule");

  // 1) Vérifie le state (anti-CSRF).
  const cookieStore = await cookies();
  const stateAttendu = cookieStore.get("g_state")?.value;
  if (!state || !stateAttendu || state !== stateAttendu) {
    return echec("google_state");
  }

  try {
    // 2) Échange le code contre un jeton d'accès.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return echec("google_token");
    const tokenData = await tokenRes.json();

    // 3) Récupère le profil utilisateur.
    const profilRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!profilRes.ok) return echec("google_profil");
    const profil = await profilRes.json();

    const email = String(profil.email || "").trim().toLowerCase();
    if (!email || profil.verified_email === false) return echec("google_email");

    // 4) Crée ou retrouve l'utilisateur (rattaché par email).
    const existant = await prisma.user.findUnique({ where: { email } });
    let user;
    if (existant) {
      // Relie le compte Google s'il ne l'était pas encore.
      user = await prisma.user.update({
        where: { email },
        data: {
          googleId: existant.googleId ?? String(profil.id),
          avatar: profil.picture ?? existant.avatar,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          nom: profil.family_name || profil.name || "Client",
          prenom: profil.given_name || "",
          googleId: String(profil.id),
          avatar: profil.picture ?? null,
          // motDePasse et telephone restent null : compte Google.
          role: "client",
        },
      });
    }

    // 5) Émet notre cookie de session JWT.
    const token = genererToken({ userId: user.id, email: user.email, role: user.role });
    const dest = ROLES_STAFF.includes(user.role) ? "/admin" : "/client/dashboard";
    const res = NextResponse.redirect(`${origin}${dest}`);
    res.cookies.set(COOKIE_NAME, token, cookieOptions);
    res.cookies.delete("g_state"); // nettoyage
    return res;
  } catch (e) {
    console.error("[google callback]", e);
    return echec("google_erreur");
  }
}
