-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'agent';
ALTER TYPE "Role" ADD VALUE 'gerant';

-- AlterTable
ALTER TABLE "contrats" ADD COLUMN     "supprime" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "devis" ADD COLUMN     "supprime" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "sinistres" ADD COLUMN     "supprime" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- CreateTable
CREATE TABLE "journal_audit" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT NOT NULL,
    "resume" TEXT,
    "auteurEmail" TEXT NOT NULL,
    "auteurNom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "journal_audit_createdAt_idx" ON "journal_audit"("createdAt");
