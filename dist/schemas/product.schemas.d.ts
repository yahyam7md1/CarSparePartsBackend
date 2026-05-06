import { z } from "zod";
export declare const productIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const productImageIdParamsSchema: z.ZodObject<{
    productId: z.ZodString;
    imageId: z.ZodString;
}, z.core.$strip>;
export declare const adminProductListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    categoryId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    brandName: z.ZodOptional<z.ZodString>;
    isActive: z.ZodPipe<z.ZodOptional<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>, z.ZodTransform<boolean | undefined, "true" | "false" | undefined>>;
    isFeatured: z.ZodPipe<z.ZodOptional<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>, z.ZodTransform<boolean | undefined, "true" | "false" | undefined>>;
    q: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const publicProductListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    categoryId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    categorySlug: z.ZodOptional<z.ZodString>;
    vehicleId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    oem: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const publicFeaturedQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const createProductBodySchema: z.ZodObject<{
    sku: z.ZodString;
    oemNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categoryId: z.ZodNumber;
    brandName: z.ZodString;
    nameEn: z.ZodString;
    nameAr: z.ZodString;
    descEn: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    descAr: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    price: z.ZodCoercedNumber<unknown>;
    stockQuantity: z.ZodOptional<z.ZodNumber>;
    isFeatured: z.ZodOptional<z.ZodBoolean>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    dimensions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    manufacturedIn: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    generation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    condition: z.ZodOptional<z.ZodEnum<{
        new: "new";
        used: "used";
    }>>;
}, z.core.$strip>;
export declare const updateProductBodySchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    oemNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    brandName: z.ZodOptional<z.ZodString>;
    nameEn: z.ZodOptional<z.ZodString>;
    nameAr: z.ZodOptional<z.ZodString>;
    descEn: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    descAr: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    price: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    stockQuantity: z.ZodOptional<z.ZodNumber>;
    isFeatured: z.ZodOptional<z.ZodBoolean>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    dimensions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    manufacturedIn: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    generation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    condition: z.ZodOptional<z.ZodEnum<{
        new: "new";
        used: "used";
    }>>;
}, z.core.$strip>;
export declare const replaceFitmentsBodySchema: z.ZodObject<{
    vehicleIds: z.ZodPipe<z.ZodArray<z.ZodNumber>, z.ZodTransform<number[], number[]>>;
}, z.core.$strip>;
export declare const patchInventoryBodySchema: z.ZodObject<{
    stockQuantity: z.ZodNumber;
}, z.core.$strip>;
export declare const bulkPatchInventoryBodySchema: z.ZodObject<{
    updates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        stockQuantity: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const uploadProductImageMetaSchema: z.ZodObject<{
    isMain: z.ZodPipe<z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodEnum<{
        true: "true";
        false: "false";
    }>]>>, z.ZodTransform<boolean, boolean | "true" | "false" | undefined>>;
    sortOrder: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=product.schemas.d.ts.map