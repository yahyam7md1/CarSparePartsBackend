import type { Prisma } from "@prisma/client";
export declare function buildAdminProductWhere(q: {
    categoryId?: number;
    brandName?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    search?: string;
}): Prisma.ProductWhereInput;
export declare function buildPublicProductWhere(q: {
    categoryId?: number;
    search?: string;
}): Prisma.ProductWhereInput;
declare const adminListInclude: {
    category: {
        select: {
            readonly id: true;
            readonly slug: true;
            readonly nameEn: true;
            readonly nameAr: true;
        };
    };
    images: {
        orderBy: ({
            isMain: "desc";
            sortOrder?: never;
            id?: never;
        } | {
            sortOrder: "asc";
            isMain?: never;
            id?: never;
        } | {
            id: "asc";
            isMain?: never;
            sortOrder?: never;
        })[];
        take: number;
        select: {
            id: boolean;
            urlThumb: boolean;
            urlLarge: boolean;
            isMain: boolean;
            sortOrder: boolean;
        };
    };
};
declare const detailInclude: {
    category: {
        select: {
            readonly id: true;
            readonly slug: true;
            readonly nameEn: true;
            readonly nameAr: true;
        };
    };
    images: {
        orderBy: ({
            isMain: "desc";
            sortOrder?: never;
            id?: never;
        } | {
            sortOrder: "asc";
            isMain?: never;
            id?: never;
        } | {
            id: "asc";
            isMain?: never;
            sortOrder?: never;
        })[];
    };
    fitments: {
        include: {
            vehicle: true;
        };
    };
};
export type ProductAdminListRow = Prisma.ProductGetPayload<{
    include: typeof adminListInclude;
}>;
export type ProductDetail = Prisma.ProductGetPayload<{
    include: typeof detailInclude;
}>;
export declare function countProductsWhere(where: Prisma.ProductWhereInput): Promise<number>;
export declare function listProductsWhere(where: Prisma.ProductWhereInput, params: {
    skip: number;
    take: number;
}): Promise<ProductAdminListRow[]>;
export declare function findProductDetailById(id: string): Promise<ProductDetail | null>;
export declare function findActiveProductDetailById(id: string): Promise<ProductDetail | null>;
export declare function createProduct(data: {
    sku: string;
    oemNumber: string | null;
    categoryId: number;
    brandName: string;
    nameEn: string;
    nameAr: string;
    descEn: string | null;
    descAr: string | null;
    price: Prisma.Decimal | number | string;
    stockQuantity: number;
    isFeatured: boolean;
    isActive: boolean;
    dimensions: string | null;
    weight: number | null;
    manufacturedIn: string | null;
    condition: string;
}): Promise<ProductDetail>;
export declare function updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<ProductDetail>;
export declare function deleteProductById(id: string): Promise<void>;
export declare function findProductImageForDeletion(productId: string, imageId: string): Promise<{
    urlThumb: string;
    urlLarge: string;
} | null>;
export declare function createProductImageTx(tx: Prisma.TransactionClient, input: {
    productId: string;
    urlThumb: string;
    urlLarge: string;
    isMain: boolean;
    sortOrder: number;
}): Promise<void>;
export declare function clearMainImageFlagsTx(tx: Prisma.TransactionClient, productId: string): Promise<void>;
export declare function nextImageSortOrder(productId: string): Promise<number>;
export declare function deleteProductImage(productId: string, imageId: string): Promise<number>;
export declare function ensureOneMainImage(productId: string): Promise<void>;
export declare function listImagesUrlsForProduct(productId: string): Promise<{
    urlThumb: string;
    urlLarge: string;
}[]>;
export declare function replaceFitments(productId: string, vehicleIds: number[]): Promise<void>;
export declare function listVehicleIdsByIds(ids: number[]): Promise<Set<number>>;
export declare function updateProductStock(id: string, stockQuantity: number): Promise<ProductDetail>;
export declare function bulkUpdateProductStock(updates: {
    id: string;
    stockQuantity: number;
}[]): Promise<number>;
export declare function listPublicProducts(where: Prisma.ProductWhereInput, params: {
    skip: number;
    take: number;
}): Promise<ProductAdminListRow[]>;
export {};
//# sourceMappingURL=product.repository.d.ts.map