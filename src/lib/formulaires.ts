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

// ── Questionnaires (version essentielle, adaptée à chaque produit) ──
export const FORMULAIRES: Record<string, Champ[]> = {

  // ===================== PARTICULIERS (IARD) =====================

  "Assurance Automobile": [
    { id: "valeurVehicule", label: "Valeur actuelle du véhicule", type: "number", suffixe: "FCFA", requis: true },
    { id: "formule", label: "Formule souhaitée", type: "select", options: ["Tiers simple", "Tiers amélioré", "Tiers + Vol et Incendie", "Tous risques"] },
  ],

  "Assurance Habitation": [
    { id: "qualite", label: "Qualité du proposant", type: "select", options: ["Propriétaire occupant", "Propriétaire occupant partiel", "Propriétaire non occupant", "Locataire", "Occupant (logement de fonction)"], requis: true },
    { id: "valeurBatiment", label: "Valeur du bâtiment", type: "number", suffixe: "FCFA", requis: true, aide: "À déclarer si vous êtes propriétaire." },
    { id: "valeurRisquesLocatifs", label: "Valeur des risques locatifs", type: "number", suffixe: "FCFA", aide: "Pour propriétaire occupant partiel ou non occupant." },
    { id: "nombreEtages", label: "Nombre d'étages", type: "number" },
    { id: "nombrePieces", label: "Nombre de pièces", type: "number", requis: true },
    { id: "superficie", label: "Superficie développée", type: "number", suffixe: "m²", requis: true },
    { id: "natureConstruction", label: "Nature de la construction", type: "select", options: ["Dur (béton / parpaing)", "Semi-dur", "Bois / préfabriqué", "Autre"], requis: true },
    { id: "natureCouverture", label: "Nature de la couverture (toit)", type: "select", options: ["Dalle béton", "Tuiles", "Tôles", "Autre"], requis: true },
    { id: "montantContenu", label: "Montant total du contenu", type: "number", suffixe: "FCFA", requis: true, aide: "Mobilier et biens à l'intérieur." },
    { id: "valeurObjetsPrecieux", label: "Dont objets précieux (bijoux, or…)", type: "number", suffixe: "FCFA", aide: "Limité à environ 30 % du contenu." },
    { id: "valeurMaterielInfo", label: "Dont matériel informatique et électronique", type: "number", suffixe: "FCFA" },
    { id: "protectionVol", label: "Moyens de protection contre le vol", type: "checkbox", options: ["Aucun", "Porte blindée", "Grilles / barreaux", "Gardien", "Alarme anti-intrusion"], pleineLargeur: true },
    { id: "garanties", label: "Garanties souhaitées", type: "checkbox", options: ["Incendie et risques assimilés (obligatoire)", "Dégâts des eaux", "Vol", "Bris de glaces", "RC famille / immeuble", "Bris de machine"], requis: true, pleineLargeur: true, aide: "L'incendie est la garantie de base." },
  ],

  "Assurance Santé": [
    { id: "composition", label: "Type de couverture", type: "select", options: ["Individuelle", "Famille"], requis: true },
    { id: "nombrePersonnes", label: "Nombre de personnes à couvrir", type: "number", requis: true },
    { id: "ageAssurePrincipal", label: "Âge de l'assuré principal", type: "number", requis: true },
    { id: "agesBeneficiaires", label: "Âges des autres bénéficiaires", type: "text", aide: "Séparez par des virgules. Ex. 38, 12, 9." },
    { id: "niveauCouverture", label: "Niveau de couverture souhaité", type: "select", options: ["Essentiel", "Confort", "Premium"], requis: true },
    { id: "precisionSante", label: "Précisions sur l'état de santé (si applicable)", type: "textarea", pleineLargeur: true },
  ],

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

  "Assurance Voyage": [
    { id: "dateDepart", label: "Date de départ", type: "date", requis: true },
    { id: "dateRetour", label: "Date de retour", type: "date", requis: true },
  ],

  "Responsabilité Civile": [
    { id: "situation", label: "Votre situation", type: "select", options: ["Chef de famille", "Propriétaire", "Locataire", "Étudiant"], requis: true },
    { id: "compositionFoyer", label: "Composition du foyer", type: "text", requis: true, aide: "Ex. 2 adultes, 3 enfants." },
    { id: "animaux", label: "Présence d'animaux domestiques ?", type: "select", options: ["Non", "Oui"] },
    { id: "precisionAnimaux", label: "Si oui : type et nombre d'animaux", type: "text" },
    { id: "piscine", label: "Présence d'une piscine ?", type: "select", options: ["Non", "Oui"] },
    { id: "capitalGarantie", label: "Montant de garantie souhaité", type: "number", suffixe: "FCFA", requis: true },
    { id: "sinistresRC", label: "Sinistres de responsabilité ces 3 dernières années ?", type: "select", options: ["Aucun", "1", "2 ou plus"] },
  ],

  // ===================== PROFESSIONNELLES (IARD) =====================

  "Automobile Flotte": [
    { id: "nombreVehicules", label: "Nombre de véhicules à assurer", type: "number", requis: true },
    { id: "typesVehicules", label: "Types de véhicules", type: "checkbox", options: ["Voitures particulières", "Véhicules utilitaires", "Poids lourds", "Engins / matériels", "Deux-roues"], requis: true, pleineLargeur: true },
    { id: "usageFlotte", label: "Usage principal", type: "select", options: ["Déplacements professionnels", "Transport de marchandises", "Transport de personnes", "Mixte"], requis: true },
    { id: "valeurParc", label: "Valeur totale du parc", type: "number", suffixe: "FCFA", requis: true },
    { id: "zoneCirculation", label: "Zone de circulation", type: "select", options: ["Urbaine", "Nationale", "Sous-régionale (CEDEAO)"], requis: true },
    { id: "sinistresFlotte", label: "Sinistralité des 12 derniers mois", type: "select", options: ["Aucun sinistre", "1 à 3 sinistres", "Plus de 3 sinistres"], requis: true },
    { id: "formule", label: "Formule souhaitée", type: "select", options: ["Responsabilité civile", "Tiers + Vol et Incendie", "Tous risques"], requis: true },
  ],

  "Multirisque Pro": [
    { id: "activite", label: "Nature de l'activité exercée", type: "text", requis: true },
    { id: "adresseLocaux", label: "Adresse des locaux", type: "text", requis: true },
    { id: "statutOccupation", label: "Statut d'occupation des locaux", type: "select", options: ["Propriétaire", "Locataire", "Occupant à titre gratuit"], requis: true },
    { id: "surfaceLocaux", label: "Surface des locaux", type: "number", suffixe: "m²", requis: true },
    { id: "valeurBatiment", label: "Valeur du bâtiment (si propriétaire)", type: "number", suffixe: "FCFA" },
    { id: "valeurMateriel", label: "Valeur du matériel et mobilier professionnel", type: "number", suffixe: "FCFA", requis: true },
    { id: "valeurMarchandises", label: "Valeur des marchandises / stock", type: "number", suffixe: "FCFA" },
    { id: "chiffreAffaires", label: "Chiffre d'affaires annuel", type: "number", suffixe: "FCFA", requis: true },
    { id: "effectif", label: "Nombre de salariés", type: "number", requis: true },
    { id: "garanties", label: "Garanties souhaitées", type: "checkbox", options: ["Incendie et risques assimilés", "Dégâts des eaux", "Vol", "Bris de glaces", "RC exploitation", "Perte d'exploitation"], requis: true, pleineLargeur: true },
  ],

  "RC Professionnelle": [
    { id: "profession", label: "Profession / activité exercée", type: "text", requis: true },
    { id: "chiffreAffaires", label: "Chiffre d'affaires annuel", type: "number", suffixe: "FCFA", requis: true },
    { id: "effectif", label: "Nombre de salariés", type: "number", requis: true },
    { id: "zoneIntervention", label: "Zone d'intervention", type: "select", options: ["Locale", "Nationale", "Sous-régionale", "Internationale"], requis: true },
    { id: "sousTraitance", label: "Faites-vous appel à la sous-traitance ?", type: "select", options: ["Non", "Oui"] },
    { id: "capitalGarantie", label: "Montant de garantie souhaité", type: "number", suffixe: "FCFA", requis: true },
    { id: "reclamations", label: "Réclamations reçues ces 3 dernières années ?", type: "select", options: ["Aucune", "1", "2 ou plus"] },
  ],

  "Assurance Maritime": [
    { id: "typeCouverture", label: "Type de couverture", type: "select", options: ["Facultés (marchandises transportées)", "Corps de navire", "Responsabilité de l'armateur"], requis: true },
    { id: "natureMarchandise", label: "Nature de la marchandise / du bien", type: "text", requis: true },
    { id: "valeurAssuree", label: "Valeur à assurer", type: "number", suffixe: "FCFA", requis: true },
    { id: "trajet", label: "Trajet (port de départ → port d'arrivée)", type: "text", requis: true, pleineLargeur: true },
    { id: "modeTransport", label: "Mode de transport", type: "select", options: ["Maritime", "Maritime + terrestre", "Multimodal"], requis: true },
    { id: "frequence", label: "Fréquence", type: "select", options: ["Au voyage", "À l'année (police d'abonnement)"], requis: true },
  ],

  // ===================== VIE (épargne / prévoyance) =====================

  "Assurance Retraite": [
    { id: "dateNaissance", label: "Date de naissance de l'assuré", type: "date", requis: true },
    { id: "ageDepart", label: "Âge de départ à la retraite souhaité", type: "number", requis: true },
    { id: "cotisation", label: "Montant de cotisation souhaité", type: "number", suffixe: "FCFA", requis: true },
    { id: "periodicite", label: "Périodicité des cotisations", type: "select", options: ["Mensuelle", "Trimestrielle", "Semestrielle", "Annuelle"], requis: true },
    { id: "sortie", label: "Forme de sortie souhaitée", type: "select", options: ["Capital", "Rente", "Mixte (capital + rente)"], requis: true },
    { id: "beneficiaire", label: "Bénéficiaire en cas de décès", type: "text" },
  ],

  "Étude Plus": [
    { id: "nomEnfant", label: "Nom de l'enfant bénéficiaire", type: "text", requis: true },
    { id: "dateNaissanceEnfant", label: "Date de naissance de l'enfant", type: "date", requis: true },
    { id: "ageVersement", label: "Âge de l'enfant au versement du capital", type: "number", requis: true, aide: "Ex. 18 ans, pour les études supérieures." },
    { id: "cotisation", label: "Montant de cotisation souhaité", type: "number", suffixe: "FCFA", requis: true },
    { id: "periodicite", label: "Périodicité des cotisations", type: "select", options: ["Mensuelle", "Trimestrielle", "Semestrielle", "Annuelle"], requis: true },
    { id: "capitalSouhaite", label: "Capital final souhaité", type: "number", suffixe: "FCFA" },
    { id: "souscripteur", label: "Lien avec l'enfant", type: "select", options: ["Parent", "Tuteur", "Autre"], requis: true },
  ],

  "Vie Emprunteur": [
    { id: "montantPret", label: "Montant du prêt à garantir", type: "number", suffixe: "FCFA", requis: true },
    { id: "dureePret", label: "Durée du prêt", type: "number", suffixe: "mois", requis: true },
    { id: "typePret", label: "Type de prêt", type: "select", options: ["Prêt personnel", "Prêt immobilier", "Prêt professionnel"], requis: true },
    { id: "organismePreteur", label: "Organisme prêteur", type: "text" },
    { id: "dateNaissance", label: "Date de naissance de l'emprunteur", type: "date", requis: true },
    { id: "garanties", label: "Garanties souhaitées", type: "checkbox", options: ["Décès", "Invalidité permanente", "Incapacité de travail", "Perte d'emploi"], requis: true, pleineLargeur: true },
    { id: "etatSante", label: "Problème de santé connu ?", type: "select", options: ["Non", "Oui"], requis: true },
    { id: "precisionSante", label: "Précisions sur l'état de santé (si applicable)", type: "textarea", pleineLargeur: true },
  ],

  "Assistance Funéraire": [
    { id: "nombrePersonnes", label: "Nombre de personnes à couvrir", type: "number", requis: true },
    { id: "agesAssures", label: "Âge(s) des personnes à couvrir", type: "text", requis: true, aide: "Séparez par des virgules." },
    { id: "prestation", label: "Type de prestation souhaitée", type: "select", options: ["Capital (versement d'une somme)", "Prestations d'obsèques (services)", "Mixte"], requis: true },
    { id: "capitalSouhaite", label: "Capital / budget obsèques souhaité", type: "number", suffixe: "FCFA", requis: true },
    { id: "beneficiaire", label: "Personne chargée d'organiser les obsèques", type: "text" },
  ],
};

// Renvoie le questionnaire d'un produit (vide si aucun n'est défini).
export function formulaireDe(produitNom?: string | null): Champ[] {
  if (!produitNom) return [];
  return FORMULAIRES[produitNom] ?? [];
}

// Type des réponses : id du champ → valeur (string ou liste pour les checkbox).
export type Reponses = Record<string, string | string[]>;
