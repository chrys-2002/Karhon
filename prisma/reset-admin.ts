// ─────────────────────────────────────────────────────────────
// Script de dépannage : diagnostique et réinitialise UN compte du personnel.
//
//  • Affiche tous les comptes de la table Admin (pour vérifier les e-mails).
//  • Réinitialise le mot de passe de ADMIN_EMAIL (le crée s'il n'existe pas,
//    par défaut en rôle "gerant").
//
// 🔐 Le mot de passe N'EST PAS dans le code : il est lu depuis l'environnement
//    (ADMIN_PASSWORD). L'e-mail est lu depuis ADMIN_EMAIL (défaut : gérant).
//
// Lancer en LOCAL (PowerShell) :
//   $env:ADMIN_PASSWORD="…"
//   npx tsx prisma/reset-admin.ts
//
// Lancer en PROD : ajoute $env:DATABASE_URL="<URL_NEON>" (puis ferme la fenêtre).
//   $env:DATABASE_URL="<URL_NEON>"; $env:ADMIN_PASSWORD="…"; $env:ADMIN_EMAIL="gerant@karhon.ci"
//   npx tsx prisma/reset-admin.ts
// ─────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "gerant@karhon.ci").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  if (!ADMIN_PASSWORD) {
    console.error("❌ Mot de passe manquant. Définis la variable d'environnement ADMIN_PASSWORD avant de lancer :");
    console.error('   $env:ADMIN_PASSWORD="…"');
    console.error("   npx tsx prisma/reset-admin.ts");
    process.exit(1);
  }

  // 1) Liste le personnel existant (sans afficher les mots de passe).
  const admins = await prisma.admin.findMany({ select: { email: true, nom: true, prenom: true, role: true } });
  console.log("Comptes du personnel en base (table Admin) :");
  console.table(admins);

  // 2) Réinitialise (ou crée) le compte ciblé avec un mot de passe connu.
  const motDePasse = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: { motDePasse },
    create: { nom: "KARHON", prenom: "Gérant", email: ADMIN_EMAIL, motDePasse, role: "gerant" },
  });

  console.log("\n✅ Mot de passe réinitialisé.");
  console.log(`   Email : ${ADMIN_EMAIL}`);
  console.log("   Mot de passe : (celui fourni dans ADMIN_PASSWORD)");
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
