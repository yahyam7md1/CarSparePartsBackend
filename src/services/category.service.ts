import type { Category } from "@prisma/client";
import { HttpError } from "../utils/errors.js";
import { slugify } from "../utils/slug.js";
import * as categoryRepository from "../repositories/category.repository.js";

async function assertUniqueSlug(slug: string, excludeId?: number): Promise<string> {
  let candidate = slug;
  let n = 0;
  while (await categoryRepository.slugTaken(candidate, excludeId)) {
    n += 1;
    candidate = `${slug}-${n}`;
  }
  return candidate;
}

/** Walk from `nodeId` up to root; returns true if `ancestorId` appears (node is under ancestor). */
async function categoryIsUnderAncestor(
  nodeId: number,
  ancestorId: number,
): Promise<boolean> {
  let current: Category | null = await categoryRepository.findCategoryById(nodeId);
  while (current) {
    if (current.id === ancestorId) {
      return true;
    }
    if (current.parentId == null) {
      return false;
    }
    current = await categoryRepository.findCategoryById(current.parentId);
  }
  return false;
}

export async function assertValidParent(
  categoryId: number | undefined,
  parentId: number | null,
): Promise<void> {
  if (parentId == null) {
    return;
  }
  const parent = await categoryRepository.findCategoryById(parentId);
  if (!parent) {
    throw new HttpError(400, "Parent category not found");
  }
  if (categoryId !== undefined && parentId === categoryId) {
    throw new HttpError(400, "Category cannot be its own parent");
  }
  if (categoryId !== undefined) {
    const parentUnderSelf = await categoryIsUnderAncestor(parentId, categoryId);
    if (parentUnderSelf) {
      throw new HttpError(400, "Invalid parent: would create a cycle");
    }
  }
}

export async function createCategory(input: {
  nameEn: string;
  nameAr: string;
  parentId: number | null;
  slug?: string | null;
}): Promise<Category> {
  await assertValidParent(undefined, input.parentId);
  const base = input.slug?.trim()
    ? slugify(input.slug.trim())
    : slugify(input.nameEn);
  const slug = await assertUniqueSlug(base);
  return categoryRepository.createCategory({
    nameEn: input.nameEn.trim(),
    nameAr: input.nameAr.trim(),
    slug,
    parentId: input.parentId,
  });
}

export async function updateCategory(
  id: number,
  input: {
    nameEn?: string;
    nameAr?: string;
    parentId?: number | null;
    slug?: string | null;
  },
): Promise<Category> {
  const existing = await categoryRepository.findCategoryById(id);
  if (!existing) {
    throw new HttpError(404, "Category not found");
  }

  if (input.parentId !== undefined) {
    await assertValidParent(id, input.parentId);
  }

  let nextSlug = existing.slug;
  if (input.slug != null && input.slug.trim().length > 0) {
    const base = slugify(input.slug.trim());
    nextSlug = await assertUniqueSlug(base, id);
  }

  return categoryRepository.updateCategory(id, {
    ...(input.nameEn !== undefined && { nameEn: input.nameEn.trim() }),
    ...(input.nameAr !== undefined && { nameAr: input.nameAr.trim() }),
    ...(input.parentId !== undefined && { parentId: input.parentId }),
    slug: nextSlug,
  });
}

export async function deleteCategory(id: number): Promise<void> {
  const existing = await categoryRepository.findCategoryById(id);
  if (!existing) {
    throw new HttpError(404, "Category not found");
  }
  const children = await categoryRepository.countChildCategories(id);
  if (children > 0) {
    throw new HttpError(409, "Cannot delete category with sub-categories");
  }
  const products = await categoryRepository.countProductsInCategory(id);
  if (products > 0) {
    throw new HttpError(409, "Cannot delete category that has products");
  }
  await categoryRepository.deleteCategory(id);
}

export async function listCategoriesFlat(): Promise<Category[]> {
  return categoryRepository.listAllCategories();
}

export type CategoryTreeNode = {
  id: number;
  parentId: number | null;
  nameEn: string;
  nameAr: string;
  slug: string;
  children: CategoryTreeNode[];
};

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const map = new Map<number, CategoryTreeNode>();
  for (const c of categories) {
    map.set(c.id, {
      id: c.id,
      parentId: c.parentId,
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      slug: c.slug,
      children: [],
    });
  }
  const roots: CategoryTreeNode[] = [];
  for (const node of map.values()) {
    if (node.parentId == null) {
      roots.push(node);
    } else {
      const p = map.get(node.parentId);
      if (p) {
        p.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }
  return roots;
}
