import { prisma } from "../lib/prisma.js";
const listImageArgs = {
    orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
    take: 1,
    select: {
        id: true,
        urlThumb: true,
        urlLarge: true,
        isMain: true,
        sortOrder: true,
    },
};
const categorySelect = {
    id: true,
    slug: true,
    nameEn: true,
    nameAr: true,
};
export function buildAdminProductWhere(q) {
    const where = {};
    if (q.categoryId !== undefined) {
        where.categoryId = q.categoryId;
    }
    if (q.brandName !== undefined) {
        where.brandName = { equals: q.brandName, mode: "insensitive" };
    }
    if (q.isActive !== undefined) {
        where.isActive = q.isActive;
    }
    if (q.isFeatured !== undefined) {
        where.isFeatured = q.isFeatured;
    }
    if (q.search !== undefined) {
        const s = q.search.trim();
        where.OR = [
            { sku: { contains: s, mode: "insensitive" } },
            { nameEn: { contains: s, mode: "insensitive" } },
            { nameAr: { contains: s, mode: "insensitive" } },
            { oemNumber: { contains: s, mode: "insensitive" } },
        ];
    }
    return where;
}
export function buildPublicProductWhere(q) {
    const where = { isActive: true };
    if (q.categoryId !== undefined) {
        where.categoryId = q.categoryId;
    }
    if (q.vehicleId !== undefined) {
        where.fitments = { some: { vehicleId: q.vehicleId } };
    }
    const andClauses = [];
    if (q.oemContains !== undefined) {
        const o = q.oemContains.trim();
        andClauses.push({
            oemNumber: { contains: o, mode: "insensitive" },
        });
    }
    if (q.search !== undefined) {
        const s = q.search.trim();
        andClauses.push({
            OR: [
                { sku: { contains: s, mode: "insensitive" } },
                { nameEn: { contains: s, mode: "insensitive" } },
                { nameAr: { contains: s, mode: "insensitive" } },
                { oemNumber: { contains: s, mode: "insensitive" } },
            ],
        });
    }
    if (andClauses.length > 0) {
        where.AND = andClauses;
    }
    return where;
}
const adminListInclude = {
    category: { select: categorySelect },
    images: listImageArgs,
};
const publicListInclude = adminListInclude;
const detailInclude = {
    category: { select: categorySelect },
    images: {
        orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
    },
    fitments: {
        include: {
            vehicle: true,
        },
    },
};
export async function countProductsWhere(where) {
    return prisma.product.count({ where });
}
export async function listProductsWhere(where, params) {
    return prisma.product.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: params.skip,
        take: params.take,
        include: adminListInclude,
    });
}
export async function findProductDetailById(id) {
    return prisma.product.findUnique({
        where: { id },
        include: detailInclude,
    });
}
export async function findActiveProductDetailById(id) {
    return prisma.product.findFirst({
        where: { id, isActive: true },
        include: detailInclude,
    });
}
export async function createProduct(data) {
    return prisma.product.create({
        data,
        include: detailInclude,
    });
}
export async function updateProduct(id, data) {
    return prisma.product.update({
        where: { id },
        data,
        include: detailInclude,
    });
}
export async function deleteProductById(id) {
    await prisma.product.delete({ where: { id } });
}
export async function findProductImageForDeletion(productId, imageId) {
    return prisma.productImage.findFirst({
        where: { id: imageId, productId },
        select: { urlThumb: true, urlLarge: true },
    });
}
export async function createProductImageTx(tx, input) {
    await tx.productImage.create({ data: input });
}
export async function clearMainImageFlagsTx(tx, productId) {
    await tx.productImage.updateMany({
        where: { productId },
        data: { isMain: false },
    });
}
export async function nextImageSortOrder(productId) {
    const agg = await prisma.productImage.aggregate({
        where: { productId },
        _max: { sortOrder: true },
    });
    return (agg._max.sortOrder ?? -1) + 1;
}
export async function deleteProductImage(productId, imageId) {
    const r = await prisma.productImage.deleteMany({
        where: { id: imageId, productId },
    });
    return r.count;
}
export async function ensureOneMainImage(productId) {
    const main = await prisma.productImage.findFirst({
        where: { productId, isMain: true },
    });
    if (main) {
        return;
    }
    const first = await prisma.productImage.findFirst({
        where: { productId },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    if (!first) {
        return;
    }
    await prisma.productImage.update({
        where: { id: first.id },
        data: { isMain: true },
    });
}
export async function listImagesUrlsForProduct(productId) {
    const rows = await prisma.productImage.findMany({
        where: { productId },
        select: { urlThumb: true, urlLarge: true },
    });
    return rows;
}
export async function replaceFitments(productId, vehicleIds) {
    await prisma.$transaction(async (tx) => {
        await tx.fitment.deleteMany({ where: { productId } });
        if (vehicleIds.length > 0) {
            await tx.fitment.createMany({
                data: vehicleIds.map((vehicleId) => ({ productId, vehicleId })),
            });
        }
    });
}
export async function listVehicleIdsByIds(ids) {
    if (ids.length === 0) {
        return new Set();
    }
    const rows = await prisma.vehicle.findMany({
        where: { id: { in: ids } },
        select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
}
export async function updateProductStock(id, stockQuantity) {
    return prisma.product.update({
        where: { id },
        data: { stockQuantity },
        include: detailInclude,
    });
}
export async function bulkUpdateProductStock(updates) {
    if (updates.length === 0) {
        return 0;
    }
    const results = await prisma.$transaction(updates.map((u) => prisma.product.updateMany({
        where: { id: u.id },
        data: { stockQuantity: u.stockQuantity },
    })));
    return results.reduce((acc, r) => acc + r.count, 0);
}
export function listPublicProducts(where, params) {
    return prisma.product.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }, { id: "desc" }],
        skip: params.skip,
        take: params.take,
        include: publicListInclude,
    });
}
const featuredPublicWhere = {
    isActive: true,
    isFeatured: true,
};
export function listFeaturedPublicProducts(params) {
    return prisma.product.findMany({
        where: featuredPublicWhere,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        skip: params.skip,
        take: params.take,
        include: publicListInclude,
    });
}
export async function countFeaturedPublicProducts() {
    return prisma.product.count({ where: featuredPublicWhere });
}
export async function findActiveProductVehicles(id) {
    const p = await prisma.product.findFirst({
        where: { id, isActive: true },
        select: {
            fitments: {
                orderBy: { vehicleId: "asc" },
                select: { vehicle: true },
            },
        },
    });
    if (!p) {
        return null;
    }
    return p.fitments.map((f) => f.vehicle);
}
//# sourceMappingURL=product.repository.js.map