import { z } from "zod";
export declare const categoryIdParamsSchema: z.ZodObject<{
    id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const createCategoryBodySchema: z.ZodObject<{
    nameEn: z.ZodString;
    nameAr: z.ZodString;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    slug: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateCategoryBodySchema: z.ZodObject<{
    nameEn: z.ZodOptional<z.ZodString>;
    nameAr: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    slug: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;
//# sourceMappingURL=category.schemas.d.ts.map