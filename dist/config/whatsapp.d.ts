/** Digits only, suitable for https://wa.me/<digits> (country code included, no +) */
export declare function normalizeWhatsAppPhone(input: string): string;
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
export declare function getWhatsAppCheckoutEnv(): WhatsAppCheckoutEnv;
//# sourceMappingURL=whatsapp.d.ts.map