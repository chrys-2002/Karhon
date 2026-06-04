/*
  Warnings:

  - Added the required column `userId` to the `sinistres` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sinistres" DROP CONSTRAINT "sinistres_contratId_fkey";

-- AlterTable
ALTER TABLE "sinistres" ADD COLUMN     "heureSurvenance" TEXT,
ADD COLUMN     "lieu" TEXT,
ADD COLUMN     "montantEstime" DOUBLE PRECISION,
ADD COLUMN     "typeAssurance" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "contratId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "sinistres" ADD CONSTRAINT "sinistres_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinistres" ADD CONSTRAINT "sinistres_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
