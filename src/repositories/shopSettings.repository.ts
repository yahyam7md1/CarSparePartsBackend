import { prisma } from "../lib/prisma.js";

const SHOP_SETTINGS_ID = 1;

export type LowStockThresholds = {
  slowAtOrBelow: number;
  mediumBelow: number;
  fastBelow: number;
};

export async function getShopSettings() {
  let row = await prisma.shopSettings.findUnique({ where: { id: SHOP_SETTINGS_ID } });
  if (!row) {
    row = await prisma.shopSettings.create({
      data: { id: SHOP_SETTINGS_ID },
    });
  }
  return row;
}

export function lowStockThresholdsFromRow(row: {
  lowStockSlowAtOrBelow: number;
  lowStockMediumBelow: number;
  lowStockFastBelow: number;
}): LowStockThresholds {
  return {
    slowAtOrBelow: row.lowStockSlowAtOrBelow,
    mediumBelow: row.lowStockMediumBelow,
    fastBelow: row.lowStockFastBelow,
  };
}

export async function updateShopSettings(data: {
  whatsappPhoneDigits?: string | null;
  whatsappGreetingNameEn?: string | null;
  whatsappGreetingNameAr?: string | null;
  defaultStockAlertFast?: number | null;
  defaultStockAlertMedium?: number | null;
  defaultStockAlertSlow?: number | null;
  lowStockSlowAtOrBelow?: number;
  lowStockMediumBelow?: number;
  lowStockFastBelow?: number;
}) {
  await getShopSettings();
  return prisma.shopSettings.update({
    where: { id: SHOP_SETTINGS_ID },
    data,
  });
}
