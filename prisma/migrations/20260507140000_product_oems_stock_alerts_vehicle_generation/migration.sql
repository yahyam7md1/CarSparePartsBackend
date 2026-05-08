-- ProductOem + stock alert columns; migrate legacy Product.oemNumber; Vehicle.generation

CREATE TABLE "ProductOem" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "value" VARCHAR(200) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOem_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ProductOem" ("id", "productId", "value", "sortOrder")
SELECT gen_random_uuid()::text, "id", LEFT(TRIM("oemNumber"), 200), 0
FROM "Product"
WHERE "oemNumber" IS NOT NULL AND TRIM("oemNumber") <> '';

ALTER TABLE "ProductOem" ADD CONSTRAINT "ProductOem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ProductOem_productId_value_key" ON "ProductOem"("productId", "value");
CREATE INDEX "ProductOem_value_idx" ON "ProductOem"("value");

DROP INDEX IF EXISTS "Product_oemNumber_idx";

ALTER TABLE "Product" DROP COLUMN "oemNumber",
ADD COLUMN "stockAlertThresholdFast" INTEGER,
ADD COLUMN "stockAlertThresholdMedium" INTEGER,
ADD COLUMN "stockAlertThresholdSlow" INTEGER;

ALTER TABLE "Vehicle" ADD COLUMN "generation" VARCHAR(128);
