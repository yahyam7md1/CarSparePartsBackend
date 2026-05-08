-- Shop-wide settings (singleton id = 1)

CREATE TABLE "ShopSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "whatsappPhoneDigits" VARCHAR(20),
    "whatsappGreetingNameEn" VARCHAR(128),
    "whatsappGreetingNameAr" VARCHAR(128),
    "defaultStockAlertFast" INTEGER,
    "defaultStockAlertMedium" INTEGER,
    "defaultStockAlertSlow" INTEGER,
    "lowStockSlowAtOrBelow" INTEGER NOT NULL DEFAULT 0,
    "lowStockMediumBelow" INTEGER NOT NULL DEFAULT 3,
    "lowStockFastBelow" INTEGER NOT NULL DEFAULT 7,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ShopSettings" ("id", "lowStockSlowAtOrBelow", "lowStockMediumBelow", "lowStockFastBelow", "updatedAt")
VALUES (1, 0, 3, 7, CURRENT_TIMESTAMP);
