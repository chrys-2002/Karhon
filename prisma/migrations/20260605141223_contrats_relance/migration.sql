-- AlterTable
ALTER TABLE "contrats" ADD COLUMN     "derniereRelance" TIMESTAMP(3),
ADD COLUMN     "dureeMois" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "nombreRelances" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "devis" ADD COLUMN     "derniereRelance" TIMESTAMP(3),
ADD COLUMN     "nombreRelances" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sinistres" ADD COLUMN     "derniereRelance" TIMESTAMP(3),
ADD COLUMN     "nombreRelances" INTEGER NOT NULL DEFAULT 0;
