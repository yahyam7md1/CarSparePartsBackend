import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getProductDeps } from "../config/runtime.js";
import { ALLOWED_IMAGE_MIMETYPES, makeLargeWebp, makeThumbWebp } from "../lib/image-processing.js";
import { prisma } from "../lib/prisma.js";
import * as categoryRepository from "../repositories/category.repository.js";
import * as productRepository from "../repositories/product.repository.js";
import { publicUrlToStorageKey } from "../utils/product-storage-paths.js";
import { HttpError } from "../utils/errors.js";
function mapDetail(p) {
    return {
        ...p,
        price: p.price.toString(),
    };
}
function mapListRow(p) {
    return {
        ...p,
        price: p.price.toString(),
    };
}
function handlePrismaProductError(err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            const target = err.meta?.target ?? [];
            const t = target.join(", ");
            throw new HttpError(409, t.includes("sku") ? "SKU already exists" : "Duplicate value violates a unique constraint");
        }
        if (err.code === "P2003") {
            throw new HttpError(400, "Invalid reference (for example, category does not exist)");
        }
        if (err.code === "P2025") {
            throw new HttpError(404, "Product not found");
        }
    }
    throw err;
}
export async function listProductsAdmin(q) {
    const limit = Math.min(Math.max(q.limit ?? 50, 1), 200);
    const page = Math.max(q.page ?? 1, 1);
    const skip = (page - 1) * limit;
    const where = productRepository.buildAdminProductWhere({
        ...(q.categoryId !== undefined ? { categoryId: q.categoryId } : {}),
        ...(q.brandName !== undefined ? { brandName: q.brandName } : {}),
        ...(q.isActive !== undefined ? { isActive: q.isActive } : {}),
        ...(q.isFeatured !== undefined ? { isFeatured: q.isFeatured } : {}),
        ...(q.q !== undefined ? { search: q.q } : {}),
    });
    const [rows, total] = await Promise.all([
        productRepository.listProductsWhere(where, { skip, take: limit }),
        productRepository.countProductsWhere(where),
    ]);
    return {
        products: rows.map(mapListRow),
        total,
        page,
        limit,
    };
}
export async function getProductAdmin(id) {
    const p = await productRepository.findProductDetailById(id);
    if (!p) {
        throw new HttpError(404, "Product not found");
    }
    return mapDetail(p);
}
export async function createProduct(input) {
    const cat = await categoryRepository.findCategoryById(input.categoryId);
    if (!cat) {
        throw new HttpError(400, "Category not found");
    }
    try {
        const p = await productRepository.createProduct({
            sku: input.sku.trim(),
            oemNumber: input.oemNumber ?? null,
            categoryId: input.categoryId,
            brandName: input.brandName.trim(),
            nameEn: input.nameEn.trim(),
            nameAr: input.nameAr.trim(),
            descEn: input.descEn ?? null,
            descAr: input.descAr ?? null,
            price: input.price,
            stockQuantity: input.stockQuantity ?? 0,
            isFeatured: input.isFeatured ?? false,
            isActive: input.isActive ?? true,
            dimensions: input.dimensions ?? null,
            weight: input.weight ?? null,
            manufacturedIn: input.manufacturedIn ?? null,
            generation: input.generation ?? null,
            condition: input.condition ?? "new",
        });
        return mapDetail(p);
    }
    catch (err) {
        handlePrismaProductError(err);
    }
}
export async function updateProduct(id, input) {
    if (input.categoryId !== undefined) {
        const cat = await categoryRepository.findCategoryById(input.categoryId);
        if (!cat) {
            throw new HttpError(400, "Category not found");
        }
    }
    const data = {};
    if (input.sku !== undefined) {
        data.sku = input.sku.trim();
    }
    if (input.oemNumber !== undefined) {
        data.oemNumber = input.oemNumber;
    }
    if (input.categoryId !== undefined) {
        data.category = { connect: { id: input.categoryId } };
    }
    if (input.brandName !== undefined) {
        data.brandName = input.brandName.trim();
    }
    if (input.nameEn !== undefined) {
        data.nameEn = input.nameEn.trim();
    }
    if (input.nameAr !== undefined) {
        data.nameAr = input.nameAr.trim();
    }
    if (input.descEn !== undefined) {
        data.descEn = input.descEn;
    }
    if (input.descAr !== undefined) {
        data.descAr = input.descAr;
    }
    if (input.price !== undefined) {
        data.price = input.price;
    }
    if (input.stockQuantity !== undefined) {
        data.stockQuantity = input.stockQuantity;
    }
    if (input.isFeatured !== undefined) {
        data.isFeatured = input.isFeatured;
    }
    if (input.isActive !== undefined) {
        data.isActive = input.isActive;
    }
    if (input.dimensions !== undefined) {
        data.dimensions = input.dimensions;
    }
    if (input.weight !== undefined) {
        data.weight = input.weight;
    }
    if (input.manufacturedIn !== undefined) {
        data.manufacturedIn = input.manufacturedIn;
    }
    if (input.generation !== undefined) {
        data.generation = input.generation;
    }
    if (input.condition !== undefined) {
        data.condition = input.condition;
    }
    try {
        const p = await productRepository.updateProduct(id, data);
        return mapDetail(p);
    }
    catch (err) {
        handlePrismaProductError(err);
    }
}
export async function deleteProduct(id) {
    const { storage, storageEnv } = getProductDeps();
    const existing = await productRepository.findProductDetailById(id);
    if (!existing) {
        throw new HttpError(404, "Product not found");
    }
    const urls = await productRepository.listImagesUrlsForProduct(id);
    try {
        await productRepository.deleteProductById(id);
    }
    catch (err) {
        handlePrismaProductError(err);
    }
    for (const u of urls) {
        const kThumb = publicUrlToStorageKey(storageEnv, u.urlThumb);
        const kLarge = publicUrlToStorageKey(storageEnv, u.urlLarge);
        if (kThumb) {
            await storage.deleteObject(kThumb);
        }
        if (kLarge) {
            await storage.deleteObject(kLarge);
        }
    }
}
export async function uploadProductImage(productId, file, meta) {
    if (!file) {
        throw new HttpError(400, "file is required (multipart field name: file)");
    }
    if (!ALLOWED_IMAGE_MIMETYPES.has(file.mimetype)) {
        throw new HttpError(400, "Unsupported file type (use JPEG, PNG, or WebP)");
    }
    const product = await productRepository.findProductDetailById(productId);
    if (!product) {
        throw new HttpError(404, "Product not found");
    }
    const { storage, storageEnv } = getProductDeps();
    const existingCount = await prisma.productImage.count({ where: { productId } });
    let isMain = meta.isMain;
    if (existingCount === 0) {
        isMain = true;
    }
    const sortOrder = meta.sortOrder !== undefined
        ? meta.sortOrder
        : await productRepository.nextImageSortOrder(productId);
    const base = randomUUID();
    const keyThumb = `products/${productId}/${base}_thumb.webp`;
    const keyLarge = `products/${productId}/${base}_large.webp`;
    let thumbBuf;
    let largeBuf;
    try {
        thumbBuf = await makeThumbWebp(file.buffer);
        largeBuf = await makeLargeWebp(file.buffer);
    }
    catch {
        throw new HttpError(400, "Could not process image");
    }
    const urlThumb = storage.publicUrlForKey(keyThumb);
    const urlLarge = storage.publicUrlForKey(keyLarge);
    try {
        await storage.putObject(keyThumb, thumbBuf, "image/webp");
        await storage.putObject(keyLarge, largeBuf, "image/webp");
        await prisma.$transaction(async (tx) => {
            if (isMain) {
                await productRepository.clearMainImageFlagsTx(tx, productId);
            }
            await productRepository.createProductImageTx(tx, {
                productId,
                urlThumb,
                urlLarge,
                isMain,
                sortOrder,
            });
        });
    }
    catch (err) {
        await storage.deleteObject(keyThumb).catch(() => { });
        await storage.deleteObject(keyLarge).catch(() => { });
        throw err;
    }
    const updated = await productRepository.findProductDetailById(productId);
    if (!updated) {
        throw new HttpError(500, "Product missing after upload");
    }
    return mapDetail(updated);
}
export async function deleteProductImage(productId, imageId) {
    const { storage, storageEnv } = getProductDeps();
    const row = await productRepository.findProductImageForDeletion(productId, imageId);
    if (!row) {
        throw new HttpError(404, "Image not found");
    }
    const n = await productRepository.deleteProductImage(productId, imageId);
    if (n === 0) {
        throw new HttpError(404, "Image not found");
    }
    const kThumb = publicUrlToStorageKey(storageEnv, row.urlThumb);
    const kLarge = publicUrlToStorageKey(storageEnv, row.urlLarge);
    if (kThumb) {
        await storage.deleteObject(kThumb);
    }
    if (kLarge) {
        await storage.deleteObject(kLarge);
    }
    await productRepository.ensureOneMainImage(productId);
}
export async function replaceFitments(productId, vehicleIds) {
    const p = await productRepository.findProductDetailById(productId);
    if (!p) {
        throw new HttpError(404, "Product not found");
    }
    if (vehicleIds.length === 0) {
        await productRepository.replaceFitments(productId, []);
        return;
    }
    const found = await productRepository.listVehicleIdsByIds(vehicleIds);
    if (found.size !== vehicleIds.length) {
        throw new HttpError(400, "One or more vehicles were not found");
    }
    await productRepository.replaceFitments(productId, vehicleIds);
}
export async function patchInventory(id, stockQuantity) {
    try {
        const p = await productRepository.updateProductStock(id, stockQuantity);
        return mapDetail(p);
    }
    catch (err) {
        handlePrismaProductError(err);
    }
}
export async function bulkPatchInventory(updates) {
    const byId = new Map();
    for (const u of updates) {
        byId.set(u.id, u.stockQuantity);
    }
    const normalized = [...byId.entries()].map(([id, stockQuantity]) => ({ id, stockQuantity }));
    const ids = normalized.map((u) => u.id);
    const rows = await prisma.product.findMany({
        where: { id: { in: ids } },
        select: { id: true },
    });
    if (rows.length !== ids.length) {
        throw new HttpError(400, "One or more products were not found");
    }
    const count = await productRepository.bulkUpdateProductStock(normalized);
    return { updated: count };
}
export async function listProductsPublic(q) {
    let categoryId = q.categoryId;
    if (q.categorySlug !== undefined) {
        const cat = await categoryRepository.findCategoryBySlug(q.categorySlug.trim());
        if (!cat) {
            throw new HttpError(400, "Category not found");
        }
        if (categoryId !== undefined && categoryId !== cat.id) {
            throw new HttpError(400, "categoryId does not match categorySlug");
        }
        categoryId = cat.id;
    }
    const limit = Math.min(Math.max(q.limit ?? 50, 1), 200);
    const page = Math.max(q.page ?? 1, 1);
    const skip = (page - 1) * limit;
    const where = productRepository.buildPublicProductWhere({
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(q.vehicleId !== undefined ? { vehicleId: q.vehicleId } : {}),
        ...(q.oem !== undefined ? { oemContains: q.oem } : {}),
        ...(q.q !== undefined ? { search: q.q } : {}),
    });
    const [rows, total] = await Promise.all([
        productRepository.listPublicProducts(where, { skip, take: limit }),
        productRepository.countProductsWhere(where),
    ]);
    return {
        products: rows.map(mapListRow),
        total,
        page,
        limit,
    };
}
export async function listFeaturedProductsPublic(q) {
    const limit = Math.min(Math.max(q.limit ?? 12, 1), 50);
    const page = Math.max(q.page ?? 1, 1);
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
        productRepository.listFeaturedPublicProducts({ skip, take: limit }),
        productRepository.countFeaturedPublicProducts(),
    ]);
    return {
        products: rows.map(mapListRow),
        total,
        page,
        limit,
    };
}
export async function getProductFitmentsPublic(id) {
    const vehicles = await productRepository.findActiveProductVehicles(id);
    if (vehicles === null) {
        throw new HttpError(404, "Product not found");
    }
    return { vehicles };
}
export async function getProductPublic(id) {
    const p = await productRepository.findActiveProductDetailById(id);
    if (!p) {
        throw new HttpError(404, "Product not found");
    }
    return mapDetail(p);
}
//# sourceMappingURL=product.service.js.map