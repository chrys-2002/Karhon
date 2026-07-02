-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archiveLe" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "messages_archive_idx" ON "messages"("archive");
