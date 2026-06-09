-- AlterTable
ALTER TABLE "contrats" ADD COLUMN     "compagnie" TEXT,
ADD COLUMN     "telephoneContact" TEXT;

-- AlterTable
ALTER TABLE "devis" ADD COLUMN     "reponses" JSONB,
ADD COLUMN     "telephoneContact" TEXT;
