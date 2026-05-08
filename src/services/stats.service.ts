import { prisma } from "../lib/prisma.js";

export async function getAdminStats() {
  const [totalProducts, outOfStockCount, lowStockCount, featuredProductCount] =
    await prisma.$transaction([
      prisma.product.count(),
      prisma.product.count({ where: { stockQuantity: 0 } }),
      prisma.product.count({
        where: {
          OR: [
            { movementClass: "slow", stockQuantity: { lte: 0 } },
            { movementClass: "medium", stockQuantity: { lt: 3 } },
            { movementClass: "fast", stockQuantity: { lt: 7 } },
          ],
        },
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
