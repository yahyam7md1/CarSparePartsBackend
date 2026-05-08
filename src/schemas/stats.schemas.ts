import { z } from "zod";

export const adminLowStockListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  q: z.string().trim().min(1).optional(),
});

export const lowStockProductParamsSchema = z.object({
  id: z.string().uuid(),
});
