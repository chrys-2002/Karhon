// ─────────────────────────────────────────────────────────────
// Gestion de session côté serveur — KARHON Assurances
//
// Le jeton JWT est stocké dans un cookie "httpOnly" (inaccessible
// au JavaScript du navigateur → protège contre le vol de jeton par
// script malveillant / XSS). Ces fonctions lisent ce cookie.
// ─────────────────────────────────────────────────────────────
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifierToken, type JwtPayload } from "./auth";

export const COOKIE_NAME = "karhon_token";

// Récupère l'utilisateur connecté à partir du cookie, ou null.
export async function getUtilisateurConnecte(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifierToken(token);
}

// ── Gardes-fous pour protéger les routes API ─────────────────
// Chaque garde renvoie SOIT l'utilisateur autorisé, SOIT une réponse
// d'erreur prête à retourner. Usage dans une route :
//   const auth = await exigerAuth();
//   if (auth instanceof NextResponse) return auth;  // bloqué
//   // ... ici auth est l'utilisateur connecté

// Exige simplement un utilisateur connecté (client ou admin).
export async function exigerAuth(): Promise<JwtPayload | NextResponse> {
  const session = await getUtilisateurConnecte();
  if (!session) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }
  return session;
}

// Exige un utilisateur connecté ET ayant le rôle admin.
// C'est le garde-fou de sécurité du back-office : un client qui devine
// l'URL admin sera bloqué côté serveur (403), même menu caché ou non.
export async function exigerAdmin(): Promise<JwtPayload | NextResponse> {
  const session = await getUtilisateurConnecte();
  if (!session) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ erreur: "Accès réservé à l'administration." }, { status: 403 });
  }
  return session;
}

// Options communes pour poser le cookie de session de façon sécurisée.
export const cookieOptions = {
  httpOnly: true,                                   // inaccessible au JS client
  secure: process.env.NODE_ENV === "production",    // HTTPS uniquement en prod
  sameSite: "lax" as const,                         // limite les attaques CSRF
  path: "/",
  maxAge: 60 * 60 * 24 * 7,                          // 7 jours
};
