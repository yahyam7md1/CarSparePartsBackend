-- AlterTable
ALTER TABLE "ShopSettings" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "chassisCode" DROP NOT NULL;
