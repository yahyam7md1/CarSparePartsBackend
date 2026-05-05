import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const listImageArgs = {
  orderBy: [{ isMain: "desc" as const }, { sortOrder: "asc" as const }, { id: "asc" as const }],
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
} as const;

export function buildAdminProductWhere(q: {
  categoryId?: number;
  brandName?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
}): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
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

export function buildPublicProductWhere(q: {
  categoryId?: number;
  search?: string;
}): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (q.categoryId !== undefined) {
    where.categoryId = q.categoryId;
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

const adminListInclude = {
  category: { select: categorySelect },
  images: listImageArgs,
} satisfies Prisma.ProductInclude;

const publicListInclude = adminListInclude;

const detailInclude = {
  category: { select: categorySelect },
  images: {
    orderBy: [{ isMain: "desc" as const }, { sortOrder: "asc" as const }, { id: "asc" as const }],
  },
  fitments: {
    include: {
      vehicle: true,
    },
  },
} satisfies Prisma.ProductInclude;

export type ProductAdminListRow = Prisma.ProductGetPayload<{
  include: typeof adminListInclude;
}>;

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof detailInclude;
}>;

export async function countProductsWhere(where: Prisma.ProductWhereInput): Promise<number> {
  return prisma.product.count({ where });
}

export async function listProductsWhere(
  where: Prisma.ProductWhereInput,
  params: { skip: number; take: number },
): Promise<ProductAdminListRow[]> {
  return prisma.product.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: params.skip,
    take: params.take,
    include: adminListInclude,
  });
}

export async function findProductDetailById(id: string): Promise<ProductDetail | null> {
  return prisma.product.findUnique({
    where: { id },
    include: detailInclude,
  });
}

export async function findActiveProductDetailById(
  id: string,
): Promise<ProductDetail | null> {
  return prisma.product.findFirst({
    where: { id, isActive: true },
    include: detailInclude,
  });
}

export async function createProduct(data: {
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
}): Promise<ProductDetail> {
  return prisma.product.create({
    data,
    include: detailInclude,
  });
}

export async function updateProduct(
  id: string,
  data: Prisma.ProductUpdateInput,
): Promise<ProductDetail> {
  return prisma.product.update({
    where: { id },
    data,
    include: detailInclude,
  });
}

export async function deleteProductById(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}

export async function findProductImageForDeletion(
  productId: string,
  imageId: string,
): Promise<{ urlThumb: string; urlLarge: string } | null> {
  return prisma.productImage.findFirst({
    where: { id: imageId, productId },
    select: { urlThumb: true, urlLarge: true },
  });
}

export async function createProductImageTx(
  tx: Prisma.TransactionClient,
  input: {
    productId: string;
    urlThumb: string;
    urlLarge: string;
    isMain: boolean;
    sortOrder: number;
  },
): Promise<void> {
  await tx.productImage.create({ data: input });
}

export async function clearMainImageFlagsTx(
  tx: Prisma.TransactionClient,
  productId: string,
): Promise<void> {
  await tx.productImage.updateMany({
    where: { productId },
    data: { isMain: false },
  });
}

export async function nextImageSortOrder(productId: string): Promise<number> {
  const agg = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  return (agg._max.sortOrder ?? -1) + 1;
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
): Promise<number> {
  const r = await prisma.productImage.deleteMany({
    where: { id: imageId, productId },
  });
  return r.count;
}

export async function ensureOneMainImage(productId: string): Promise<void> {
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

export async function listImagesUrlsForProduct(
  productId: string,
): Promise<{ urlThumb: string; urlLarge: string }[]> {
  const rows = await prisma.productImage.findMany({
    where: { productId },
    select: { urlThumb: true, urlLarge: true },
  });
  return rows;
}

export async function replaceFitments(
  productId: string,
  vehicleIds: number[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.fitment.deleteMany({ where: { productId } });
    if (vehicleIds.length > 0) {
      await tx.fitment.createMany({
        data: vehicleIds.map((vehicleId) => ({ productId, vehicleId })),
      });
    }
  });
}

export async function listVehicleIdsByIds(ids: number[]): Promise<Set<number>> {
  if (ids.length === 0) {
    return new Set();
  }
  const rows = await prisma.vehicle.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  return new Set(rows.map((r) => r.id));
}

export async function updateProductStock(
  id: string,
  stockQuantity: number,
): Promise<ProductDetail> {
  return prisma.product.update({
    where: { id },
    data: { stockQuantity },
    include: detailInclude,
  });
}

export async function bulkUpdateProductStock(
  updates: { id: string; stockQuantity: number }[],
): Promise<number> {
  if (updates.length === 0) {
    return 0;
  }
  const results = await prisma.$transaction(
    updates.map((u) =>
      prisma.product.updateMany({
        where: { id: u.id },
        data: { stockQuantity: u.stockQuantity },
      }),
    ),
  );
  return results.reduce((acc, r) => acc + r.count, 0);
}

export function listPublicProducts(
  where: Prisma.ProductWhereInput,
  params: { skip: number; take: number },
): Promise<ProductAdminListRow[]> {
  return prisma.product.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    skip: params.skip,
    take: params.take,
    include: publicListInclude,
  });
}
