import { z } from "zod";
export declare const localeSchema: z.ZodEnum<{
    en: "en";
    ar: "ar";
}>;
export declare const whatsappCartItemSchema: z.ZodObject<{
    sku: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodCoercedNumber<unknown>;
    nameEn: z.ZodString;
    nameAr: z.ZodString;
}, z.core.$strip>;
export declare const whatsappCheckoutBodySchema: z.ZodObject<{
    locale: z.ZodEnum<{
        en: "en";
        ar: "ar";
    }>;
    businessDisplayName: z.ZodOptional<z.ZodString>;
    currencySymbol: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        sku: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodCoercedNumber<unknown>;
        nameEn: z.ZodString;
        nameAr: z.ZodString;
    }, z.core.$strip>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type WhatsappCheckoutBody = z.infer<typeof whatsappCheckoutBodySchema>;
//# sourceMappingURL=whatsapp.schemas.d.ts.map