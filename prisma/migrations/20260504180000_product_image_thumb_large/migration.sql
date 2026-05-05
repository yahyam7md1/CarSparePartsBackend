-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN "urlThumb" TEXT;
ALTER TABLE "ProductImage" ADD COLUMN "urlLarge" TEXT;
ALTER TABLE "ProductImage" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

UPDATE "ProductImage" SET "urlThumb" = "url", "urlLarge" = "url" WHERE "url" IS NOT NULL;

ALTER TABLE "ProductImage" ALTER COLUMN "urlThumb" SET NOT NULL;
ALTER TABLE "ProductImage" ALTER COLUMN "urlLarge" SET NOT NULL;

ALTER TABLE "ProductImage" DROP COLUMN "url";
