// ─────────────────────────────────────────────────────────────
// Script ponctuel : renomme les anciens produits santé
// ("Santé Individuelle" / "Santé Groupe") en "Assurance Santé".
//
// Contrairement au seed, il NE supprime rien → fonctionne même si
// des devis existent déjà (pas de blocage de clé étrangère).
//
// Lancer :  npx tsx prisma/rename-sante.ts
// ─────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const resultat = await prisma.produit.updateMany({
    where: { nom: { in: ["Santé Individuelle", "Santé Groupe"] } },
    data: { nom: "Assurance Santé" },
  });
  console.log(`✅ ${resultat.count} produit(s) renommé(s) en "Assurance Santé".`);

  // Affiche l'état final pour vérification.
  const sante = await prisma.produit.findMany({
    where: { nom: { contains: "Santé" } },
    select: { nom: true, categorie: true },
  });
  console.table(sante);
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
