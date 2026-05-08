import { z } from "zod";

const stockTierSchema = z.union([z.number().int().min(0), z.null()]).optional();

function refineDefaultStockAlerts(data: {
  defaultStockAlertFast?: number | null | undefined;
  defaultStockAlertMedium?: number | null | undefined;
  defaultStockAlertSlow?: number | null | undefined;
}): boolean {
  const f = data.defaultStockAlertFast;
  const m = data.defaultStockAlertMedium;
  const s = data.defaultStockAlertSlow;
  if (f != null && m != null && f > m) return false;
  if (m != null && s != null && m > s) return false;
  if (f != null && s != null && f > s) return false;
  return true;
}

export const patchShopSettingsBodySchema = z
  .object({
    whatsappBusinessPhone: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.union([z.string().max(40), z.null()]).optional(),
    ),
    whatsappGreetingNameEn: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.union([z.string().max(128), z.null()]).optional(),
    ),
    whatsappGreetingNameAr: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.union([z.string().max(128), z.null()]).optional(),
    ),
    defaultStockAlertFast: stockTierSchema,
    defaultStockAlertMedium: stockTierSchema,
    defaultStockAlertSlow: stockTierSchema,
    lowStockSlowAtOrBelow: z.number().int().min(0).optional(),
    lowStockMediumBelow: z.number().int().min(0).optional(),
    lowStockFastBelow: z.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (!refineDefaultStockAlerts(data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Default stock alerts must satisfy fast ≤ medium ≤ slow when each is set",
        path: ["defaultStockAlertFast"],
      });
    }
  })
  .refine((o) => Object.keys(o).length > 0, { message: "At least one field is required" });

export type PatchShopSettingsBody = z.infer<typeof patchShopSettingsBodySchema>;
