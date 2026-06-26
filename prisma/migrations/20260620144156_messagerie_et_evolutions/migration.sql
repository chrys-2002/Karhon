-- CreateEnum
CREATE TYPE "SegmentContrat" AS ENUM ('particulier', 'professionnel', 'transport');

-- AlterTable
ALTER TABLE "contrats" ADD COLUMN     "segment" "SegmentContrat" NOT NULL DEFAULT 'particulier';

-- AlterTable
ALTER TABLE "devis" ADD COLUMN     "segment" "SegmentContrat" NOT NULL DEFAULT 'particulier';

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "cible" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lien" TEXT,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expediteur" TEXT NOT NULL,
    "auteurEmail" TEXT,
    "contenu" TEXT NOT NULL,
    "piecesJointes" TEXT[],
    "contexte" TEXT,
    "contexteId" TEXT,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_cible_userId_lu_idx" ON "notifications"("cible", "userId", "lu");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "messages_userId_createdAt_idx" ON "messages"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_expediteur_lu_idx" ON "messages"("expediteur", "lu");

-- CreateIndex
CREATE INDEX "journal_audit_action_idx" ON "journal_audit"("action");

-- CreateIndex
CREATE INDEX "journal_audit_entite_idx" ON "journal_audit"("entite");

-- CreateIndex
CREATE INDEX "journal_audit_auteurEmail_idx" ON "journal_audit"("auteurEmail");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
