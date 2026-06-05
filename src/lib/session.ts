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

// Rôles ayant accès au back-office (personnel KARHON).
const ROLES_STAFF = ["agent", "gerant", "admin"];
// Rôles ayant les pouvoirs du dirigeant (restaurer, purger, voir le journal).
const ROLES_GERANT = ["gerant", "admin"]; // "admin" = ancien rôle, traité comme gérant

// Exige un membre du personnel (agent OU gérant). C'est le garde-fou du
// back-office : un client qui devine l'URL sera bloqué côté serveur (403).
// (Conserve le nom exigerAdmin pour compatibilité avec les routes existantes.)
export async function exigerAdmin(): Promise<JwtPayload | NextResponse> {
  return exigerStaff();
}

export async function exigerStaff(): Promise<JwtPayload | NextResponse> {
  const session = await getUtilisateurConnecte();
  if (!session) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }
  if (!ROLES_STAFF.includes(session.role)) {
    return NextResponse.json({ erreur: "Accès réservé au personnel KARHON." }, { status: 403 });
  }
  return session;
}

// Exige le rôle dirigeant (gérant). Pour les actions sensibles :
// restaurer un élément archivé, purger définitivement, consulter le journal.
export async function exigerGerant(): Promise<JwtPayload | NextResponse> {
  const session = await getUtilisateurConnecte();
  if (!session) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }
  if (!ROLES_GERANT.includes(session.role)) {
    return NextResponse.json({ erreur: "Action réservée au gérant." }, { status: 403 });
  }
  return session;
}

// Indique si un rôle est de niveau gérant (utilitaire partagé).
export function estGerant(role: string): boolean {
  return ROLES_GERANT.includes(role);
}

// Options communes pour poser le cookie de session de façon sécurisée.
export const cookieOptions = {
  httpOnly: true,                                   // inaccessible au JS client
  secure: process.env.NODE_ENV === "production",    // HTTPS uniquement en prod
  sameSite: "lax" as const,                         // limite les attaques CSRF
  path: "/",
  maxAge: 60 * 60 * 24 * 7,                          // 7 jours
};
