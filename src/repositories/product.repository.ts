import type { MovementClass, Prisma, Vehicle } from "@prisma/client";
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

/** Trim, enforce max length, de-duplicate case-insensitively per product. */
export function normalizeOemValues(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raw) {
    const v = r.trim().slice(0, 200);
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

const oemsListArgs = {
  orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }],
  select: {
    id: true,
    value: true,
    sortOrder: true,
  },
};

export function buildAdminProductWhere(q: {
  categoryId?: number;
  brandName?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  vehicleId?: number;
  chassisCode?: string;
}): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];
  if (q.categoryId !== undefined) {
    and.push({ categoryId: q.categoryId });
  }
  if (q.brandName !== undefined) {
    and.push({ brandName: { equals: q.brandName, mode: "insensitive" } });
  }
  if (q.isActive !== undefined) {
    and.push({ isActive: q.isActive });
  }
  if (q.isFeatured !== undefined) {
    and.push({ isFeatured: q.isFeatured });
  }
  if (q.search !== undefined) {
    const s = q.search.trim();
    and.push({
      OR: [
        { sku: { contains: s, mode: "insensitive" } },
        { nameEn: { contains: s, mode: "insensitive" } },
        { nameAr: { contains: s, mode: "insensitive" } },
        { oems: { some: { value: { contains: s, mode: "insensitive" } } } },
      ],
    });
  }
  if (q.vehicleId !== undefined) {
    and.push({ fitments: { some: { vehicleId: q.vehicleId } } });
  }
  if (q.chassisCode !== undefined) {
    const cc = q.chassisCode.trim();
    and.push({
      fitments: {
        some: {
          vehicle: { chassisCode: { contains: cc, mode: "insensitive" } },
        },
      },
    });
  }
  if (and.length === 0) {
    return {};
  }
  if (and.length === 1) {
    return and[0]!;
  }
  return { AND: and };
}

export function buildPublicProductWhere(q: {
  categoryId?: number;
  vehicleId?: number;
  oemContains?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ isActive: true }];
  if (q.categoryId !== undefined) {
    and.push({ categoryId: q.categoryId });
  }
  if (q.vehicleId !== undefined) {
    and.push({ fitments: { some: { vehicleId: q.vehicleId } } });
  }
  if (q.oemContains !== undefined) {
    const o = q.oemContains.trim();
    and.push({
      oems: { some: { value: { contains: o, mode: "insensitive" } } },
    });
  }
  if (q.search !== undefined) {
    const s = q.search.trim();
    and.push({
      OR: [
        { sku: { contains: s, mode: "insensitive" } },
        { nameEn: { contains: s, mode: "insensitive" } },
        { nameAr: { contains: s, mode: "insensitive" } },
        { oems: { some: { value: { contains: s, mode: "insensitive" } } } },
      ],
    });
  }
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    const priceFilter: Prisma.DecimalFilter = {};
    if (q.minPrice !== undefined) {
      priceFilter.gte = q.minPrice;
    }
    if (q.maxPrice !== undefined) {
      priceFilter.lte = q.maxPrice;
    }
    and.push({ price: priceFilter });
  }
  if (and.length === 1) {
    return and[0]!;
  }
  return { AND: and };
}

export function buildLowStockWhere(params?: {
  excludeIgnored?: boolean;
  search?: string;
  lowStockThresholds?: {
    slowAtOrBelow: number;
    mediumBelow: number;
    fastBelow: number;
  };
}): Prisma.ProductWhereInput {
  const t = params?.lowStockThresholds ?? {
    slowAtOrBelow: 0,
    mediumBelow: 3,
    fastBelow: 7,
  };
  const and: Prisma.ProductWhereInput[] = [
    {
      OR: [
        { movementClass: "slow", stockQuantity: { lte: t.slowAtOrBelow } },
        { movementClass: "medium", stockQuantity: { lt: t.mediumBelow } },
        { movementClass: "fast", stockQuantity: { lt: t.fastBelow } },
      ],
    },
  ];
  if (params?.excludeIgnored !== false) {
    and.push({ lowStockIgnored: false });
  }
  if (params?.search !== undefined) {
    const q = params.search.trim();
    if (q.length > 0) {
      and.push({
        OR: [
          { sku: { contains: q, mode: "insensitive" } },
          { nameEn: { contains: q, mode: "insensitive" } },
          { nameAr: { contains: q, mode: "insensitive" } },
        ],
      });
    }
  }
  if (and.length === 1) return and[0]!;
  return { AND: and };
}

const adminListInclude = {
  category: { select: categorySelect },
  images: listImageArgs,
  oems: oemsListArgs,
  _count: {
    select: { fitments: true },
  },
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
  oems: oemsListArgs,
} satisfies Prisma.ProductInclude;

export type ProductAdminListRow = Prisma.ProductGetPayload<{
  include: typeof adminListInclude;
}>;

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof detailInclude;
}>;

export type LowStockAdminRow = Prisma.ProductGetPayload<{
  select: {
    id: true;
    sku: true;
    nameEn: true;
    nameAr: true;
    stockQuantity: true;
    movementClass: true;
    lowStockIgnored: true;
  };
}>;

const lowStockSelect = {
  id: true,
  sku: true,
  nameEn: true,
  nameAr: true,
  stockQuantity: true,
  movementClass: true,
  lowStockIgnored: true,
} as const;

export async function countProductsWhere(where: Prisma.ProductWhereInput): Promise<number> {
  return prisma.product.count({ where });
}

export async function countLowStockProducts(where: Prisma.ProductWhereInput): Promise<number> {
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

export async function listLowStockProducts(
  where: Prisma.ProductWhereInput,
  params: { skip: number; take: number },
): Promise<LowStockAdminRow[]> {
  return prisma.product.findMany({
    where,
    orderBy: [{ stockQuantity: "asc" }, { updatedAt: "desc" }, { id: "desc" }],
    skip: params.skip,
    take: params.take,
    select: lowStockSelect,
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
  movementClass: MovementClass;
  categoryId: number;
  brandName: string;
  nameEn: string;
  nameAr: string;
  descEn: string | null;
  descAr: string | null;
  price: Prisma.Decimal | number | string;
  compareAtPrice: Prisma.Decimal | number | string | null;
  stockQuantity: number;
  isFeatured: boolean;
  isActive: boolean;
  dimensions: string | null;
  weight: number | null;
  manufacturedIn: string | null;
  generation: string | null;
  condition: string;
  stockAlertThresholdFast?: number | null;
  stockAlertThresholdMedium?: number | null;
  stockAlertThresholdSlow?: number | null;
  oems?: string[];
}): Promise<ProductDetail> {
  const { oems, ...rest } = data;
  const normalized = normalizeOemValues(oems ?? []);
  return prisma.product.create({
    data: {
      ...rest,
      ...(normalized.length > 0
        ? {
            oems: {
              create: normalized.map((value, sortOrder) => ({
                value,
                sortOrder,
              })),
            },
          }
        : {}),
    },
    include: detailInclude,
  });
}

/** Apply scalar patch plus optional full OEM list replacement. */
export async function applyProductUpdate(
  id: string,
  data: Prisma.ProductUpdateInput,
  oemNumbers: string[] | undefined,
): Promise<ProductDetail> {
  return prisma.$transaction(async (tx) => {
    if (Object.keys(data).length > 0) {
      await tx.product.update({ where: { id }, data });
    }
    if (oemNumbers !== undefined) {
      const normalized = normalizeOemValues(oemNumbers);
      await tx.productOem.deleteMany({ where: { productId: id } });
      if (normalized.length > 0) {
        await tx.productOem.createMany({
          data: normalized.map((value, sortOrder) => ({
            productId: id,
            value,
            sortOrder,
          })),
        });
      }
    }
    return tx.product.findUniqueOrThrow({
      where: { id },
      include: detailInclude,
    });
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

export async function mergeFitmentsFromSourceVehicleToTargetVehicle(
  sourceVehicleId: number,
  targetVehicleId: number,
): Promise<{ fitmentsCreated: number }> {
  const sources = await prisma.fitment.findMany({
    where: { vehicleId: sourceVehicleId },
    select: { productId: true },
  });
  const productIds = [...new Set(sources.map((s) => s.productId))];
  if (productIds.length === 0) {
    return { fitmentsCreated: 0 };
  }
  const existing = await prisma.fitment.findMany({
    where: { vehicleId: targetVehicleId, productId: { in: productIds } },
    select: { productId: true },
  });
  const have = new Set(existing.map((e) => e.productId));
  const toAdd = productIds.filter((pid) => !have.has(pid));
  if (toAdd.length === 0) {
    return { fitmentsCreated: 0 };
  }
  await prisma.fitment.createMany({
    data: toAdd.map((productId) => ({ productId, vehicleId: targetVehicleId })),
  });
  return { fitmentsCreated: toAdd.length };
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
    data: { stockQuantity, lowStockIgnored: false },
    include: detailInclude,
  });
}

export async function setLowStockIgnored(
  id: string,
  lowStockIgnored: boolean,
): Promise<LowStockAdminRow> {
  return prisma.product.update({
    where: { id },
    data: { lowStockIgnored },
    select: lowStockSelect,
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
        data: { stockQuantity: u.stockQuantity, lowStockIgnored: false },
      }),
    ),
  );
  return results.reduce((acc, r) => acc + r.count, 0);
}

export type PublicProductSort =
  | "featured"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_en_asc"
  | "name_ar_asc";

export function orderByForPublicProductList(
  sort: PublicProductSort | undefined,
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }, { id: "desc" }];
    case "price_asc":
      return [{ price: "asc" }, { id: "asc" }];
    case "price_desc":
      return [{ price: "desc" }, { id: "desc" }];
    case "name_en_asc":
      return [{ nameEn: "asc" }, { id: "asc" }];
    case "name_ar_asc":
      return [{ nameAr: "asc" }, { id: "asc" }];
    default:
      return [{ isFeatured: "desc" }, { createdAt: "desc" }, { id: "desc" }];
  }
}

export function listPublicProducts(
  where: Prisma.ProductWhereInput,
  params: { skip: number; take: number; sort?: PublicProductSort },
): Promise<ProductAdminListRow[]> {
  return prisma.product.findMany({
    where,
    orderBy: orderByForPublicProductList(params.sort),
    skip: params.skip,
    take: params.take,
    include: publicListInclude,
  });
}

const featuredPublicWhere: Prisma.ProductWhereInput = {
  isActive: true,
  isFeatured: true,
};

export function listFeaturedPublicProducts(params: {
  skip: number;
  take: number;
}): Promise<ProductAdminListRow[]> {
  return prisma.product.findMany({
    where: featuredPublicWhere,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    skip: params.skip,
    take: params.take,
    include: publicListInclude,
  });
}

export async function countFeaturedPublicProducts(): Promise<number> {
  return prisma.product.count({ where: featuredPublicWhere });
}

export async function findActiveProductVehicles(id: string): Promise<Vehicle[] | null> {
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
