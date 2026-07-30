// ─────────────────────────────────────────────────────────────
// Signature numérique des reçus — KARHON Assurances
//
// Chaque reçu porte un code de signature calculé côté serveur à partir de ses
// données clés (id, numéro, prime, dates) et d'une clé SECRÈTE. Impossible à
// recréer sans la clé, donc infalsifiable. La page /verifier confronte le code
// aux vraies données de la base pour attester l'authenticité.
//
// Clé : RECU_SECRET (à défaut JWT_SECRET). Doit rester côté serveur.
// ─────────────────────────────────────────────────────────────
import crypto from "crypto";

const SECRET = process.env.RECU_SECRET || process.env.JWT_SECRET || "karhon-dev-secret";

type DonneesRecu = {
  id: string;
  numeroContrat: string;
  primeAnnuelle: number;
  dateDebut: string | Date;
  dateFin: string | Date;
};

// Renvoie un code de 16 caractères hexadécimaux en majuscules (ex. "3F9A2C7B10E4D5A8").
export function signerRecu(c: DonneesRecu): string {
  const base = [
    c.id,
    c.numeroContrat,
    Math.round(Number(c.primeAnnuelle) || 0),
    new Date(c.dateDebut).toISOString(),
    new Date(c.dateFin).toISOString(),
  ].join("|");
  return crypto.createHmac("sha256", SECRET).update(base).digest("hex").slice(0, 16).toUpperCase();
}

// Vérifie qu'un code fourni correspond bien à la signature recalculée.
export function verifierRecu(c: DonneesRecu, code: string | null | undefined): boolean {
  if (!code) return false;
  const attendu = signerRecu(c);
  const fourni = code.trim().toUpperCase();
  if (fourni.length !== attendu.length) return false;
  // Comparaison à temps constant pour éviter les attaques par timing.
  return crypto.timingSafeEqual(Buffer.from(attendu), Buffer.from(fourni));
}
