import type { Category } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function findCategoryById(id: number): Promise<Category | null> {
  return prisma.category.findUnique({ where: { id } });
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  return prisma.category.findUnique({ where: { slug } });
}

export async function slugTaken(slug: string, excludeId?: number): Promise<boolean> {
  const row = await prisma.category.findFirst({
    where: {
      slug,
      ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
    },
  });
  return row !== null;
}

export async function listAllCategories(): Promise<Category[]> {
  return prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { id: "asc" }] });
}

/** Product counts per category (direct assignment only). */
export async function getProductCountByCategoryMap(): Promise<Map<number, number>> {
  const rows = await prisma.product.groupBy({
    by: ["categoryId"],
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.categoryId, r._count._all]));
}

export async function countChildCategories(parentId: number): Promise<number> {
  return prisma.category.count({ where: { parentId } });
}

export async function countProductsInCategory(categoryId: number): Promise<number> {
  return prisma.product.count({ where: { categoryId } });
}

export async function createCategory(data: {
  nameEn: string;
  nameAr: string;
  slug: string;
  parentId: number | null;
}): Promise<Category> {
  return prisma.category.create({ data });
}

export async function updateCategory(
  id: number,
  data: {
    nameEn?: string;
    nameAr?: string;
    slug?: string;
    parentId?: number | null;
  },
): Promise<Category> {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: number): Promise<void> {
  await prisma.category.delete({ where: { id } });
}
