// ─────────────────────────────────────────────────────────────
// Seed — remplit la base avec des données de départ.
// Lancer : npm run db:seed   (après la migration)
// ─────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Catalogue complet. Le champ `categorie` reprend les 3 familles du
// formulaire de devis (particuliers / professionnelles / vie) pour que
// le front puisse regrouper les produits chargés depuis la base.
const produits = [
  // ── Particuliers ───────────────────────────────────────────
  {
    nom: "Assurance Automobile",
    type: "IARD" as const,
    categorie: "particuliers",
    description: "Couverture complète pour votre véhicule : responsabilité civile, dommages, vol et incendie.",
    garanties: ["Responsabilité civile", "Tous risques", "Vol & incendie", "Assistance 24/7"],
  },
  {
    nom: "Assurance Habitation",
    type: "IARD" as const,
    categorie: "particuliers",
    description: "Protégez votre logement et vos biens contre les sinistres du quotidien.",
    garanties: ["Incendie", "Dégâts des eaux", "Vol", "Responsabilité civile"],
  },
  {
    nom: "Assurance Santé",
    type: "IARD" as const,
    categorie: "particuliers",
    description: "Prise en charge de vos frais médicaux pour vous et votre famille.",
    garanties: ["Hospitalisation", "Consultations", "Pharmacie", "Optique & dentaire"],
  },
  {
    nom: "Individuelle Accident",
    type: "IARD" as const,
    categorie: "particuliers",
    description: "Indemnisation en cas d'accident corporel de la vie privée ou professionnelle.",
    garanties: ["Invalidité", "Décès accidentel", "Frais médicaux", "Capital"],
  },
  {
    nom: "Assurance Voyage",
    type: "IARD" as const,
    categorie: "particuliers",
    description: "Assistance et couverture pendant vos déplacements à l'étranger.",
    garanties: ["Frais médicaux à l'étranger", "Rapatriement", "Bagages", "Annulation"],
  },
  {
    nom: "Responsabilité Civile",
    type: "IARD" as const,
    categorie: "particuliers",
    description: "Couvre les dommages causés à autrui dans votre vie quotidienne.",
    garanties: ["Dommages corporels", "Dommages matériels", "Défense pénale"],
  },
  // ── Professionnelles ───────────────────────────────────────
  {
    nom: "Automobile Flotte",
    type: "IARD" as const,
    categorie: "professionnelles",
    description: "Gestion et couverture de l'ensemble de votre parc de véhicules.",
    garanties: ["Tous véhicules", "Responsabilité civile", "Assistance", "Gestion centralisée"],
  },
  {
    nom: "Multirisque Pro",
    type: "IARD" as const,
    categorie: "professionnelles",
    description: "Protection globale de vos locaux, matériels et activités professionnelles.",
    garanties: ["Incendie", "Vol", "Bris de matériel", "Pertes d'exploitation"],
  },
  {
    nom: "Assurance Santé",
    type: "IARD" as const,
    categorie: "professionnelles",
    description: "Couverture santé collective pour vos salariés.",
    garanties: ["Hospitalisation", "Soins courants", "Optique & dentaire", "Maternité"],
  },
  {
    nom: "RC Professionnelle",
    type: "IARD" as const,
    categorie: "professionnelles",
    description: "Couvre les dommages causés à des tiers dans le cadre de votre activité.",
    garanties: ["Faute professionnelle", "Dommages aux tiers", "Défense & recours"],
  },
  {
    nom: "Assurance Maritime",
    type: "IARD" as const,
    categorie: "professionnelles",
    description: "Couverture des marchandises et corps de navire lors du transport maritime.",
    garanties: ["Facultés (marchandises)", "Corps de navire", "Avaries", "Responsabilité"],
  },
  // ── Assurance Vie ──────────────────────────────────────────
  {
    nom: "Assurance Retraite",
    type: "VIE" as const,
    categorie: "vie",
    description: "Constituez un complément de revenu pour votre retraite.",
    garanties: ["Épargne", "Rente viagère", "Sortie en capital", "Fiscalité avantageuse"],
  },
  {
    nom: "Étude Plus",
    type: "VIE" as const,
    categorie: "vie",
    description: "Préparez le financement des études de vos enfants.",
    garanties: ["Capital garanti", "Versements souples", "Protection en cas de décès"],
  },
  {
    nom: "Vie Emprunteur",
    type: "VIE" as const,
    categorie: "vie",
    description: "Garantit le remboursement de votre prêt en cas d'aléa de la vie.",
    garanties: ["Décès", "Invalidité", "Incapacité de travail", "Perte d'emploi"],
  },
  {
    nom: "Assistance Funéraire",
    type: "VIE" as const,
    categorie: "vie",
    description: "Prend en charge l'organisation et les frais d'obsèques.",
    garanties: ["Capital obsèques", "Organisation", "Assistance aux proches"],
  },
];

async function main() {
  console.log("🌱 Seed en cours…");

  // Produits : on vide d'abord pour éviter les doublons à chaque relance.
  await prisma.produit.deleteMany();
  for (const p of produits) {
    await prisma.produit.create({ data: p });
  }
  console.log(`✅ ${produits.length} produits créés`);

  // Compte admin de démonstration.
  const motDePasse = await bcrypt.hash("AdMin#2020", 10);
  await prisma.user.upsert({
    where: { email: "admin@karhon.ci" },
    update: { motDePasse, role: "admin" },
    create: {
      nom: "KARHON",
      prenom: "Admin",
      email: "admin@karhon.ci",
      telephone: "+225 07 87 10 39 39",
      motDePasse,
      role: "admin",
    },
  });
  console.log("✅ Compte admin créé / mis à jour : admin@karhon.ci");

  console.log("🎉 Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
