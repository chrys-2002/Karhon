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
  logo?: string;           // chemin dans /public (optionnel : sinon initiales)
  rang: number;            // rang non-vie (conservé en interne, NON affiché publiquement)
  caNonVie: string;        // chiffre d'affaires non-vie (interne)
  partDeMarche: string;    // part de marché non-vie (interne)
  cout: 1 | 2 | 3;         // 1 = €, 2 = €€, 3 = €€€ (interne)
  apropos: string;         // courte présentation
  specialites: string[];   // produits que la compagnie traite le mieux
  forces: string[];        // avantages clés
  garanties: string[];     // garanties phares proposées
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
      "Née du rapprochement des groupes Sanlam et Allianz, c'est un assureur de référence en Côte d'Ivoire, adossé à un groupe panafricain et international, particulièrement solide sur les risques d'entreprise.",
    specialites: ["Assurance des entreprises", "Flottes automobiles", "Transport & marchandises", "Risques industriels", "Multirisque habitation"],
    forces: [
      "Solidité financière d'un groupe panafricain et mondial",
      "Gamme IARD très complète : auto, habitation, entreprise, transport",
      "Forte capacité sur les grands risques et les flottes",
      "Réseau d'agences étendu et standards internationaux",
      "Expertise reconnue en assurance des entreprises et risques industriels",
    ],
    garanties: [
      "Responsabilité civile (auto, habitation, entreprise)",
      "Dommages tous accidents & tous risques",
      "Vol, incendie et dégâts des eaux",
      "Bris de glace et assistance routière",
      "Couverture des marchandises transportées",
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
      "Compagnie ivoirienne en forte progression, GNA s'appuie sur une stratégie de proximité et des tarifs compétitifs, très appréciée des particuliers pour l'auto et l'habitation.",
    specialites: ["Assurance automobile", "Multirisque habitation", "Assurance des professionnels", "Voyage & assistance"],
    forces: [
      "Positionnement tarifaire parmi les plus accessibles",
      "Croissance soutenue ces dernières années",
      "Réactivité reconnue sur la gestion des sinistres",
      "Ancrage et proximité avec la clientèle ivoirienne",
      "Bon rapport garanties / prix sur l'auto et l'habitation",
    ],
    garanties: [
      "Responsabilité civile automobile et habitation",
      "Vol, incendie et dégâts des eaux",
      "Dommages au véhicule & bris de glace",
      "Assistance et dépannage",
      "Garantie du conducteur",
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
      "Filiale du groupe panafricain SUNU, présent dans une quinzaine de pays. Particulièrement reconnue en assurance vie, épargne et prévoyance, avec une offre vie + non-vie équilibrée.",
    specialites: ["Assurance vie & épargne", "Prévoyance & retraite", "Santé / prévoyance collective", "Assurance automobile"],
    forces: [
      "Référence en assurance vie (épargne et prévoyance)",
      "Présence panafricaine dans de nombreux pays",
      "Offre complète couvrant vie et non-vie",
      "Expertise reconnue en prévoyance et retraite",
      "Solutions d'épargne adaptées aux particuliers et entreprises",
    ],
    garanties: [
      "Capital décès et rente de prévoyance",
      "Épargne retraite et constitution de capital",
      "Garanties santé et frais médicaux",
      "Responsabilité civile et dommages auto",
      "Assistance aux assurés",
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
      "Pilier du groupe NSIA (banque + assurance) présent dans une douzaine de pays africains. Acteur majeur de l'assurance vie et pionnier de la digitalisation des services.",
    specialites: ["Assurance vie & bancassurance", "Santé / frais médicaux", "Assurance automobile", "Assurance des professionnels"],
    forces: [
      "Acteur de premier plan en assurance vie",
      "Synergie bancassurance avec le groupe NSIA Banque",
      "Forte dynamique d'innovation et de services digitaux",
      "Marque très implantée en Afrique de l'Ouest et centrale",
      "Large réseau d'agences et de partenaires bancaires",
    ],
    garanties: [
      "Capital décès et épargne vie",
      "Garanties santé et hospitalisation",
      "Responsabilité civile et dommages auto",
      "Vol, incendie et multirisque",
      "Services et suivi digitalisés",
    ],
  },
  {
    nom: "SIM Assurances",
    logo: "/images/logo/SIM.png",
    rang: 5,
    caNonVie: "n.c.",
    partDeMarche: "n.c.",
    cout: 1,
    apropos:
      "Compagnie ivoirienne présente sur le marché des dommages, SIM mise sur la proximité et des offres accessibles pour les particuliers et les professionnels, avec une relation client directe.",
    specialites: ["Assurance automobile", "Multirisque habitation", "Assurance des professionnels", "Individuelle accident"],
    forces: [
      "Tarifs accessibles pour les particuliers",
      "Relation client de proximité",
      "Souscription simple et rapide",
      "Bon rapport garanties / prix sur l'auto",
      "Réactivité dans le suivi des dossiers",
    ],
    garanties: [
      "Responsabilité civile automobile et habitation",
      "Vol, incendie et dégâts des eaux",
      "Dommages au véhicule et bris de glace",
      "Garantie individuelle accident",
      "Assistance et dépannage",
    ],
  },
  {
    nom: "Activa Assurances",
    logo: "/images/logo/ACTIVA.png",
    rang: 6,
    caNonVie: "n.c.",
    partDeMarche: "n.c.",
    cout: 3,
    apropos:
      "Membre du réseau panafricain Activa, la compagnie est particulièrement à l'aise sur les risques d'entreprise et la santé internationale, avec une capacité à couvrir des clients présents dans plusieurs pays africains.",
    specialites: ["Assurance des entreprises", "Santé internationale", "Transport & risques spéciaux", "Responsabilité civile professionnelle"],
    forces: [
      "Réseau panafricain pour les clients multi-pays",
      "Expertise pointue sur les risques d'entreprise",
      "Solutions santé internationales pour cadres et expatriés",
      "Capacité technique sur les risques complexes",
      "Standards de service orientés grandes entreprises",
    ],
    garanties: [
      "Responsabilité civile entreprise et professionnelle",
      "Santé et évacuation sanitaire internationale",
      "Dommages aux biens et pertes d'exploitation",
      "Transport, marchandises et risques spéciaux",
      "Assistance aux personnes à l'international",
    ],
  },
  {
    nom: "AFG Assurances",
    logo: "/images/logo/AFG.jpg",
    rang: 7,
    caNonVie: "n.c.",
    partDeMarche: "n.c.",
    cout: 2,
    apropos:
      "Filiale d'assurance d'un groupe financier panafricain, AFG s'appuie sur une forte synergie de bancassurance pour proposer des couvertures auto, habitation et entreprise accessibles via un réseau bancaire étendu.",
    specialites: ["Bancassurance", "Assurance automobile", "Multirisque habitation", "Assurance des entreprises"],
    forces: [
      "Distribution facilitée par un réseau bancaire de groupe",
      "Souscription et paiement simplifiés pour les clients bancarisés",
      "Offres packagées auto + habitation pour les particuliers",
      "Bonne couverture des PME et professionnels",
      "Appui d'un groupe financier régional",
    ],
    garanties: [
      "Responsabilité civile automobile et habitation",
      "Vol, incendie et dégâts des eaux",
      "Dommages au véhicule et bris de glace",
      "Multirisque professionnelle et locaux",
      "Assistance et dépannage",
    ],
  },
  {
    nom: "WAFA Assurance",
    logo: "/images/logo/WAFA.jpg",
    rang: 8,
    caNonVie: "n.c.",
    partDeMarche: "n.c.",
    cout: 3,
    apropos:
      "Filiale d'un grand groupe bancaire et d'assurance d'Afrique du Nord, WAFA apporte des standards techniques élevés et une solide capacité sur l'automobile, l'entreprise et la bancassurance.",
    specialites: ["Assurance automobile", "Assurance des entreprises", "Bancassurance", "Risques industriels"],
    forces: [
      "Adossement à un grand groupe bancaire international",
      "Standards techniques et de gestion élevés",
      "Forte capacité sur l'auto et les risques d'entreprise",
      "Synergies de bancassurance",
      "Process de souscription structurés",
    ],
    garanties: [
      "Responsabilité civile automobile et entreprise",
      "Dommages tous accidents et tous risques",
      "Vol, incendie et dégâts des eaux",
      "Bris de glace et assistance routière",
      "Couverture des risques professionnels et industriels",
    ],
  },
  {
    nom: "Leadway Assurance",
    logo: "/images/logo/leadway.webp",
    rang: 9,
    caNonVie: "n.c.",
    partDeMarche: "n.c.",
    cout: 3,
    apropos:
      "Compagnie d'origine nigériane à dimension régionale, reconnue pour sa capacité technique sur les grands risques, l'entreprise et les couvertures spécialisées.",
    specialites: ["Assurance des entreprises", "Grands risques & industrie", "Transport & marchandises", "Responsabilité civile professionnelle"],
    forces: [
      "Expérience reconnue sur les grands risques",
      "Capacité technique pour les entreprises et l'industrie",
      "Dimension régionale en Afrique de l'Ouest",
      "Accompagnement sur les couvertures spécialisées",
      "Solidité dans la gestion des sinistres complexes",
    ],
    garanties: [
      "Responsabilité civile entreprise et professionnelle",
      "Dommages aux biens et pertes d'exploitation",
      "Transport, marchandises et risques spéciaux",
      "Incendie et risques industriels",
      "Assistance et services aux entreprises",
    ],
  },
  {
    nom: "Vitalis",
    logo: "/images/logo/VITALIS.png",
    rang: 10,
    caNonVie: "n.c.",
    partDeMarche: "n.c.",
    cout: 2,
    apropos:
      "Spécialiste de la santé et de la prévoyance, Vitalis se concentre sur les frais médicaux, l'assistance et les couvertures santé pour les particuliers, les familles et les entreprises.",
    specialites: ["Assurance santé", "Prévoyance & assistance", "Santé collective (entreprises)", "Frais médicaux"],
    forces: [
      "Expertise centrée sur la santé et la prévoyance",
      "Réseau de soins et tiers payant",
      "Solutions santé pour individus comme pour groupes",
      "Gestion réactive des remboursements",
      "Assistance médicale dédiée",
    ],
    garanties: [
      "Frais médicaux et hospitalisation",
      "Consultations, pharmacie et analyses",
      "Optique et dentaire",
      "Assistance et évacuation sanitaire",
      "Capital prévoyance et soutien aux familles",
    ],
  },
];
