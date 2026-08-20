// ─────────────────────────────────────────────────────────────
// Ajoute UNIQUEMENT les produits manquants au catalogue, sans jamais
// toucher aux produits existants (donc sans risque pour les devis/contrats
// déjà liés à un client réel). Contrairement à seed.ts, ce script ne vide
// jamais la table Produit.
//
// Lancer (local ou prod, selon DATABASE_URL) :
//   npx tsx prisma/ajouter-produits-manquants.ts
// ─────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const nouveauxProduits = [
  {
    nom: "Assurance Prêt Bancaire",
    type: "VIE" as const,
    categorie: "vie",
    description: "Garantit le remboursement de vos engagements bancaires en cas de décès ou d'invalidité.",
    garanties: ["Décès", "Invalidité totale", "Solde restant dû couvert", "Tranquillité familiale"],
  },
  {
    nom: "Assurance Caution",
    type: "VIE" as const,
    categorie: "vie",
    description: "Se substitue à vous pour garantir vos engagements financiers envers un tiers.",
    garanties: ["Garantie locative", "Garantie de marché", "Garantie douanière", "Libération de trésorerie"],
  },
];

async function main() {
  console.log("🔎 Vérification des produits manquants…\n");

  for (const p of nouveauxProduits) {
    const existant = await prisma.produit.findFirst({ where: { nom: p.nom } });
    if (existant) {
      console.log(`⏭️  « ${p.nom} » existe déjà (id: ${existant.id}) — ignoré.`);
      continue;
    }
    const cree = await prisma.produit.create({ data: p });
    console.log(`✅ « ${p.nom} » créé (id: ${cree.id}).`);
  }

  console.log("\nTerminé. Aucun produit existant n'a été modifié ou supprimé.");
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
