// ─────────────────────────────────────────────────────────────
// Compagnies d'assurance partenaires de KARHON.
//
// C'est avec l'une d'elles que chaque contrat est conclu (le courtier
// négocie auprès des partenaires puis retient la meilleure offre).
//
// 👉 Pour ajouter / retirer un partenaire, modifie simplement cette liste.
//    (Certaines compagnies ci-dessous ne sont peut-être pas encore des
//     partenaires confirmés — retire-les tant que le partenariat n'est pas
//     officiel.)
// ─────────────────────────────────────────────────────────────
export const PARTENAIRES = [
  "NSIA Assurances",
  "SUNU Assurances",
  "Sanlam Allianz",
  "SIM Assurances",
  "Activa Assurances",
  "AFG Assurances",
  "WAFA Assurance",
  "Leadway Assurance",
  "GNA Assurances",
  "Vitalis",
] as const;

// Vérifie qu'un nom fait bien partie des partenaires connus.
export function estPartenaireValide(nom: unknown): nom is string {
  return typeof nom === "string" && (PARTENAIRES as readonly string[]).includes(nom);
}
