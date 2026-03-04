-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[];
