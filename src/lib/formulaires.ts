// ─────────────────────────────────────────────────────────────
// Questionnaires par produit — un SEUL formulaire dynamique, piloté par
// cette configuration. Pour chaque produit, on décrit la liste des questions.
//
// 👉 Pour ajouter/modifier un produit : on touche UNIQUEMENT ce fichier.
//    Le composant <FormulaireDynamique> génère automatiquement les champs.
//
// La clé de chaque entrée = le NOM EXACT du produit en base (produit.nom).
// ─────────────────────────────────────────────────────────────

export type ChampType = "text" | "number" | "select" | "checkbox" | "date" | "textarea";

export type Champ = {
  id: string;            // identifiant technique (clé de la réponse)
  label: string;         // question affichée
  type: ChampType;
  options?: string[];    // pour select (1 choix) et checkbox (plusieurs)
  requis?: boolean;
  aide?: string;         // petite aide sous le champ
  suffixe?: string;      // ex. "FCFA"
  pleineLargeur?: boolean; // occupe toute la largeur (textarea, checkbox…)
};

// ── Questionnaires (version essentielle) ─────────────────────
export const FORMULAIRES: Record<string, Champ[]> = {
  // Source : « Proposition d'assurance individuelle contre les accidents corporels ».
  "Individuelle Accident": [
    { id: "personneAssuree", label: "Nom de la personne à assurer", type: "text", requis: true, aide: "Si différente du souscripteur." },
    { id: "dateNaissance", label: "Date de naissance de l'assuré", type: "date", requis: true },
    { id: "lieuNaissance", label: "Lieu de naissance de l'assuré", type: "text" },
    { id: "profession", label: "Profession / activité exercée", type: "text", requis: true },
    { id: "capitalDeces", label: "Capital décès souhaité", type: "number", suffixe: "FCFA", requis: true },
    { id: "beneficiaire", label: "Bénéficiaire(s) en cas de décès", type: "text", aide: "À défaut, le capital revient aux ayants droit de l'assuré." },
    { id: "capitalInvalidite", label: "Capital invalidité permanente souhaité", type: "number", suffixe: "FCFA" },
    { id: "allocationTemporaire", label: "Allocation invalidité temporaire (par jour)", type: "number", suffixe: "FCFA" },
    { id: "fraisTraitement", label: "Frais de traitement souhaités", type: "number", suffixe: "FCFA" },
    { id: "dateEffet", label: "Date d'effet souhaitée", type: "date", requis: true },
    { id: "travailManuel", label: "Travaille-t-il manuellement ?", type: "select", options: ["Non", "Occasionnellement", "Régulièrement"], requis: true },
    { id: "deplacements", label: "Déplacements professionnels fréquents ?", type: "select", options: ["Non", "Oui"], requis: true },
    { id: "sportsRisque", label: "Sports à risque pratiqués (en amateur)", type: "checkbox", options: ["Aucun", "Football", "Sports de neige", "Arts martiaux", "Plongée sous-marine", "Sports mécaniques", "Escalade / alpinisme"], pleineLargeur: true },
    { id: "etatSante", label: "Invalidité permanente ou maladie grave ?", type: "select", options: ["Non", "Oui"], requis: true, aide: "Si oui, précisez ci-dessous." },
    { id: "precisionSante", label: "Précisions sur l'état de santé (si applicable)", type: "textarea", pleineLargeur: true },
    { id: "dejaAssure", label: "Déjà assuré contre les accidents ces 2 dernières années ?", type: "select", options: ["Non", "Oui"] },
    { id: "compagniePrecedente", label: "Si oui : compagnie précédente et n° de contrat", type: "text", pleineLargeur: true },
    { id: "sinistre2ans", label: "Victime d'un accident ces 2 dernières années ?", type: "select", options: ["Non", "Oui"] },
  ],
};

// Renvoie le questionnaire d'un produit (vide si aucun n'est défini).
export function formulaireDe(produitNom?: string | null): Champ[] {
  if (!produitNom) return [];
  return FORMULAIRES[produitNom] ?? [];
}

// Type des réponses : id du champ → valeur (string ou liste pour les checkbox).
export type Reponses = Record<string, string | string[]>;
