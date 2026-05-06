-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "nameEn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Vehicle" ADD COLUMN "nameAr" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "generation" TEXT;
