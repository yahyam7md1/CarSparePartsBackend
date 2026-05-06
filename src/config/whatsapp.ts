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
