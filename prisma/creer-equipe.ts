// ─────────────────────────────────────────────────────────────
// Crée / met à jour l'équipe de gestion KARHON :
//   • 1 gérant  (voit tout, restaure, purge, journal d'audit)
//   • 3 agents  (gèrent cotations/sinistres/contrats ; suppression = archivage)
//
// Identifiants DISTINCTS + mots de passe DISTINCTS → traçabilité réelle.
//
// 🔐 Les mots de passe NE SONT PAS dans le code : ils sont lus depuis des
//    variables d'environnement. Définis-les juste avant de lancer le script.
//
// Lancer en LOCAL (PowerShell) :
//   $env:GERANT_PASSWORD="…"; $env:AGENT1_PASSWORD="…"; $env:AGENT2_PASSWORD="…"; $env:AGENT3_PASSWORD="…"
//   npx tsx prisma/creer-equipe.ts
//
// Lancer en PROD (PowerShell) : ajoute aussi $env:DATABASE_URL="<URL_NEON>"
//   $env:DATABASE_URL="<URL_NEON>"; $env:GERANT_PASSWORD="…"; $env:AGENT1_PASSWORD="…"; $env:AGENT2_PASSWORD="…"; $env:AGENT3_PASSWORD="…"
//   npx tsx prisma/creer-equipe.ts
//
// Puis FERME la fenêtre PowerShell (pour ne pas laisser traîner les secrets).
// ─────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const equipe = [
  { email: "gerant@karhon.ci", nom: "KARHON", prenom: "Gérant", role: "gerant" as const, envVar: "GERANT_PASSWORD" },
  { email: "agent1@karhon.ci", nom: "Agent", prenom: "Agent 1", role: "agent" as const, envVar: "AGENT1_PASSWORD" },
  { email: "agent2@karhon.ci", nom: "Agent", prenom: "Agent 2", role: "agent" as const, envVar: "AGENT2_PASSWORD" },
  { email: "agent3@karhon.ci", nom: "Agent", prenom: "Agent 3", role: "agent" as const, envVar: "AGENT3_PASSWORD" },
];

async function main() {
  // 1) Tous les mots de passe doivent être fournis via l'environnement.
  const manquants = equipe.filter((m) => !process.env[m.envVar]).map((m) => m.envVar);
  if (manquants.length) {
    console.error("❌ Mots de passe manquants. Définis ces variables d'environnement avant de lancer :");
    console.error("   " + manquants.join(", "));
    console.error('\nExemple (PowerShell) :');
    console.error('   $env:GERANT_PASSWORD="…"; $env:AGENT1_PASSWORD="…"; $env:AGENT2_PASSWORD="…"; $env:AGENT3_PASSWORD="…"');
    console.error("   npx tsx prisma/creer-equipe.ts");
    process.exit(1);
  }

  // 2) Création / mise à jour de chaque compte (mot de passe haché bcrypt).
  for (const m of equipe) {
    const hash = await bcrypt.hash(process.env[m.envVar] as string, 10);
    await prisma.admin.upsert({
      where: { email: m.email },
      update: { motDePasse: hash, role: m.role, nom: m.nom, prenom: m.prenom },
      create: { email: m.email, nom: m.nom, prenom: m.prenom, motDePasse: hash, role: m.role },
    });
  }

  // 3) Nettoyage : retire de la table User les anciens comptes du personnel
  //    (avant la séparation Client / Admin), pour éviter les doublons.
  const emailsStaff = [...equipe.map((m) => m.email), "admin@karhon.ci"];
  await prisma.user.deleteMany({ where: { email: { in: emailsStaff } } });

  // 4) On affiche les identifiants et les rôles, JAMAIS les mots de passe.
  console.log("✅ Équipe créée / mise à jour :\n");
  console.table(equipe.map((m) => ({ Identifiant: m.email, Rôle: m.role })));
  console.log("\nℹ️  Communique à chaque membre SON identifiant + SON mot de passe (celui que tu as mis dans la variable correspondante).");
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
