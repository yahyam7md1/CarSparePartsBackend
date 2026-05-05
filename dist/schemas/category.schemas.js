import { z } from "zod";
const idParam = z.coerce.number().int().positive();
export const categoryIdParamsSchema = z.object({
    id: idParam,
});
export const createCategoryBodySchema = z.object({
    nameEn: z.string().trim().min(1).max(256),
    nameAr: z.string().trim().min(1).max(256),
    parentId: z.number().int().positive().nullable().optional(),
    slug: z.string().trim().max(256).optional(),
});
export const updateCategoryBodySchema = z
    .object({
    nameEn: z.string().trim().min(1).max(256).optional(),
    nameAr: z.string().trim().min(1).max(256).optional(),
    parentId: z.number().int().positive().nullable().optional(),
    slug: z.string().trim().max(256).optional(),
})
    .refine((o) => o.nameEn !== undefined ||
    o.nameAr !== undefined ||
    o.parentId !== undefined ||
    o.slug !== undefined, { message: "At least one field is required" });
//# sourceMappingURL=category.schemas.js.map