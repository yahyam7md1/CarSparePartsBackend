import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/errors.js";
import * as productService from "../services/product.service.js";
import {
  adminProductListQuerySchema,
  bulkPatchInventoryBodySchema,
  createProductBodySchema,
  patchInventoryBodySchema,
  productIdParamsSchema,
  productImageIdParamsSchema,
  publicFeaturedQuerySchema,
  publicProductListQuerySchema,
  replaceFitmentsBodySchema,
  updateProductBodySchema,
  uploadProductImageMetaSchema,
} from "../schemas/product.schemas.js";

export async function listProductsAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = adminProductListQuerySchema.parse(req.query);
    const result = await productService.listProductsAdmin({
      ...(q.page !== undefined ? { page: q.page } : {}),
      ...(q.limit !== undefined ? { limit: q.limit } : {}),
      ...(q.categoryId !== undefined ? { categoryId: q.categoryId } : {}),
      ...(q.brandName !== undefined ? { brandName: q.brandName } : {}),
      ...(q.vehicleId !== undefined ? { vehicleId: q.vehicleId } : {}),
      ...(q.chassisCode !== undefined ? { chassisCode: q.chassisCode } : {}),
      ...(q.isActive !== undefined ? { isActive: q.isActive } : {}),
      ...(q.isFeatured !== undefined ? { isFeatured: q.isFeatured } : {}),
      ...(q.q !== undefined ? { q: q.q } : {}),
    });
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    next(err);
  }
}

export async function getProductAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = productIdParamsSchema.parse(req.params);
    const product = await productService.getProductAdmin(params.id);
    res.json({ product });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = createProductBodySchema.parse(req.body);
    const product = await productService.createProduct({
      sku: body.sku,
      ...(body.oemNumbers !== undefined ? { oemNumbers: body.oemNumbers } : {}),
      categoryId: body.categoryId,
      brandName: body.brandName,
      nameEn: body.nameEn,
      nameAr: body.nameAr,
      ...(body.descEn !== undefined ? { descEn: body.descEn } : {}),
      ...(body.descAr !== undefined ? { descAr: body.descAr } : {}),
      price: body.price,
      ...(body.compareAtPrice !== undefined ? { compareAtPrice: body.compareAtPrice } : {}),
      ...(body.stockQuantity !== undefined ? { stockQuantity: body.stockQuantity } : {}),
      ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      ...(body.dimensions !== undefined ? { dimensions: body.dimensions } : {}),
      ...(body.weight !== undefined ? { weight: body.weight } : {}),
      ...(body.manufacturedIn !== undefined ? { manufacturedIn: body.manufacturedIn } : {}),
      ...(body.generation !== undefined ? { generation: body.generation } : {}),
      ...(body.condition !== undefined ? { condition: body.condition } : {}),
      ...(body.stockAlertThresholdFast !== undefined
        ? { stockAlertThresholdFast: body.stockAlertThresholdFast }
        : {}),
      ...(body.stockAlertThresholdMedium !== undefined
        ? { stockAlertThresholdMedium: body.stockAlertThresholdMedium }
        : {}),
      ...(body.stockAlertThresholdSlow !== undefined
        ? { stockAlertThresholdSlow: body.stockAlertThresholdSlow }
        : {}),
    });
    res.status(201).json({ product });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = productIdParamsSchema.parse(req.params);
    const body = updateProductBodySchema.parse(req.body);
    const product = await productService.updateProduct(params.id, {
      ...(body.sku !== undefined ? { sku: body.sku } : {}),
      ...(body.oemNumbers !== undefined ? { oemNumbers: body.oemNumbers } : {}),
      ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
      ...(body.brandName !== undefined ? { brandName: body.brandName } : {}),
      ...(body.nameEn !== undefined ? { nameEn: body.nameEn } : {}),
      ...(body.nameAr !== undefined ? { nameAr: body.nameAr } : {}),
      ...(body.descEn !== undefined ? { descEn: body.descEn } : {}),
      ...(body.descAr !== undefined ? { descAr: body.descAr } : {}),
      ...(body.price !== undefined ? { price: body.price } : {}),
      ...(body.compareAtPrice !== undefined ? { compareAtPrice: body.compareAtPrice } : {}),
      ...(body.stockQuantity !== undefined ? { stockQuantity: body.stockQuantity } : {}),
      ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      ...(body.dimensions !== undefined ? { dimensions: body.dimensions } : {}),
      ...(body.weight !== undefined ? { weight: body.weight } : {}),
      ...(body.manufacturedIn !== undefined ? { manufacturedIn: body.manufacturedIn } : {}),
      ...(body.generation !== undefined ? { generation: body.generation } : {}),
      ...(body.condition !== undefined ? { condition: body.condition } : {}),
      ...(body.stockAlertThresholdFast !== undefined
        ? { stockAlertThresholdFast: body.stockAlertThresholdFast }
        : {}),
      ...(body.stockAlertThresholdMedium !== undefined
        ? { stockAlertThresholdMedium: body.stockAlertThresholdMedium }
        : {}),
      ...(body.stockAlertThresholdSlow !== undefined
        ? { stockAlertThresholdSlow: body.stockAlertThresholdSlow }
        : {}),
    });
    res.json({ product });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = productIdParamsSchema.parse(req.params);
    await productService.deleteProduct(params.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function uploadProductImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = productIdParamsSchema.parse(req.params);
    const meta = uploadProductImageMetaSchema.parse(req.body ?? {});
    const product = await productService.uploadProductImage(params.id, req.file, {
      isMain: meta.isMain,
      ...(meta.sortOrder !== undefined ? { sortOrder: meta.sortOrder } : {}),
    });
    res.status(201).json({ product });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteProductImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = productImageIdParamsSchema.parse(req.params);
    await productService.deleteProductImage(params.productId, params.imageId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function replaceFitments(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = productIdParamsSchema.parse(req.params);
    const body = replaceFitmentsBodySchema.parse(req.body);
    await productService.replaceFitments(params.id, body.vehicleIds);
    res.status(204).send();
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function patchInventory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = productIdParamsSchema.parse(req.params);
    const body = patchInventoryBodySchema.parse(req.body);
    const product = await productService.patchInventory(params.id, body.stockQuantity);
    res.json({ product });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function bulkPatchInventory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = bulkPatchInventoryBodySchema.parse(req.body);
    const result = await productService.bulkPatchInventory(body.updates);
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function listProductsPublic(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = publicProductListQuerySchema.parse(req.query);
    const result = await productService.listProductsPublic({
      ...(q.page !== undefined ? { page: q.page } : {}),
      ...(q.limit !== undefined ? { limit: q.limit } : {}),
      ...(q.categoryId !== undefined ? { categoryId: q.categoryId } : {}),
      ...(q.categorySlug !== undefined ? { categorySlug: q.categorySlug } : {}),
      ...(q.vehicleId !== undefined ? { vehicleId: q.vehicleId } : {}),
      ...(q.oem !== undefined ? { oem: q.oem } : {}),
      ...(q.q !== undefined ? { q: q.q } : {}),
      ...(q.minPrice !== undefined ? { minPrice: q.minPrice } : {}),
      ...(q.maxPrice !== undefined ? { maxPrice: q.maxPrice } : {}),
      ...(q.sort !== undefined ? { sort: q.sort } : {}),
    });
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function listFeaturedProductsPublic(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = publicFeaturedQuerySchema.parse(req.query);
    const result = await productService.listFeaturedProductsPublic({
      ...(q.page !== undefined ? { page: q.page } : {}),
      ...(q.limit !== undefined ? { limit: q.limit } : {}),
    });
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    next(err);
  }
}

export async function getProductFitmentsPublic(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = productIdParamsSchema.parse(req.params);
    const result = await productService.getProductFitmentsPublic(params.id);
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function getProductPublic(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = productIdParamsSchema.parse(req.params);
    const product = await productService.getProductPublic(params.id);
    res.json({ product });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}
