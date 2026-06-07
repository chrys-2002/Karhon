// ─────────────────────────────────────────────────────────────
// Limitation de débit (rate limiting) — protège les routes sensibles
// contre le brute-force (login) et le spam (mot de passe oublié).
//
// Principe : on compte les requêtes par IP sur une fenêtre de temps.
// Au-delà du maximum, on renvoie 429 (Too Many Requests).
//
// ⚠️ Implémentation EN MÉMOIRE : simple et sans dépendance. Sur un
// hébergement serverless multi-instances (Vercel), chaque instance a sa
// propre mémoire — la limite n'est donc pas strictement globale. C'est
// suffisant pour freiner une attaque basique (MVP). Pour une limite
// globale stricte en production, brancher un store partagé
// (Upstash Redis / Vercel KV) en gardant la même interface.
// ─────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";

type Entree = { count: number; reset: number };
const seau = new Map<string, Entree>();

// Évite que la Map grossisse indéfiniment : purge des entrées expirées
// quand elle devient grande.
function purger(maintenant: number) {
  if (seau.size < 5000) return;
  for (const [k, v] of seau) if (maintenant > v.reset) seau.delete(k);
}

// Récupère l'IP du client (Vercel renseigne x-forwarded-for).
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

// Renvoie une réponse 429 si la limite est dépassée, sinon null.
//   prefixe  : identifiant de la route (ex. "login") pour des compteurs séparés
//   max      : nombre de requêtes autorisées
//   fenetreMs: durée de la fenêtre en millisecondes
export function verifierLimite(
  req: Request,
  prefixe: string,
  max: number,
  fenetreMs: number
): NextResponse | null {
  const maintenant = Date.now();
  purger(maintenant);

  const cle = `${prefixe}:${clientIp(req)}`;
  const e = seau.get(cle);

  // Nouvelle fenêtre.
  if (!e || maintenant > e.reset) {
    seau.set(cle, { count: 1, reset: maintenant + fenetreMs });
    return null;
  }

  e.count++;
  if (e.count > max) {
    const resetSec = Math.ceil((e.reset - maintenant) / 1000);
    return NextResponse.json(
      { erreur: `Trop de tentatives. Veuillez réessayer dans ${resetSec} seconde(s).` },
      { status: 429, headers: { "Retry-After": String(resetSec) } }
    );
  }
  return null;
}
