import type { Request, Response, NextFunction } from "express";
import { mergeWhatsAppCheckoutEnv } from "../config/whatsapp.js";
import * as shopSettingsRepository from "../repositories/shopSettings.repository.js";

/** Public: digits for wa.me — DB admin settings merged with `WHATSAPP_BUSINESS_PHONE` env. */
export async function getShopSupportPublic(_req: Request, res: Response, next: NextFunction) {
  try {
    const stored = await shopSettingsRepository.getShopSettings();
    const env = mergeWhatsAppCheckoutEnv(stored);
    res.json({ whatsappPhoneDigits: env.businessPhoneWa });
  } catch (err) {
    next(err);
  }
}
