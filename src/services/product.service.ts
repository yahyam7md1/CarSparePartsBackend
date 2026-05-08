import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getProductDeps } from "../config/runtime.js";
import { ALLOWED_IMAGE_MIMETYPES, makeLargeWebp, makeThumbWebp } from "../lib/image-processing.js";
import { prisma } from "../lib/prisma.js";
import * as categoryRepository from "../repositories/category.repository.js";
import * as productRepository from "../repositories/product.repository.js";
import type { ProductAdminListRow, ProductDetail, PublicProductSort } from "../repositories/product.repository.js";
import { publicUrlToStorageKey } from "../utils/product-storage-paths.js";
import { HttpError } from "../utils/errors.js";

function mapDetail(p: ProductDetail) {
  return {
    ...p,
    price: p.price.toString(),
    compareAtPrice: p.compareAtPrice != null ? p.compareAtPrice.toString() : null,
  };
}

function mapListRow(p: ProductAdminListRow) {
  const { _count, ...rest } = p;
  return {
    ...rest,
    price: p.price.toString(),
    compareAtPrice: p.compareAtPrice != null ? p.compareAtPrice.toString() : null,
    fitmentCount: _count.fitments,
  };
}

function handlePrismaProductError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined) ?? [];
      const t = target.join(", ");
      throw new HttpError(
        409,
        t.includes("sku") ? "SKU already exists" : "Duplicate value violates a unique constraint",
      );
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

export async function listProductsAdmin(q: {
  page?: number;
  limit?: number;
  categoryId?: number;
  brandName?: string;
  vehicleId?: number;
  chassisCode?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  q?: string;
}): Promise<{
  products: ReturnType<typeof mapListRow>[];
  total: number;
  page: number;
  limit: number;
}> {
  const limit = Math.min(Math.max(q.limit ?? 50, 1), 200);
  const page = Math.max(q.page ?? 1, 1);
  const skip = (page - 1) * limit;
  const where = productRepository.buildAdminProductWhere({
    ...(q.categoryId !== undefined ? { categoryId: q.categoryId } : {}),
    ...(q.brandName !== undefined ? { brandName: q.brandName } : {}),
    ...(q.vehicleId !== undefined ? { vehicleId: q.vehicleId } : {}),
    ...(q.chassisCode !== undefined ? { chassisCode: q.chassisCode } : {}),
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

export async function getProductAdmin(id: string) {
  const p = await productRepository.findProductDetailById(id);
  if (!p) {
    throw new HttpError(404, "Product not found");
  }
  return mapDetail(p);
}

export async function createProduct(input: {
  sku: string;
  oemNumber?: string | null;
  oemNumbers?: string[];
  movementClass?: "slow" | "medium" | "fast";
  categoryId: number;
  brandName: string;
  nameEn: string;
  nameAr: string;
  descEn?: string | null;
  descAr?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  dimensions?: string | null;
  weight?: number | null;
  manufacturedIn?: string | null;
  generation?: string | null;
  condition?: "new" | "used";
  stockAlertThresholdFast?: number | null;
  stockAlertThresholdMedium?: number | null;
  stockAlertThresholdSlow?: number | null;
}) {
  const cat = await categoryRepository.findCategoryById(input.categoryId);
  if (!cat) {
    throw new HttpError(400, "Category not found");
  }
  try {
    const oemList: string[] = [...(input.oemNumbers ?? [])];
    const single = input.oemNumber?.trim();
    if (single) oemList.unshift(single);
    const p = await productRepository.createProduct({
      sku: input.sku.trim(),
      movementClass: input.movementClass ?? "medium",
      categoryId: input.categoryId,
      brandName: input.brandName.trim(),
      nameEn: input.nameEn.trim(),
      nameAr: input.nameAr.trim(),
      descEn: input.descEn ?? null,
      descAr: input.descAr ?? null,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      stockQuantity: input.stockQuantity ?? 0,
      isFeatured: input.isFeatured ?? false,
      isActive: input.isActive ?? true,
      dimensions: input.dimensions ?? null,
      weight: input.weight ?? null,
      manufacturedIn: input.manufacturedIn ?? null,
      generation: input.generation ?? null,
      condition: input.condition ?? "new",
      stockAlertThresholdFast: input.stockAlertThresholdFast ?? null,
      stockAlertThresholdMedium: input.stockAlertThresholdMedium ?? null,
      stockAlertThresholdSlow: input.stockAlertThresholdSlow ?? null,
      oems: oemList,
    });
    return mapDetail(p);
  } catch (err) {
    handlePrismaProductError(err);
  }
}

export async function updateProduct(
  id: string,
  input: {
    sku?: string;
    oemNumber?: string | null;
    oemNumbers?: string[];
    movementClass?: "slow" | "medium" | "fast";
    categoryId?: number;
    brandName?: string;
    nameEn?: string;
    nameAr?: string;
    descEn?: string | null;
    descAr?: string | null;
    price?: number;
    compareAtPrice?: number | null;
    stockQuantity?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    dimensions?: string | null;
    weight?: number | null;
    manufacturedIn?: string | null;
    generation?: string | null;
    condition?: "new" | "used";
    stockAlertThresholdFast?: number | null;
    stockAlertThresholdMedium?: number | null;
    stockAlertThresholdSlow?: number | null;
  },
) {
  if (input.categoryId !== undefined) {
    const cat = await categoryRepository.findCategoryById(input.categoryId);
    if (!cat) {
      throw new HttpError(400, "Category not found");
    }
  }
  const data: Prisma.ProductUpdateInput = {};
  if (input.sku !== undefined) {
    data.sku = input.sku.trim();
  }
  if (input.movementClass !== undefined) {
    data.movementClass = input.movementClass;
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
  if (input.compareAtPrice !== undefined) {
    data.compareAtPrice = input.compareAtPrice;
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
  if (input.stockAlertThresholdFast !== undefined) {
    data.stockAlertThresholdFast = input.stockAlertThresholdFast;
  }
  if (input.stockAlertThresholdMedium !== undefined) {
    data.stockAlertThresholdMedium = input.stockAlertThresholdMedium;
  }
  if (input.stockAlertThresholdSlow !== undefined) {
    data.stockAlertThresholdSlow = input.stockAlertThresholdSlow;
  }
  let oemPatch: string[] | undefined;
  if (input.oemNumbers !== undefined) {
    oemPatch = input.oemNumbers;
  } else if (input.oemNumber !== undefined) {
    oemPatch =
      input.oemNumber === null || !String(input.oemNumber).trim()
        ? []
        : [String(input.oemNumber).trim()];
  }

  try {
    const p = await productRepository.applyProductUpdate(
      id,
      data,
      oemPatch,
    );
    return mapDetail(p);
  } catch (err) {
    handlePrismaProductError(err);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const { storage, storageEnv } = getProductDeps();
  const existing = await productRepository.findProductDetailById(id);
  if (!existing) {
    throw new HttpError(404, "Product not found");
  }
  const urls = await productRepository.listImagesUrlsForProduct(id);
  try {
    await productRepository.deleteProductById(id);
  } catch (err) {
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

export async function uploadProductImage(
  productId: string,
  file: { buffer: Buffer; mimetype: string } | undefined,
  meta: { isMain: boolean; sortOrder?: number },
) {
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
  const sortOrder =
    meta.sortOrder !== undefined
      ? meta.sortOrder
      : await productRepository.nextImageSortOrder(productId);
  const base = randomUUID();
  const keyThumb = `products/${productId}/${base}_thumb.webp`;
  const keyLarge = `products/${productId}/${base}_large.webp`;
  let thumbBuf: Buffer;
  let largeBuf: Buffer;
  try {
    thumbBuf = await makeThumbWebp(file.buffer);
    largeBuf = await makeLargeWebp(file.buffer);
  } catch {
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
  } catch (err) {
    await storage.deleteObject(keyThumb).catch(() => {});
    await storage.deleteObject(keyLarge).catch(() => {});
    throw err;
  }
  const updated = await productRepository.findProductDetailById(productId);
  if (!updated) {
    throw new HttpError(500, "Product missing after upload");
  }
  return mapDetail(updated);
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
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

export async function replaceFitments(productId: string, vehicleIds: number[]): Promise<void> {
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

export async function patchInventory(id: string, stockQuantity: number) {
  try {
    const p = await productRepository.updateProductStock(id, stockQuantity);
    return mapDetail(p);
  } catch (err) {
    handlePrismaProductError(err);
  }
}

export async function bulkPatchInventory(
  updates: { id: string; stockQuantity: number }[],
): Promise<{ updated: number }> {
  const byId = new Map<string, number>();
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

export async function listProductsPublic(q: {
  page?: number;
  limit?: number;
  categoryId?: number;
  categorySlug?: string;
  vehicleId?: number;
  oem?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: PublicProductSort;
}) {
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
  if (
    q.minPrice !== undefined &&
    q.maxPrice !== undefined &&
    q.minPrice > q.maxPrice
  ) {
    throw new HttpError(400, "minPrice cannot be greater than maxPrice");
  }
  const limit = Math.min(Math.max(q.limit ?? 50, 1), 200);
  const page = Math.max(q.page ?? 1, 1);
  const skip = (page - 1) * limit;
  const where = productRepository.buildPublicProductWhere({
    ...(categoryId !== undefined ? { categoryId } : {}),
    ...(q.vehicleId !== undefined ? { vehicleId: q.vehicleId } : {}),
    ...(q.oem !== undefined ? { oemContains: q.oem } : {}),
    ...(q.q !== undefined ? { search: q.q } : {}),
    ...(q.minPrice !== undefined ? { minPrice: q.minPrice } : {}),
    ...(q.maxPrice !== undefined ? { maxPrice: q.maxPrice } : {}),
  });
  const [rows, total] = await Promise.all([
    productRepository.listPublicProducts(where, {
      skip,
      take: limit,
      ...(q.sort !== undefined ? { sort: q.sort } : {}),
    }),
    productRepository.countProductsWhere(where),
  ]);
  return {
    products: rows.map(mapListRow),
    total,
    page,
    limit,
  };
}

export async function listFeaturedProductsPublic(q: { page?: number; limit?: number }): Promise<{
  products: ReturnType<typeof mapListRow>[];
  total: number;
  page: number;
  limit: number;
}> {
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

export async function getProductFitmentsPublic(id: string) {
  const vehicles = await productRepository.findActiveProductVehicles(id);
  if (vehicles === null) {
    throw new HttpError(404, "Product not found");
  }
  return { vehicles };
}

export async function getProductPublic(id: string) {
  const p = await productRepository.findActiveProductDetailById(id);
  if (!p) {
    throw new HttpError(404, "Product not found");
  }
  return mapDetail(p);
}
