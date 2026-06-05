// ─────────────────────────────────────────────────────────────
// Logique métier des contrats — fenêtre de relance de renouvellement.
//
// Règle KARHON : on relance le client AVANT le terme du contrat, avec un
// délai qui dépend de la durée souscrite :
//   • 1 mois  → 1 semaine avant   (7 jours)
//   • 2 mois  → 2 semaines avant   (14 jours)
//   • 3 mois  → ~1 mois avant      (35 jours)
//   • 6 mois  → 2 mois avant       (60 jours)
//   • 12 mois → 3 mois avant       (90 jours)
// Pour toute autre durée, on prend la règle la plus proche en-dessous.
// ─────────────────────────────────────────────────────────────

// Délai de relance (en jours avant la date de fin) selon la durée souscrite.
export function delaiRelanceJours(dureeMois: number): number {
  if (dureeMois <= 1) return 7;
  if (dureeMois <= 2) return 14;
  if (dureeMois <= 3) return 35;
  if (dureeMois <= 6) return 60;
  return 90; // 12 mois (et plus)
}

const JOUR_MS = 24 * 60 * 60 * 1000;

export type InfoRelance = {
  joursRestants: number;   // jours avant le terme (négatif si déjà expiré)
  dateRelance: Date;       // date à partir de laquelle il faut relancer
  fenetreOuverte: boolean; // true si on est dans la fenêtre (à relancer)
  expire: boolean;         // true si le terme est dépassé
};

// Calcule l'état de relance d'un contrat à une date donnée (par défaut maintenant).
export function infoRelance(
  dateFin: Date | string,
  dureeMois: number,
  maintenant: Date = new Date()
): InfoRelance {
  const fin = typeof dateFin === "string" ? new Date(dateFin) : dateFin;
  const delai = delaiRelanceJours(dureeMois);
  const dateRelance = new Date(fin.getTime() - delai * JOUR_MS);

  const joursRestants = Math.ceil((fin.getTime() - maintenant.getTime()) / JOUR_MS);
  const expire = maintenant.getTime() > fin.getTime();
  // On est "à relancer" si on a atteint la date de relance et que le contrat
  // n'est pas encore expiré.
  const fenetreOuverte = maintenant.getTime() >= dateRelance.getTime() && !expire;

  return { joursRestants, dateRelance, fenetreOuverte, expire };
}

// Ajoute un nombre de mois à une date (utilitaire pour calculer la date de fin).
export function ajouterMois(date: Date, mois: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + mois);
  return d;
}
