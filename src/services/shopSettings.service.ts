import { normalizeWhatsAppPhone } from "../config/whatsapp.js";
import * as shopSettingsRepository from "../repositories/shopSettings.repository.js";
import { HttpError } from "../utils/errors.js";
import type { PatchShopSettingsBody } from "../schemas/shopSettings.schemas.js";

export async function getAdminShopSettings() {
  const row = await shopSettingsRepository.getShopSettings();
  return {
    whatsappBusinessPhoneDigits: row.whatsappPhoneDigits,
    whatsappGreetingNameEn: row.whatsappGreetingNameEn,
    whatsappGreetingNameAr: row.whatsappGreetingNameAr,
    defaultStockAlertFast: row.defaultStockAlertFast,
    defaultStockAlertMedium: row.defaultStockAlertMedium,
    defaultStockAlertSlow: row.defaultStockAlertSlow,
    lowStockSlowAtOrBelow: row.lowStockSlowAtOrBelow,
    lowStockMediumBelow: row.lowStockMediumBelow,
    lowStockFastBelow: row.lowStockFastBelow,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function patchAdminShopSettings(body: PatchShopSettingsBody) {
  const row = await shopSettingsRepository.getShopSettings();

  const data: Parameters<typeof shopSettingsRepository.updateShopSettings>[0] = {};

  if (body.whatsappBusinessPhone !== undefined) {
    if (body.whatsappBusinessPhone === null) {
      data.whatsappPhoneDigits = null;
    } else {
      try {
        data.whatsappPhoneDigits = normalizeWhatsAppPhone(body.whatsappBusinessPhone);
      } catch {
        throw new HttpError(
          400,
          "Invalid WhatsApp business phone (country code + number, 8–15 digits)",
        );
      }
    }
  }

  if (body.whatsappGreetingNameEn !== undefined) {
    data.whatsappGreetingNameEn = body.whatsappGreetingNameEn;
  }
  if (body.whatsappGreetingNameAr !== undefined) {
    data.whatsappGreetingNameAr = body.whatsappGreetingNameAr;
  }
  if (body.defaultStockAlertFast !== undefined) {
    data.defaultStockAlertFast = body.defaultStockAlertFast;
  }
  if (body.defaultStockAlertMedium !== undefined) {
    data.defaultStockAlertMedium = body.defaultStockAlertMedium;
  }
  if (body.defaultStockAlertSlow !== undefined) {
    data.defaultStockAlertSlow = body.defaultStockAlertSlow;
  }

  if (
    body.lowStockSlowAtOrBelow !== undefined ||
    body.lowStockMediumBelow !== undefined ||
    body.lowStockFastBelow !== undefined
  ) {
    const s = body.lowStockSlowAtOrBelow ?? row.lowStockSlowAtOrBelow;
    const m = body.lowStockMediumBelow ?? row.lowStockMediumBelow;
    const f = body.lowStockFastBelow ?? row.lowStockFastBelow;
    if (s >= m || m >= f) {
      throw new HttpError(
        400,
        "Low-stock cutoffs must satisfy slow < medium < fast (medium/fast use strict below)",
      );
    }
    if (body.lowStockSlowAtOrBelow !== undefined) {
      data.lowStockSlowAtOrBelow = body.lowStockSlowAtOrBelow;
    }
    if (body.lowStockMediumBelow !== undefined) {
      data.lowStockMediumBelow = body.lowStockMediumBelow;
    }
    if (body.lowStockFastBelow !== undefined) {
      data.lowStockFastBelow = body.lowStockFastBelow;
    }
  }

  await shopSettingsRepository.updateShopSettings(data);
  return getAdminShopSettings();
}
