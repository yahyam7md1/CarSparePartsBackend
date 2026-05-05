import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import * as productController from "../controllers/product.controller.js";
export function createCatalogRouter() {
    const router = Router();
    router.get("/categories", (req, res, next) => {
        void categoryController.listCategoriesTreePublic(req, res, next).catch(next);
    });
    router.get("/products", (req, res, next) => {
        void productController.listProductsPublic(req, res, next).catch(next);
    });
    router.get("/products/:id", (req, res, next) => {
        void productController.getProductPublic(req, res, next).catch(next);
    });
    return router;
}
//# sourceMappingURL=catalog.routes.js.map