import { ZodError } from "zod";
import { HttpError } from "../utils/errors.js";
import * as categoryService from "../services/category.service.js";
import { categoryIdParamsSchema, createCategoryBodySchema, updateCategoryBodySchema, } from "../schemas/category.schemas.js";
export async function listCategoriesAdmin(_req, res, next) {
    try {
        const rows = await categoryService.listCategoriesFlat();
        res.json({ categories: rows });
    }
    catch (err) {
        next(err);
    }
}
export async function createCategory(req, res, next) {
    try {
        const body = createCategoryBodySchema.parse(req.body);
        const parentId = body.parentId === undefined ? null : body.parentId;
        const cat = await categoryService.createCategory({
            nameEn: body.nameEn,
            nameAr: body.nameAr,
            parentId,
            ...(body.slug !== undefined ? { slug: body.slug } : {}),
        });
        res.status(201).json({ category: cat });
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
export async function updateCategory(req, res, next) {
    try {
        const params = categoryIdParamsSchema.parse(req.params);
        const body = updateCategoryBodySchema.parse(req.body);
        const cat = await categoryService.updateCategory(params.id, {
            ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
            ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
            ...(body.parentId !== undefined && { parentId: body.parentId }),
            ...(body.slug !== undefined && { slug: body.slug }),
        });
        res.json({ category: cat });
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
export async function deleteCategory(req, res, next) {
    try {
        const params = categoryIdParamsSchema.parse(req.params);
        await categoryService.deleteCategory(params.id);
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
export async function listCategoriesTreePublic(_req, res, next) {
    try {
        const rows = await categoryService.listCategoriesFlat();
        const tree = categoryService.buildCategoryTree(rows);
        res.json({ categories: tree });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=category.controller.js.map