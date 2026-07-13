// ─────────────────────────────────────────────────────────────
// Middleware de sécurité — KARHON Assurances
//
// Protège les PAGES sensibles AVANT leur rendu (contrôle d'accès côté serveur).
// On ne se fie pas au JavaScript de la page : on vérifie le jeton de session
// (signature + expiration) et le rôle à chaque requête. Empêche l'accès aux
// espaces protégés par simple saisie d'URL.
//
//   • /admin/**  → réservé au PERSONNEL (agent / gérant).
//   • /client/dashboard, /client/recu, /client/contrats, /client/sinistres,
//     /client/rendez-vous  → réservé aux utilisateurs CONNECTÉS.
//
// Le middleware s'exécute sur toutes les pages (voir matcher plus bas) et
// filtre lui-même les chemins protégés : c'est plus fiable que de compter sur
// la correspondance de motifs du matcher.
// ─────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "karhon_token";
const ROLES_STAFF = ["agent", "gerant", "admin"];

// Chemins de l'espace client qui exigent une connexion.
const PREFIXES_CLIENT = [
  "/client/dashboard",
  "/client/recu",
  "/client/contrats",
  "/client/sinistres",
  "/client/rendez-vous",
];

type Session = { userId?: string; role?: string };

async function lireSession(token?: string): Promise<Session | null> {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as Session;
  } catch {
    return null; // jeton absent, invalide ou expiré
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const estAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const estClient = PREFIXES_CLIENT.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Pages non protégées : on laisse passer sans rien vérifier.
  if (!estAdmin && !estClient) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await lireSession(token);

  // ── Back-office : personnel uniquement ──
  if (estAdmin) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/acces-equipe";
      return NextResponse.redirect(url);
    }
    if (!ROLES_STAFF.includes(session.role ?? "")) {
      const url = req.nextUrl.clone();
      url.pathname = "/client/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Espace client : connexion obligatoire ET réservé aux clients ──
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/client";
    url.searchParams.set("suite", pathname);
    return NextResponse.redirect(url);
  }
  if (ROLES_STAFF.includes(session.role ?? "")) {
    // Le personnel a son propre espace : on l'y renvoie.
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// S'exécute sur toutes les pages SAUF les fichiers statiques, l'API et les
// ressources internes de Next. Le filtrage fin est fait dans la fonction.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.).*)"],
};
