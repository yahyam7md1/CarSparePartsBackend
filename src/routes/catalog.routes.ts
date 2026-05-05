import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";

export function createCatalogRouter(): Router {
  const router = Router();
  router.get("/categories", (req, res, next) => {
    void categoryController.listCategoriesTreePublic(req, res, next).catch(next);
  });
  return router;
}
