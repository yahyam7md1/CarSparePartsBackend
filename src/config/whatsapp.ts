/** Digits only, suitable for https://wa.me/<digits> (country code included, no +) */
export function normalizeWhatsAppPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    throw new Error("WHATSAPP_BUSINESS_PHONE must be 8–15 digits after normalizing.");
  }
  return digits;
}

export type WhatsAppCheckoutEnv = {
  /** wa.me path segment (digits only) */
  businessPhoneWa: string | null;
  /** Default greeting name when client omits `businessDisplayName` */
  defaultBusinessDisplayNameEn: string;
  defaultBusinessDisplayNameAr: string;
};

export type WhatsAppStoredOverride = {
  whatsappPhoneDigits: string | null;
  whatsappGreetingNameEn: string | null;
  whatsappGreetingNameAr: string | null;
};

/**
 * WHATSAPP_BUSINESS_PHONE — optional; if unset or invalid, `waUrl` in API responses is null.
 * Prefer country code without + (e.g. 962791234567).
 */
export function getWhatsAppCheckoutEnv(): WhatsAppCheckoutEnv {
  const raw = process.env.WHATSAPP_BUSINESS_PHONE?.trim();
  let businessPhoneWa: string | null = null;
  if (raw !== undefined && raw.length > 0) {
    try {
      businessPhoneWa = normalizeWhatsAppPhone(raw);
    } catch {
      console.warn(
        "[whatsapp] WHATSAPP_BUSINESS_PHONE is invalid; waUrl will be null until fixed.",
      );
    }
  }

  const defaultEn =
    process.env.WHATSAPP_GREETING_NAME_EN?.trim() || "there";
  const defaultAr =
    process.env.WHATSAPP_GREETING_NAME_AR?.trim() || "فريق خدمة العملاء";

  return {
    businessPhoneWa,
    defaultBusinessDisplayNameEn: defaultEn,
    defaultBusinessDisplayNameAr: defaultAr,
  };
}

/** DB values override env when a stored phone or greeting is present. */
export function mergeWhatsAppCheckoutEnv(
  stored: WhatsAppStoredOverride | null,
): WhatsAppCheckoutEnv {
  const env = getWhatsAppCheckoutEnv();
  let businessPhoneWa = env.businessPhoneWa;
  const rawDb = stored?.whatsappPhoneDigits?.trim();
  if (rawDb !== undefined && rawDb !== null && rawDb.length > 0) {
    try {
      businessPhoneWa = normalizeWhatsAppPhone(rawDb);
    } catch {
      console.warn(
        "[whatsapp] Stored business phone is invalid; falling back to environment value.",
      );
    }
  }

  const defaultEn =
    stored?.whatsappGreetingNameEn != null &&
    stored.whatsappGreetingNameEn.trim().length > 0
      ? stored.whatsappGreetingNameEn.trim()
      : env.defaultBusinessDisplayNameEn;

  const defaultAr =
    stored?.whatsappGreetingNameAr != null &&
    stored.whatsappGreetingNameAr.trim().length > 0
      ? stored.whatsappGreetingNameAr.trim()
      : env.defaultBusinessDisplayNameAr;

  return {
    businessPhoneWa,
    defaultBusinessDisplayNameEn: defaultEn,
    defaultBusinessDisplayNameAr: defaultAr,
  };
}
