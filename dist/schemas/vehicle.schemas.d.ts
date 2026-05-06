import { z } from "zod";
export declare const vehicleIdParamsSchema: z.ZodObject<{
    id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const createVehicleBodySchema: z.ZodObject<{
    nameEn: z.ZodOptional<z.ZodString>;
    nameAr: z.ZodOptional<z.ZodString>;
    brand: z.ZodString;
    series: z.ZodString;
    specifics: z.ZodString;
    chassisCode: z.ZodString;
    yearRange: z.ZodString;
}, z.core.$strip>;
export declare const updateVehicleBodySchema: z.ZodObject<{
    nameEn: z.ZodOptional<z.ZodString>;
    nameAr: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    series: z.ZodOptional<z.ZodString>;
    specifics: z.ZodOptional<z.ZodString>;
    chassisCode: z.ZodOptional<z.ZodString>;
    yearRange: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateVehicleBody = z.infer<typeof createVehicleBodySchema>;
export type UpdateVehicleBody = z.infer<typeof updateVehicleBodySchema>;
export declare const vehicleListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    brand: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=vehicle.schemas.d.ts.map