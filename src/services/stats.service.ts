import * as productRepository from "../repositories/product.repository.js";
import { HttpError } from "../utils/errors.js";

export async function getAdminStats() {
  const lowStockWhere = productRepository.buildLowStockWhere({ excludeIgnored: true });
  const [totalProducts, outOfStockCount, lowStockCount, featuredProductCount] =
    await Promise.all([
      productRepository.countProductsWhere({}),
      productRepository.countProductsWhere({ stockQuantity: 0 }),
      productRepository.countLowStockProducts(lowStockWhere),
      productRepository.countProductsWhere({ isFeatured: true }),
    ]);
  return {
    totalProducts,
    outOfStockCount,
    lowStockCount,
    featuredProductCount,
  };
}

export async function listAdminLowStockRows(q: { page?: number; limit?: number; q?: string }) {
  const limit = Math.min(Math.max(q.limit ?? 10, 1), 100);
  const page = Math.max(q.page ?? 1, 1);
  const skip = (page - 1) * limit;
  const where = productRepository.buildLowStockWhere({
    excludeIgnored: true,
    ...(q.q !== undefined ? { search: q.q } : {}),
  });
  const [rows, total] = await Promise.all([
    productRepository.listLowStockProducts(where, { skip, take: limit }),
    productRepository.countLowStockProducts(where),
  ]);
  return { rows, total, page, limit };
}

export async function ignoreLowStockProduct(productId: string): Promise<void> {
  const existing = await productRepository.findProductDetailById(productId);
  if (!existing) {
    throw new HttpError(404, "Product not found");
  }
  const where = productRepository.buildLowStockWhere({
    excludeIgnored: false,
  });
  const lowStock = await productRepository.countLowStockProducts({
    AND: [where, { id: productId }],
  });
  if (lowStock < 1) {
    throw new HttpError(400, "Product is not currently low stock");
  }
  await productRepository.setLowStockIgnored(productId, true);
}
