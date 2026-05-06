import { z } from "zod";
export const localeSchema = z.enum(["en", "ar"]);
export const whatsappCartItemSchema = z.object({
    sku: z.string().trim().min(1).max(200),
    quantity: z.number().int().positive().max(9999),
    unitPrice: z.coerce.number().finite().nonnegative(),
    nameEn: z.string().trim().min(1).max(500),
    nameAr: z.string().trim().min(1).max(500),
});
export const whatsappCheckoutBodySchema = z.object({
    locale: localeSchema,
    /** Overrides env default; inserted into greeting line */
    businessDisplayName: z.string().trim().min(1).max(120).optional(),
    /** Defaults to "$" (English) or appended after total in Arabic template */
    currencySymbol: z.string().trim().min(1).max(8).optional(),
    items: z.array(whatsappCartItemSchema).min(1).max(100),
    /** Optional footer: condition / VIN / notes */
    notes: z.string().trim().max(2000).optional(),
});
//# sourceMappingURL=whatsapp.schemas.js.map