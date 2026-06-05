// ─────────────────────────────────────────────────────────────
// Crée / met à jour l'équipe de gestion KARHON :
//   • 1 gérant  (voit tout, restaure, purge, journal d'audit)
//   • 3 agents  (gèrent devis/sinistres/contrats ; suppression = archivage)
//
// Identifiants DISTINCTS + mots de passe DISTINCTS → traçabilité réelle.
// L'ancien compte admin@karhon.ci est converti en gérant.
//
// Lancer (local) :  npx tsx prisma/creer-equipe.ts
// Lancer (prod)  :  $env:DATABASE_URL="<URL_NEON>"; npx tsx prisma/creer-equipe.ts
//
// ⚠️ Change les mots de passe ci-dessous avant un usage réel, puis
//    communique à chaque agent SON identifiant + SON mot de passe.
// ─────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const equipe = [
  { email: "gerant@karhon.ci", nom: "KARHON", prenom: "Gérant", role: "gerant" as const, motDePasse: "Gerant#2026" },
  { email: "agent1@karhon.ci", nom: "Agent", prenom: "Agent 1", role: "agent" as const, motDePasse: "Agent1#2026" },
  { email: "agent2@karhon.ci", nom: "Agent", prenom: "Agent 2", role: "agent" as const, motDePasse: "Agent2#2026" },
  { email: "agent3@karhon.ci", nom: "Agent", prenom: "Agent 3", role: "agent" as const, motDePasse: "Agent3#2026" },
];

async function main() {
  for (const m of equipe) {
    const hash = await bcrypt.hash(m.motDePasse, 10);
    await prisma.user.upsert({
      where: { email: m.email },
      update: { motDePasse: hash, role: m.role, nom: m.nom, prenom: m.prenom },
      create: {
        email: m.email,
        nom: m.nom,
        prenom: m.prenom,
        telephone: "+225 07 87 10 39 39",
        motDePasse: hash,
        role: m.role,
      },
    });
  }

  // Convertit l'ancien compte admin en gérant (compatibilité).
  await prisma.user.updateMany({
    where: { email: "admin@karhon.ci" },
    data: { role: "gerant" },
  });

  console.log("✅ Équipe créée / mise à jour :\n");
  console.table(equipe.map((m) => ({ Identifiant: m.email, "Mot de passe": m.motDePasse, Rôle: m.role })));
  console.log("\nℹ️  admin@karhon.ci (s'il existe) est désormais GÉRANT.");
  console.log("⚠️  Change ces mots de passe et communique à chaque agent SON code.");
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
