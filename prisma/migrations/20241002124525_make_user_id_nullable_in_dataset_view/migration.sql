-- DropForeignKey
ALTER TABLE "DatasetView" DROP CONSTRAINT "DatasetView_userId_fkey";

-- DropIndex
DROP INDEX "DatasetView_datasetId_userId_key";

-- AlterTable
ALTER TABLE "DatasetView" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "DatasetView_datasetId_userId_idx" ON "DatasetView"("datasetId", "userId");

-- AddForeignKey
ALTER TABLE "DatasetView" ADD CONSTRAINT "DatasetView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
