import { prisma } from "../lib/prisma.js";
export async function findCategoryById(id) {
    return prisma.category.findUnique({ where: { id } });
}
export async function findCategoryBySlug(slug) {
    return prisma.category.findUnique({ where: { slug } });
}
export async function slugTaken(slug, excludeId) {
    const row = await prisma.category.findFirst({
        where: {
            slug,
            ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
        },
    });
    return row !== null;
}
export async function listAllCategories() {
    return prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { id: "asc" }] });
}
export async function countChildCategories(parentId) {
    return prisma.category.count({ where: { parentId } });
}
export async function countProductsInCategory(categoryId) {
    return prisma.product.count({ where: { categoryId } });
}
export async function createCategory(data) {
    return prisma.category.create({ data });
}
export async function updateCategory(id, data) {
    return prisma.category.update({ where: { id }, data });
}
export async function deleteCategory(id) {
    await prisma.category.delete({ where: { id } });
}
//# sourceMappingURL=category.repository.js.map