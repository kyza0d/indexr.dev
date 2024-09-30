-- AlterTable
ALTER TABLE "users" ADD COLUMN     "autoTag" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publicByDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';
