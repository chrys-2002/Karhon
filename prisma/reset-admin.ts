// ─────────────────────────────────────────────────────────────
// Script de dépannage : diagnostique et réinitialise le compte admin.
//
//  • Affiche tous les comptes ayant le rôle "admin" (pour vérifier l'email).
//  • Réinitialise le mot de passe de ADMIN_EMAIL à ADMIN_PASSWORD
//    (le crée s'il n'existe pas).
//
// Lancer :  npx tsx prisma/reset-admin.ts
//
// ⚠️ Sécurité : change ADMIN_PASSWORD ci-dessous si tu veux un autre
// mot de passe, puis relance. Ne committe pas un vrai mot de passe de prod.
// ─────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "gerant@karhon.ci";
const ADMIN_PASSWORD = "AdMin#2020";

async function main() {
  // 1) Liste le personnel existant (table Admin) pour vérifier les emails.
  const admins = await prisma.admin.findMany({
    select: { email: true, nom: true, prenom: true, role: true },
  });
  console.log("Comptes du personnel en base (table Admin) :");
  console.table(admins);

  // 2) Réinitialise (ou crée) un compte gérant avec un mot de passe connu.
  const motDePasse = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: { motDePasse, role: "gerant" },
    create: {
      nom: "KARHON",
      prenom: "Gérant",
      email: ADMIN_EMAIL,
      motDePasse,
      role: "gerant",
    },
  });

  console.log("\n✅ Mot de passe réinitialisé.");
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
