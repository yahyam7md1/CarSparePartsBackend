import { ZodError } from "zod";
import { HttpError } from "../utils/errors.js";
import * as productService from "../services/product.service.js";
import { adminProductListQuerySchema, bulkPatchInventoryBodySchema, createProductBodySchema, patchInventoryBodySchema, productIdParamsSchema, productImageIdParamsSchema, publicProductListQuerySchema, replaceFitmentsBodySchema, updateProductBodySchema, uploadProductImageMetaSchema, } from "../schemas/product.schemas.js";
export async function listProductsAdmin(req, res, next) {
    try {
        const q = adminProductListQuerySchema.parse(req.query);
        const result = await productService.listProductsAdmin({
            ...(q.page !== undefined ? { page: q.page } : {}),
            ...(q.limit !== undefined ? { limit: q.limit } : {}),
            ...(q.categoryId !== undefined ? { categoryId: q.categoryId } : {}),
            ...(q.brandName !== undefined ? { brandName: q.brandName } : {}),
            ...(q.isActive !== undefined ? { isActive: q.isActive } : {}),
            ...(q.isFeatured !== undefined ? { isFeatured: q.isFeatured } : {}),
            ...(q.q !== undefined ? { q: q.q } : {}),
        });
        res.json(result);
    }
    catch (err) {
        if (err instanceof ZodError) {
            res.status(400).json({ error: "Invalid request", details: err.flatten() });
            return;
        }
        next(err);
    }
}
export async function getProductAdmin(req, res, next) {
    try {
        const params = productIdParamsSchema.parse(req.params);
        const product = await productService.getProductAdmin(params.id);
        res.json({ product });
    }
    catch (err) {
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
export async function createProduct(req, res, next) {
    try {
        const body = createProductBodySchema.parse(req.body);
        const product = await productService.createProduct({
            sku: body.sku,
            ...(body.oemNumber !== undefined ? { oemNumber: body.oemNumber } : {}),
            categoryId: body.categoryId,
            brandName: body.brandName,
            nameEn: body.nameEn,
            nameAr: body.nameAr,
            ...(body.descEn !== undefined ? { descEn: body.descEn } : {}),
            ...(body.descAr !== undefined ? { descAr: body.descAr } : {}),
            price: body.price,
            ...(body.stockQuantity !== undefined ? { stockQuantity: body.stockQuantity } : {}),
            ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
            ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
            ...(body.dimensions !== undefined ? { dimensions: body.dimensions } : {}),
            ...(body.weight !== undefined ? { weight: body.weight } : {}),
            ...(body.manufacturedIn !== undefined ? { manufacturedIn: body.manufacturedIn } : {}),
            ...(body.condition !== undefined ? { condition: body.condition } : {}),
        });
        res.status(201).json({ product });
    }
    catch (err) {
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
export async function updateProduct(req, res, next) {
    try {
        const params = productIdParamsSchema.parse(req.params);
        const body = updateProductBodySchema.parse(req.body);
        const product = await productService.updateProduct(params.id, {
            ...(body.sku !== undefined ? { sku: body.sku } : {}),
            ...(body.oemNumber !== undefined ? { oemNumber: body.oemNumber } : {}),
            ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
            ...(body.brandName !== undefined ? { brandName: body.brandName } : {}),
            ...(body.nameEn !== undefined ? { nameEn: body.nameEn } : {}),
            ...(body.nameAr !== undefined ? { nameAr: body.nameAr } : {}),
            ...(body.descEn !== undefined ? { descEn: body.descEn } : {}),
            ...(body.descAr !== undefined ? { descAr: body.descAr } : {}),
            ...(body.price !== undefined ? { price: body.price } : {}),
            ...(body.stockQuantity !== undefined ? { stockQuantity: body.stockQuantity } : {}),
            ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
            ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
            ...(body.dimensions !== undefined ? { dimensions: body.dimensions } : {}),
            ...(body.weight !== undefined ? { weight: body.weight } : {}),
            ...(body.manufacturedIn !== undefined ? { manufacturedIn: body.manufacturedIn } : {}),
            ...(body.condition !== undefined ? { condition: body.condition } : {}),
        });
        res.json({ product });
    }
    catch (err) {
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
export async function deleteProduct(req, res, next) {
    try {
        const params = productIdParamsSchema.parse(req.params);
        await productService.deleteProduct(params.id);
        res.status(204).send();
    }
    catch (err) {
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
export async function uploadProductImage(req, res, next) {
    try {
        const params = productIdParamsSchema.parse(req.params);
        const meta = uploadProductImageMetaSchema.parse(req.body ?? {});
        const product = await productService.uploadProductImage(params.id, req.file, {
            isMain: meta.isMain,
            ...(meta.sortOrder !== undefined ? { sortOrder: meta.sortOrder } : {}),
        });
        res.status(201).json({ product });
    }
    catch (err) {
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
export async function deleteProductImage(req, res, next) {
    try {
        const params = productImageIdParamsSchema.parse(req.params);
        await productService.deleteProductImage(params.productId, params.imageId);
        res.status(204).send();
    }
    catch (err) {
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
export async function replaceFitments(req, res, next) {
    try {
        const params = productIdParamsSchema.parse(req.params);
        const body = replaceFitmentsBodySchema.parse(req.body);
        await productService.replaceFitments(params.id, body.vehicleIds);
        res.status(204).send();
    }
    catch (err) {
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
export async function patchInventory(req, res, next) {
    try {
        const params = productIdParamsSchema.parse(req.params);
        const body = patchInventoryBodySchema.parse(req.body);
        const product = await productService.patchInventory(params.id, body.stockQuantity);
        res.json({ product });
    }
    catch (err) {
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
export async function bulkPatchInventory(req, res, next) {
    try {
        const body = bulkPatchInventoryBodySchema.parse(req.body);
        const result = await productService.bulkPatchInventory(body.updates);
        res.json(result);
    }
    catch (err) {
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
export async function listProductsPublic(req, res, next) {
    try {
        const q = publicProductListQuerySchema.parse(req.query);
        const result = await productService.listProductsPublic({
            ...(q.page !== undefined ? { page: q.page } : {}),
            ...(q.limit !== undefined ? { limit: q.limit } : {}),
            ...(q.categoryId !== undefined ? { categoryId: q.categoryId } : {}),
            ...(q.q !== undefined ? { q: q.q } : {}),
        });
        res.json(result);
    }
    catch (err) {
        if (err instanceof ZodError) {
            res.status(400).json({ error: "Invalid request", details: err.flatten() });
            return;
        }
        next(err);
    }
}
export async function getProductPublic(req, res, next) {
    try {
        const params = productIdParamsSchema.parse(req.params);
        const product = await productService.getProductPublic(params.id);
        res.json({ product });
    }
    catch (err) {
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
//# sourceMappingURL=product.controller.js.map