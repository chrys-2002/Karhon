-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatutDevis" ADD VALUE 'choisi';
ALTER TYPE "StatutDevis" ADD VALUE 'paye';

-- AlterTable
ALTER TABLE "devis" ADD COLUMN     "lienPaiement" TEXT,
ADD COLUMN     "modePaiement" TEXT;
