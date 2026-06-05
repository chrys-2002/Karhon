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
