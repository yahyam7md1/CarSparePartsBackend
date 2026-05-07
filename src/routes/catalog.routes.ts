import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import * as productController from "../controllers/product.controller.js";
import * as vehicleFacetsController from "../controllers/vehicle-facets.controller.js";

export function createCatalogRouter(): Router {
  const router = Router();
  router.get("/categories", (req, res, next) => {
    void categoryController.listCategoriesTreePublic(req, res, next).catch(next);
  });
  router.get("/vehicle-facets/brands", (req, res, next) => {
    void vehicleFacetsController.listVehicleFacetBrands(req, res, next).catch(next);
  });
  router.get("/vehicle-facets/series", (req, res, next) => {
    void vehicleFacetsController.listVehicleFacetSeries(req, res, next).catch(next);
  });
  router.get("/vehicle-facets/vehicles", (req, res, next) => {
    void vehicleFacetsController.listVehicleFacetVehicles(req, res, next).catch(next);
  });
  router.get("/products/featured", (req, res, next) => {
    void productController.listFeaturedProductsPublic(req, res, next).catch(next);
  });
  router.get("/products/:id/fitments", (req, res, next) => {
    void productController.getProductFitmentsPublic(req, res, next).catch(next);
  });
  router.get("/products", (req, res, next) => {
    void productController.listProductsPublic(req, res, next).catch(next);
  });
  router.get("/products/:id", (req, res, next) => {
    void productController.getProductPublic(req, res, next).catch(next);
  });
  return router;
}
