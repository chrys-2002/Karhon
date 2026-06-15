// ─────────────────────────────────────────────────────────────
// Tendances des compagnies partenaires de KARHON.
//
// Données de marché RÉELLES (branche non-vie, Côte d'Ivoire) —
// dernier classement officiel complet disponible (exercice 2024),
// confirmé par les tendances 2025. Sources : Financial Afrik,
// Sika Finance, 225 Assurances, Horonya Finance.
//
// Contexte 2025 : le marché ivoirien a atteint ~774 Md FCFA (+7,5 %),
// premier d'Afrique de l'Ouest ; Sanlam Allianz reste leader non-vie
// et SUNU leader vie.
//
// 👉 Le « coût » est un POSITIONNEMENT INDICATIF (€ économique →
//    €€€ premium), pas un prix réel : une prime dépend du produit,
//    du risque et du client. Ajuste librement.
//
// Mets simplement à jour cette liste chaque année.
// ─────────────────────────────────────────────────────────────

export type Tendance = {
  nom: string;
  logo: string;            // chemin dans /public
  rang: number;            // rang non-vie
  caNonVie: string;        // chiffre d'affaires non-vie
  partDeMarche: string;    // part de marché non-vie
  cout: 1 | 2 | 3;         // 1 = €, 2 = €€, 3 = €€€ (indicatif)
  apropos: string;         // courte présentation
  forces: string[];        // avantages clés
};

// Dernier exercice complet publié.
export const ANNEE_DONNEES = 2024;

// Contexte global du marché (affiché en haut de page).
export const CONTEXTE_MARCHE =
  "En 2025, le marché ivoirien de l'assurance atteint près de 774 milliards FCFA (+7,5 %), confortant sa place de leader en Afrique de l'Ouest.";

export const TENDANCES: Tendance[] = [
  {
    nom: "Sanlam Allianz",
    logo: "/images/logo/SANLAM.png",
    rang: 1,
    caNonVie: "106,5 Md FCFA",
    partDeMarche: "29,5 %",
    cout: 3,
    apropos:
      "Née du rapprochement des groupes Sanlam et Allianz, c'est aujourd'hui le premier assureur non-vie de Côte d'Ivoire, adossé à un géant panafricain et international.",
    forces: [
      "N°1 de la branche non-vie (29,5 % de part de marché)",
      "Solidité financière d'un groupe panafricain et mondial",
      "Gamme IARD très complète : auto, habitation, entreprise, transport",
      "Forte capacité sur les grands risques et les flottes",
      "Réseau d'agences étendu et standards internationaux",
      "Expertise en assurance des entreprises et risques industriels",
    ],
  },
  {
    nom: "GNA Assurances",
    logo: "/images/logo/GNA.jpg",
    rang: 2,
    caNonVie: "40,4 Md FCFA",
    partDeMarche: "11,2 %",
    cout: 1,
    apropos:
      "Compagnie ivoirienne en forte progression, GNA s'est hissée au 2e rang du non-vie grâce à une stratégie de proximité et des tarifs compétitifs.",
    forces: [
      "2e assureur non-vie du pays (11,2 % de part de marché)",
      "Positionnement tarifaire parmi les plus accessibles",
      "Croissance soutenue ces dernières années",
      "Réactivité reconnue sur la gestion des sinistres",
      "Ancrage et proximité avec la clientèle ivoirienne",
      "Bon rapport garanties / prix sur l'auto et l'habitation",
    ],
  },
  {
    nom: "SUNU Assurances",
    logo: "/images/logo/SUNU.png",
    rang: 3,
    caNonVie: "29,4 Md FCFA",
    partDeMarche: "8,1 %",
    cout: 2,
    apropos:
      "Filiale du groupe panafricain SUNU, présent dans une quinzaine de pays. Leader de l'assurance vie en Côte d'Ivoire, avec une offre vie + non-vie équilibrée.",
    forces: [
      "Leader de l'assurance vie (épargne et prévoyance)",
      "Présence panafricaine dans de nombreux pays",
      "Offre complète couvrant vie et non-vie",
      "Expertise reconnue en prévoyance et retraite",
      "Solutions d'épargne adaptées aux particuliers et entreprises",
      "Stabilité d'un groupe régional bien établi",
    ],
  },
  {
    nom: "NSIA Assurances",
    logo: "/images/logo/NSIA.png",
    rang: 4,
    caNonVie: "25,1 Md FCFA",
    partDeMarche: "6,9 %",
    cout: 2,
    apropos:
      "Pilier du groupe NSIA (banque + assurance) présent dans une douzaine de pays africains. Acteur majeur de l'assurance vie et pionnier de la digitalisation.",
    forces: [
      "Force majeure en assurance vie (≈ 19,6 % de part de marché vie)",
      "Synergie bancassurance avec le groupe NSIA Banque",
      "Forte dynamique d'innovation et de services digitaux",
      "Marque très implantée en Afrique de l'Ouest et centrale",
      "Large réseau d'agences et de partenaires bancaires",
      "Gamme couvrant particuliers, professionnels et entreprises",
    ],
  },
];
