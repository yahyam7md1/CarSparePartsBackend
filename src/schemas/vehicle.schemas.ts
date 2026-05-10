import { z } from "zod";

const idParam = z.coerce
  .number()
  .int()
  .positive();

export const vehicleIdParamsSchema = z.object({
  id: idParam,
});

export const createVehicleBodySchema = z.object({
  nameEn: z.string().trim().max(256).optional(),
  nameAr: z.string().trim().max(256).optional(),
  brand: z.string().trim().min(1).max(128),
  series: z.string().trim().min(1).max(128),
  specifics: z.string().trim().min(1).max(128),
  chassisCode: z.string().trim().max(64).nullable().optional(),
  yearRange: z.string().trim().min(1).max(64),
  generation: z.string().trim().max(128).nullable().optional(),
});

export const updateVehicleBodySchema = z
  .object({
    nameEn: z.string().trim().max(256).optional(),
    nameAr: z.string().trim().max(256).optional(),
    brand: z.string().trim().min(1).max(128).optional(),
    series: z.string().trim().min(1).max(128).optional(),
    specifics: z.string().trim().min(1).max(128).optional(),
    chassisCode: z.string().trim().max(64).nullable().optional(),
    yearRange: z.string().trim().min(1).max(64).optional(),
    generation: z.string().trim().max(128).nullable().optional(),
  })
  .refine(
    (o) =>
      o.nameEn !== undefined ||
      o.nameAr !== undefined ||
      o.brand !== undefined ||
      o.series !== undefined ||
      o.specifics !== undefined ||
      o.chassisCode !== undefined ||
      o.yearRange !== undefined ||
      o.generation !== undefined,
    { message: "At least one field is required" },
  );

export type CreateVehicleBody = z.infer<typeof createVehicleBodySchema>;
export type UpdateVehicleBody = z.infer<typeof updateVehicleBodySchema>;

export const vehicleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  brand: z.string().trim().max(128).optional(),
  q: z.string().trim().min(1).optional(),
});

export const mergeVehicleFitmentsBodySchema = z.object({
  sourceVehicleId: z.coerce.number().int().positive(),
  targetVehicleId: z.coerce.number().int().positive(),
});

export const vehicleFacetsSeriesQuerySchema = z.object({
  brand: z.string().trim().min(1).max(128),
});

export const vehicleFacetsVehiclesQuerySchema = z.object({
  brand: z.string().trim().min(1).max(128),
  series: z.string().trim().min(1).max(128),
});
