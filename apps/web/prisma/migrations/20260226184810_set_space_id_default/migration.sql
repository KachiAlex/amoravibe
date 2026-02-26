/*
  Warnings:

  - The primary key for the `Space` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Space` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Space" DROP CONSTRAINT "Space_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Space_pkey" PRIMARY KEY ("id");
