-- CreateTable
CREATE TABLE "propositions" (
    "id" TEXT NOT NULL,
    "compagnie" TEXT NOT NULL,
    "documents" TEXT[],
    "prime" DOUBLE PRECISION,
    "message" TEXT,
    "choisie" BOOLEAN NOT NULL DEFAULT false,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateChoix" TIMESTAMP(3),
    "devisId" TEXT NOT NULL,

    CONSTRAINT "propositions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "propositions" ADD CONSTRAINT "propositions_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "devis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
