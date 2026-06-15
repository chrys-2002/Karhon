// ─────────────────────────────────────────────────────────────
// Utilitaires d'authentification — KARHON Assurances
//
// Deux briques de sécurité :
//  1) HACHAGE des mots de passe (bcrypt) : on ne stocke JAMAIS un
//     mot de passe en clair. bcrypt le transforme en empreinte
//     irréversible + ajoute un "sel" contre les attaques par table.
//  2) JETONS JWT : après connexion, on délivre un jeton signé qui
//     prouve l'identité de l'utilisateur sans redemander le mot de
//     passe à chaque requête. Le jeton est stocké dans un cookie.
// ─────────────────────────────────────────────────────────────
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
const JWT_EXPIRES_IN = "7d"; // durée de validité du jeton

if (!JWT_SECRET) {
  // Avertit clairement si la clé secrète manque (mauvaise config .env).
  console.warn("[auth] JWT_SECRET manquant — vérifie ton fichier .env");
}

// Données que l'on glisse dans le jeton (jamais le mot de passe !).
export type Role = "client" | "agent" | "gerant" | "admin";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

// ── Mots de passe ────────────────────────────────────────────

// Transforme un mot de passe en empreinte sécurisée (à stocker en base).
export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  const sel = await bcrypt.genSalt(10);
  return bcrypt.hash(motDePasse, sel);
}

// Compare un mot de passe saisi avec l'empreinte stockée.
export async function verifierMotDePasse(
  motDePasse: string,
  empreinte: string
): Promise<boolean> {
  return bcrypt.compare(motDePasse, empreinte);
}

// ── Téléphone ────────────────────────────────────────────────

// Normalise un numéro pour un stockage/recherche cohérents :
// retire espaces et séparateurs, et l'indicatif Côte d'Ivoire (+225 / 225).
// Ainsi « +225 05 46 17 51 85 » et « 0546175185 » donnent le même résultat.
export function normaliserTelephone(tel: string): string {
  let chiffres = String(tel).replace(/\D/g, ""); // chiffres uniquement
  if (chiffres.startsWith("225")) chiffres = chiffres.slice(3);
  return chiffres;
}

// Détecte si un identifiant ressemble à un email (sinon : téléphone).
export function estEmail(valeur: string): boolean {
  return valeur.includes("@");
}

// ── Jetons JWT ───────────────────────────────────────────────

// Crée un jeton signé contenant l'identité de l'utilisateur.
export function genererToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Vérifie et décode un jeton. Renvoie null s'il est invalide/expiré.
export function verifierToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
