// ─────────────────────────────────────────────────────────────
// Prépare la migration « téléphone unique » : met à NULL les numéros
// en DOUBLON dans la table users (garde la 1re occurrence, vide les autres).
//
// Nécessaire car l'ancienne équipe partageait le même numéro, ce qui
// empêchait d'ajouter la contrainte unique sur `telephone`.
//
// Lancer (local) :  npx tsx prisma/dedupliquer-telephones.ts
// Lancer (prod)  :  $env:DATABASE_URL="<URL_NEON>"; npx tsx prisma/dedupliquer-telephones.ts
// ─────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { telephone: { not: null } },
    select: { id: true, email: true, telephone: true },
    orderBy: { dateInscription: "asc" }, // on garde le plus ancien
  });

  const vus = new Set<string>();
  const aVider: string[] = [];
  for (const u of users) {
    const tel = u.telephone as string;
    if (vus.has(tel)) aVider.push(u.id);
    else vus.add(tel);
  }

  if (aVider.length === 0) {
    console.log("✅ Aucun doublon de téléphone. Rien à faire.");
    return;
  }

  const res = await prisma.user.updateMany({
    where: { id: { in: aVider } },
    data: { telephone: null },
  });
  console.log(`✅ ${res.count} numéro(s) en doublon vidé(s). La contrainte unique pourra s'appliquer.`);
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
