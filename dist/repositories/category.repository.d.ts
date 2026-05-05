import type { Category } from "@prisma/client";
export declare function findCategoryById(id: number): Promise<Category | null>;
export declare function findCategoryBySlug(slug: string): Promise<Category | null>;
export declare function slugTaken(slug: string, excludeId?: number): Promise<boolean>;
export declare function listAllCategories(): Promise<Category[]>;
export declare function countChildCategories(parentId: number): Promise<number>;
export declare function countProductsInCategory(categoryId: number): Promise<number>;
export declare function createCategory(data: {
    nameEn: string;
    nameAr: string;
    slug: string;
    parentId: number | null;
}): Promise<Category>;
export declare function updateCategory(id: number, data: {
    nameEn?: string;
    nameAr?: string;
    slug?: string;
    parentId?: number | null;
}): Promise<Category>;
export declare function deleteCategory(id: number): Promise<void>;
//# sourceMappingURL=category.repository.d.ts.map