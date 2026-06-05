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

const ADMIN_EMAIL = "admin@karhon.ci";
const ADMIN_PASSWORD = "AdMin#2020";

async function main() {
  // 1) Liste les admins existants pour vérifier quel email est réellement en base.
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { email: true, nom: true, prenom: true },
  });
  console.log("Comptes admin en base :");
  console.table(admins);

  // 2) Réinitialise (ou crée) le compte admin avec un mot de passe connu.
  const motDePasse = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { motDePasse, role: "admin" },
    create: {
      nom: "KARHON",
      prenom: "Admin",
      email: ADMIN_EMAIL,
      telephone: "+225 07 87 10 39 39",
      motDePasse,
      role: "admin",
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
