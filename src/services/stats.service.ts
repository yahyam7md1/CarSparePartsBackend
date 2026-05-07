import { prisma } from "../lib/prisma.js";

export async function getAdminStats() {
  const [totalProducts, outOfStockCount, lowStockCount, featuredProductCount] =
    await prisma.$transaction([
      prisma.product.count(),
      prisma.product.count({ where: { stockQuantity: 0 } }),
      prisma.product.count({
        where: { stockQuantity: { gt: 0, lt: 5 } },
      }),
      prisma.product.count({ where: { isFeatured: true } }),
    ]);
  return {
    totalProducts,
    outOfStockCount,
    lowStockCount,
    featuredProductCount,
  };
}
