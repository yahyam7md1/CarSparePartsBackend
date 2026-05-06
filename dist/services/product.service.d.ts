import type { ProductAdminListRow } from "../repositories/product.repository.js";
declare function mapListRow(p: ProductAdminListRow): {
    price: string;
    category: {
        id: number;
        nameEn: string;
        nameAr: string;
        slug: string;
    };
    images: {
        id: string;
        urlThumb: string;
        urlLarge: string;
        isMain: boolean;
        sortOrder: number;
    }[];
    id: string;
    createdAt: Date;
    nameEn: string;
    nameAr: string;
    sku: string;
    oemNumber: string | null;
    categoryId: number;
    brandName: string;
    descEn: string | null;
    descAr: string | null;
    stockQuantity: number;
    isFeatured: boolean;
    isActive: boolean;
    dimensions: string | null;
    weight: number | null;
    manufacturedIn: string | null;
    generation: string | null;
    condition: string;
    updatedAt: Date;
};
export declare function listProductsAdmin(q: {
    page?: number;
    limit?: number;
    categoryId?: number;
    brandName?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    q?: string;
}): Promise<{
    products: ReturnType<typeof mapListRow>[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getProductAdmin(id: string): Promise<{
    price: string;
    category: {
        id: number;
        nameEn: string;
        nameAr: string;
        slug: string;
    };
    images: {
        id: string;
        urlThumb: string;
        urlLarge: string;
        isMain: boolean;
        sortOrder: number;
        productId: string;
    }[];
    fitments: ({
        vehicle: {
            id: number;
            nameEn: string;
            nameAr: string;
            brand: string;
            series: string;
            specifics: string;
            chassisCode: string;
            yearRange: string;
        };
    } & {
        id: number;
        productId: string;
        vehicleId: number;
    })[];
    id: string;
    createdAt: Date;
    nameEn: string;
    nameAr: string;
    sku: string;
    oemNumber: string | null;
    categoryId: number;
    brandName: string;
    descEn: string | null;
    descAr: string | null;
    stockQuantity: number;
    isFeatured: boolean;
    isActive: boolean;
    dimensions: string | null;
    weight: number | null;
    manufacturedIn: string | null;
    generation: string | null;
    condition: string;
    updatedAt: Date;
}>;
export declare function createProduct(input: {
    sku: string;
    oemNumber?: string | null;
    categoryId: number;
    brandName: string;
    nameEn: string;
    nameAr: string;
    descEn?: string | null;
    descAr?: string | null;
    price: number;
    stockQuantity?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    dimensions?: string | null;
    weight?: number | null;
    manufacturedIn?: string | null;
    generation?: string | null;
    condition?: "new" | "used";
}): Promise<{
    price: string;
    category: {
        id: number;
        nameEn: string;
        nameAr: string;
        slug: string;
    };
    images: {
        id: string;
        urlThumb: string;
        urlLarge: string;
        isMain: boolean;
        sortOrder: number;
        productId: string;
    }[];
    fitments: ({
        vehicle: {
            id: number;
            nameEn: string;
            nameAr: string;
            brand: string;
            series: string;
            specifics: string;
            chassisCode: string;
            yearRange: string;
        };
    } & {
        id: number;
        productId: string;
        vehicleId: number;
    })[];
    id: string;
    createdAt: Date;
    nameEn: string;
    nameAr: string;
    sku: string;
    oemNumber: string | null;
    categoryId: number;
    brandName: string;
    descEn: string | null;
    descAr: string | null;
    stockQuantity: number;
    isFeatured: boolean;
    isActive: boolean;
    dimensions: string | null;
    weight: number | null;
    manufacturedIn: string | null;
    generation: string | null;
    condition: string;
    updatedAt: Date;
}>;
export declare function updateProduct(id: string, input: {
    sku?: string;
    oemNumber?: string | null;
    categoryId?: number;
    brandName?: string;
    nameEn?: string;
    nameAr?: string;
    descEn?: string | null;
    descAr?: string | null;
    price?: number;
    stockQuantity?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    dimensions?: string | null;
    weight?: number | null;
    manufacturedIn?: string | null;
    generation?: string | null;
    condition?: "new" | "used";
}): Promise<{
    price: string;
    category: {
        id: number;
        nameEn: string;
        nameAr: string;
        slug: string;
    };
    images: {
        id: string;
        urlThumb: string;
        urlLarge: string;
        isMain: boolean;
        sortOrder: number;
        productId: string;
    }[];
    fitments: ({
        vehicle: {
            id: number;
            nameEn: string;
            nameAr: string;
            brand: string;
            series: string;
            specifics: string;
            chassisCode: string;
            yearRange: string;
        };
    } & {
        id: number;
        productId: string;
        vehicleId: number;
    })[];
    id: string;
    createdAt: Date;
    nameEn: string;
    nameAr: string;
    sku: string;
    oemNumber: string | null;
    categoryId: number;
    brandName: string;
    descEn: string | null;
    descAr: string | null;
    stockQuantity: number;
    isFeatured: boolean;
    isActive: boolean;
    dimensions: string | null;
    weight: number | null;
    manufacturedIn: string | null;
    generation: string | null;
    condition: string;
    updatedAt: Date;
}>;
export declare function deleteProduct(id: string): Promise<void>;
export declare function uploadProductImage(productId: string, file: {
    buffer: Buffer;
    mimetype: string;
} | undefined, meta: {
    isMain: boolean;
    sortOrder?: number;
}): Promise<{
    price: string;
    category: {
        id: number;
        nameEn: string;
        nameAr: string;
        slug: string;
    };
    images: {
        id: string;
        urlThumb: string;
        urlLarge: string;
        isMain: boolean;
        sortOrder: number;
        productId: string;
    }[];
    fitments: ({
        vehicle: {
            id: number;
            nameEn: string;
            nameAr: string;
            brand: string;
            series: string;
            specifics: string;
            chassisCode: string;
            yearRange: string;
        };
    } & {
        id: number;
        productId: string;
        vehicleId: number;
    })[];
    id: string;
    createdAt: Date;
    nameEn: string;
    nameAr: string;
    sku: string;
    oemNumber: string | null;
    categoryId: number;
    brandName: string;
    descEn: string | null;
    descAr: string | null;
    stockQuantity: number;
    isFeatured: boolean;
    isActive: boolean;
    dimensions: string | null;
    weight: number | null;
    manufacturedIn: string | null;
    generation: string | null;
    condition: string;
    updatedAt: Date;
}>;
export declare function deleteProductImage(productId: string, imageId: string): Promise<void>;
export declare function replaceFitments(productId: string, vehicleIds: number[]): Promise<void>;
export declare function patchInventory(id: string, stockQuantity: number): Promise<{
    price: string;
    category: {
        id: number;
        nameEn: string;
        nameAr: string;
        slug: string;
    };
    images: {
        id: string;
        urlThumb: string;
        urlLarge: string;
        isMain: boolean;
        sortOrder: number;
        productId: string;
    }[];
    fitments: ({
        vehicle: {
            id: number;
            nameEn: string;
            nameAr: string;
            brand: string;
            series: string;
            specifics: string;
            chassisCode: string;
            yearRange: string;
        };
    } & {
        id: number;
        productId: string;
        vehicleId: number;
    })[];
    id: string;
    createdAt: Date;
    nameEn: string;
    nameAr: string;
    sku: string;
    oemNumber: string | null;
    categoryId: number;
    brandName: string;
    descEn: string | null;
    descAr: string | null;
    stockQuantity: number;
    isFeatured: boolean;
    isActive: boolean;
    dimensions: string | null;
    weight: number | null;
    manufacturedIn: string | null;
    generation: string | null;
    condition: string;
    updatedAt: Date;
}>;
export declare function bulkPatchInventory(updates: {
    id: string;
    stockQuantity: number;
}[]): Promise<{
    updated: number;
}>;
export declare function listProductsPublic(q: {
    page?: number;
    limit?: number;
    categoryId?: number;
    categorySlug?: string;
    vehicleId?: number;
    oem?: string;
    q?: string;
}): Promise<{
    products: {
        price: string;
        category: {
            id: number;
            nameEn: string;
            nameAr: string;
            slug: string;
        };
        images: {
            id: string;
            urlThumb: string;
            urlLarge: string;
            isMain: boolean;
            sortOrder: number;
        }[];
        id: string;
        createdAt: Date;
        nameEn: string;
        nameAr: string;
        sku: string;
        oemNumber: string | null;
        categoryId: number;
        brandName: string;
        descEn: string | null;
        descAr: string | null;
        stockQuantity: number;
        isFeatured: boolean;
        isActive: boolean;
        dimensions: string | null;
        weight: number | null;
        manufacturedIn: string | null;
        generation: string | null;
        condition: string;
        updatedAt: Date;
    }[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function listFeaturedProductsPublic(q: {
    page?: number;
    limit?: number;
}): Promise<{
    products: ReturnType<typeof mapListRow>[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getProductFitmentsPublic(id: string): Promise<{
    vehicles: {
        id: number;
        nameEn: string;
        nameAr: string;
        brand: string;
        series: string;
        specifics: string;
        chassisCode: string;
        yearRange: string;
    }[];
}>;
export declare function getProductPublic(id: string): Promise<{
    price: string;
    category: {
        id: number;
        nameEn: string;
        nameAr: string;
        slug: string;
    };
    images: {
        id: string;
        urlThumb: string;
        urlLarge: string;
        isMain: boolean;
        sortOrder: number;
        productId: string;
    }[];
    fitments: ({
        vehicle: {
            id: number;
            nameEn: string;
            nameAr: string;
            brand: string;
            series: string;
            specifics: string;
            chassisCode: string;
            yearRange: string;
        };
    } & {
        id: number;
        productId: string;
        vehicleId: number;
    })[];
    id: string;
    createdAt: Date;
    nameEn: string;
    nameAr: string;
    sku: string;
    oemNumber: string | null;
    categoryId: number;
    brandName: string;
    descEn: string | null;
    descAr: string | null;
    stockQuantity: number;
    isFeatured: boolean;
    isActive: boolean;
    dimensions: string | null;
    weight: number | null;
    manufacturedIn: string | null;
    generation: string | null;
    condition: string;
    updatedAt: Date;
}>;
export {};
//# sourceMappingURL=product.service.d.ts.map