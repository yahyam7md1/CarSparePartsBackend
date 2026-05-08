import * as productRepository from "../repositories/product.repository.js";
import * as shopSettingsRepository from "../repositories/shopSettings.repository.js";
import { HttpError } from "../utils/errors.js";

async function lowStockWhereWithSettings(
  extra?: Parameters<typeof productRepository.buildLowStockWhere>[0],
) {
  const row = await shopSettingsRepository.getShopSettings();
  const lowStockThresholds = shopSettingsRepository.lowStockThresholdsFromRow(row);
  return productRepository.buildLowStockWhere({
    ...extra,
    lowStockThresholds,
  });
}

export async function getAdminStats() {
  const lowStockWhere = await lowStockWhereWithSettings({ excludeIgnored: true });
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
  const where = await lowStockWhereWithSettings({
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
  const where = await lowStockWhereWithSettings({
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
