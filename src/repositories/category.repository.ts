import type { Category, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const adminCategoryListInclude = {
  _count: { select: { products: true } },
} satisfies Prisma.CategoryInclude;

export type CategoryAdminListRow = Prisma.CategoryGetPayload<{
  include: typeof adminCategoryListInclude;
}>;

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

export async function listAllCategoriesWithProductCount(): Promise<CategoryAdminListRow[]> {
  return prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { id: "asc" }],
    include: adminCategoryListInclude,
  });
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
