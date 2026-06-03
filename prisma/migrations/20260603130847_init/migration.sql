-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'admin');

-- CreateEnum
CREATE TYPE "StatutDevis" AS ENUM ('en_attente', 'en_cours', 'envoye', 'accepte', 'refuse');

-- CreateEnum
CREATE TYPE "StatutContrat" AS ENUM ('actif', 'suspendu', 'resilie');

-- CreateEnum
CREATE TYPE "StatutSinistre" AS ENUM ('declare', 'en_cours', 'indemnise', 'refuse');

-- CreateEnum
CREATE TYPE "StatutRendezVous" AS ENUM ('en_attente', 'confirme', 'annule', 'termine');

-- CreateEnum
CREATE TYPE "TypeProduit" AS ENUM ('IARD', 'VIE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT,
    "motDePasse" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'client',
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeProduit" NOT NULL,
    "categorie" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "garanties" TEXT[],
    "imageUrl" TEXT,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devis" (
    "id" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutDevis" NOT NULL DEFAULT 'en_attente',
    "montantEstime" DOUBLE PRECISION,
    "description" TEXT NOT NULL,
    "documents" TEXT[],
    "userId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,

    CONSTRAINT "devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" TEXT NOT NULL,
    "numeroContrat" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "primeAnnuelle" DOUBLE PRECISION NOT NULL,
    "statut" "StatutContrat" NOT NULL DEFAULT 'actif',
    "options" TEXT[],
    "userId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sinistres" (
    "id" TEXT NOT NULL,
    "dateSurvenance" TIMESTAMP(3) NOT NULL,
    "dateDeclaration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "montantIndemnise" DOUBLE PRECISION,
    "statut" "StatutSinistre" NOT NULL DEFAULT 'declare',
    "documents" TEXT[],
    "contratId" TEXT NOT NULL,

    CONSTRAINT "sinistres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rendez_vous" (
    "id" TEXT NOT NULL,
    "dateHeure" TIMESTAMP(3) NOT NULL,
    "statut" "StatutRendezVous" NOT NULL DEFAULT 'en_attente',
    "motif" TEXT NOT NULL,
    "notes" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "rendez_vous_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_numeroContrat_key" ON "contrats"("numeroContrat");

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinistres" ADD CONSTRAINT "sinistres_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
