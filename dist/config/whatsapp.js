/** Digits only, suitable for https://wa.me/<digits> (country code included, no +) */
export function normalizeWhatsAppPhone(input) {
    const digits = input.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
        throw new Error("WHATSAPP_BUSINESS_PHONE must be 8–15 digits after normalizing.");
    }
    return digits;
}
/**
 * WHATSAPP_BUSINESS_PHONE — optional; if unset or invalid, `waUrl` in API responses is null.
 * Prefer country code without + (e.g. 962791234567).
 */
export function getWhatsAppCheckoutEnv() {
    const raw = process.env.WHATSAPP_BUSINESS_PHONE?.trim();
    let businessPhoneWa = null;
    if (raw !== undefined && raw.length > 0) {
        try {
            businessPhoneWa = normalizeWhatsAppPhone(raw);
        }
        catch {
            console.warn("[whatsapp] WHATSAPP_BUSINESS_PHONE is invalid; waUrl will be null until fixed.");
        }
    }
    const defaultEn = process.env.WHATSAPP_GREETING_NAME_EN?.trim() || "there";
    const defaultAr = process.env.WHATSAPP_GREETING_NAME_AR?.trim() || "فريق خدمة العملاء";
    return {
        businessPhoneWa,
        defaultBusinessDisplayNameEn: defaultEn,
        defaultBusinessDisplayNameAr: defaultAr,
    };
}
//# sourceMappingURL=whatsapp.js.map