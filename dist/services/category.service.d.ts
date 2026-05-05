import type { Category } from "@prisma/client";
export declare function assertValidParent(categoryId: number | undefined, parentId: number | null): Promise<void>;
export declare function createCategory(input: {
    nameEn: string;
    nameAr: string;
    parentId: number | null;
    slug?: string | null;
}): Promise<Category>;
export declare function updateCategory(id: number, input: {
    nameEn?: string;
    nameAr?: string;
    parentId?: number | null;
    slug?: string | null;
}): Promise<Category>;
export declare function deleteCategory(id: number): Promise<void>;
export declare function listCategoriesFlat(): Promise<Category[]>;
export type CategoryTreeNode = {
    id: number;
    parentId: number | null;
    nameEn: string;
    nameAr: string;
    slug: string;
    children: CategoryTreeNode[];
};
export declare function buildCategoryTree(categories: Category[]): CategoryTreeNode[];
//# sourceMappingURL=category.service.d.ts.map