// ─────────────────────────────────────────────────────────────
// Client Prisma — point d'accès unique à la base de données.
//
// On garde une SEULE instance partagée (singleton). En dev, Next.js
// recharge le code souvent ; sans ce garde-fou on créerait des
// dizaines de connexions. On la stocke donc sur l'objet global.
// ─────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
