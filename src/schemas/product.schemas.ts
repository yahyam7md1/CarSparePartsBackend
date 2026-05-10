import { z } from "zod";

const conditionSchema = z.enum(["new", "used"]);
const movementClassSchema = z.enum(["slow", "medium", "fast"]);

const stockAlertThresholdSchema = z.union([z.number().int().min(0), z.null()]).optional();

function refineProductStockAlerts(data: {
  stockAlertThresholdFast?: number | null | undefined;
  stockAlertThresholdMedium?: number | null | undefined;
  stockAlertThresholdSlow?: number | null | undefined;
}): boolean {
  const f = data.stockAlertThresholdFast;
  const m = data.stockAlertThresholdMedium;
  const s = data.stockAlertThresholdSlow;
  if (f != null && m != null && f > m) return false;
  if (m != null && s != null && m > s) return false;
  if (f != null && s != null && f > s) return false;
  return true;
}

export const productIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const productImageIdParamsSchema = z.object({
  productId: z.string().uuid(),
  imageId: z.string().uuid(),
});

export const adminProductListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  brandName: z.string().trim().min(1).optional(),
  vehicleId: z.coerce.number().int().positive().optional(),
  chassisCode: z.string().trim().min(1).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  isFeatured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  q: z.string().trim().min(1).optional(),
});

export const publicProductSortSchema = z.enum([
  "featured",
  "newest",
  "price_asc",
  "price_desc",
  "name_en_asc",
  "name_ar_asc",
]);

/** Express `req.query` may be a string, repeated keys, or comma-separated. */
function queryToStringArray(val: unknown): string[] {
  if (val === undefined || val === null || val === "") return [];
  const raw = Array.isArray(val) ? val : [val];
  const out: string[] = [];
  for (const item of raw) {
    for (const part of String(item).split(",")) {
      const s = part.trim();
      if (s) out.push(s);
    }
  }
  return out;
}

function queryToPositiveIntArray(val: unknown): number[] {
  if (val === undefined || val === null || val === "") return [];
  const raw = Array.isArray(val) ? val : [val];
  const out: number[] = [];
  const seen = new Set<number>();
  for (const item of raw) {
    for (const part of String(item).split(",")) {
      const n = Number.parseInt(part.trim(), 10);
      if (Number.isFinite(n) && n > 0 && !seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
    }
  }
  return out;
}

export const publicProductListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  /** Multi-select (PLP); merges with `categoryId` / `categorySlug` server-side. */
  categoryIds: z.preprocess(
    (v) => queryToPositiveIntArray(v).slice(0, 50),
    z.array(z.number().int().positive()).max(50),
  ).optional(),
  categorySlug: z.string().trim().min(1).optional(),
  vehicleId: z.coerce.number().int().positive().optional(),
  oem: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  /** Matches `Product.brandName` (e.g. BMW, Mini); OR semantics when multiple. */
  brand: z.preprocess(
    (v) =>
      queryToStringArray(v)
        .map((s) => s.slice(0, 200))
        .filter(Boolean)
        .slice(0, 20),
    z.array(z.string().trim().min(1).max(200)).max(20),
  ).optional(),
  minPrice: z.coerce.number().finite().nonnegative().optional(),
  maxPrice: z.coerce.number().finite().nonnegative().optional(),
  sort: publicProductSortSchema.optional(),
});

export const publicFeaturedQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const createProductBodySchema = z.object({
  sku: z.string().trim().min(1).max(200),
  oemNumber: z.string().trim().max(200).nullable().optional(),
  movementClass: movementClassSchema.optional(),
  categoryId: z.number().int().positive(),
  brandName: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().min(1).max(500),
  nameAr: z.string().trim().min(1).max(500),
  descEn: z.string().trim().max(20000).nullable().optional(),
  descAr: z.string().trim().max(20000).nullable().optional(),
  price: z.coerce.number().finite().nonnegative(),
  compareAtPrice: z.coerce.number().finite().nonnegative().nullable().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  dimensions: z.string().trim().max(500).nullable().optional(),
  weight: z.number().finite().positive().nullable().optional(),
  manufacturedIn: z.string().trim().max(200).nullable().optional(),
  generation: z.string().trim().max(200).nullable().optional(),
  condition: conditionSchema.optional(),
  oemNumbers: z.array(z.string().trim().max(200)).max(50).optional(),
  stockAlertThresholdFast: stockAlertThresholdSchema,
  stockAlertThresholdMedium: stockAlertThresholdSchema,
  stockAlertThresholdSlow: stockAlertThresholdSchema,
})
  .superRefine((data, ctx) => {
    if (!refineProductStockAlerts(data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Stock alert thresholds must satisfy fast ≤ medium ≤ slow (each tier when stock is at or below the value)",
        path: ["stockAlertThresholdFast"],
      });
    }
  });

export const updateProductBodySchema = z
  .object({
    sku: z.string().trim().min(1).max(200).optional(),
    oemNumber: z.string().trim().max(200).nullable().optional(),
    movementClass: movementClassSchema.optional(),
    categoryId: z.number().int().positive().optional(),
    brandName: z.string().trim().min(1).max(200).optional(),
    nameEn: z.string().trim().min(1).max(500).optional(),
    nameAr: z.string().trim().min(1).max(500).optional(),
    descEn: z.string().trim().max(20000).nullable().optional(),
    descAr: z.string().trim().max(20000).nullable().optional(),
    price: z.coerce.number().finite().nonnegative().optional(),
    compareAtPrice: z.coerce.number().finite().nonnegative().nullable().optional(),
    stockQuantity: z.number().int().min(0).optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    dimensions: z.string().trim().max(500).nullable().optional(),
    weight: z.number().finite().positive().nullable().optional(),
    manufacturedIn: z.string().trim().max(200).nullable().optional(),
    generation: z.string().trim().max(200).nullable().optional(),
    condition: conditionSchema.optional(),
    /** When present, replaces all OEM numbers for the product (empty array clears). */
    oemNumbers: z.array(z.string().trim().max(200)).max(50).optional(),
    stockAlertThresholdFast: stockAlertThresholdSchema,
    stockAlertThresholdMedium: stockAlertThresholdSchema,
    stockAlertThresholdSlow: stockAlertThresholdSchema,
  })
  .superRefine((data, ctx) => {
    if (!refineProductStockAlerts(data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Stock alert thresholds must satisfy fast ≤ medium ≤ slow (each tier when stock is at or below the value)",
        path: ["stockAlertThresholdFast"],
      });
    }
  })
  .refine(
    (o) => Object.keys(o).length > 0,
    { message: "At least one field is required" },
  );

export const replaceFitmentsBodySchema = z.object({
  vehicleIds: z
    .array(z.number().int().positive())
    .transform((ids) => [...new Set(ids)]),
});

export const patchInventoryBodySchema = z.object({
  stockQuantity: z.number().int().min(0),
});

export const bulkPatchInventoryBodySchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().uuid(),
        stockQuantity: z.number().int().min(0),
      }),
    )
    .min(1)
    .max(200),
});

export const uploadProductImageMetaSchema = z.object({
  isMain: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((v) => (v === undefined ? false : v === true || v === "true")),
  sortOrder: z.coerce.number().int().min(0).optional(),
});
