/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `brand` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `compatibility` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `discountPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `vinNumber` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Product` table. All the data in the column will be lost.
  - Added the required column `brandName` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Product_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "brand",
DROP COLUMN "compatibility",
DROP COLUMN "discountPrice",
DROP COLUMN "slug",
DROP COLUMN "tags",
DROP COLUMN "vinNumber",
DROP COLUMN "year",
ADD COLUMN     "brandName" TEXT NOT NULL,
ALTER COLUMN "condition" SET DEFAULT 'new';

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "specifics" TEXT NOT NULL,
    "chassisCode" TEXT NOT NULL,
    "yearRange" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fitment" (
    "id" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "vehicleId" INTEGER NOT NULL,

    CONSTRAINT "Fitment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fitment_productId_vehicleId_key" ON "Fitment"("productId", "vehicleId");

-- AddForeignKey
ALTER TABLE "Fitment" ADD CONSTRAINT "Fitment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fitment" ADD CONSTRAINT "Fitment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
