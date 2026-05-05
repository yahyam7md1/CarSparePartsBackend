import multer from "multer";
import { Router } from "express";
import type { AuthEnv } from "../config/env.js";
import * as adminController from "../controllers/admin.controller.js";
import * as categoryController from "../controllers/category.controller.js";
import * as productController from "../controllers/product.controller.js";
import * as vehicleController from "../controllers/vehicle.controller.js";
import { createRequireAuth } from "../middleware/auth.middleware.js";
import { uploadProductImageMiddleware } from "../middleware/product-image-upload.middleware.js";

export function createAdminRouter(authEnv: AuthEnv): Router {
  const router = Router();
  const requireAuth = createRequireAuth(authEnv);
  router.use(requireAuth);

  router.get("/me", (req, res, next) => {
    void adminController.me(req, res, next).catch(next);
  });

  router.get("/categories", (req, res, next) => {
    void categoryController.listCategoriesAdmin(req, res, next).catch(next);
  });
  router.post("/categories", (req, res, next) => {
    void categoryController.createCategory(req, res, next).catch(next);
  });
  router.put("/categories/:id", (req, res, next) => {
    void categoryController.updateCategory(req, res, next).catch(next);
  });
  router.delete("/categories/:id", (req, res, next) => {
    void categoryController.deleteCategory(req, res, next).catch(next);
  });

  router.get("/vehicles", (req, res, next) => {
    void vehicleController.listVehicles(req, res, next).catch(next);
  });
  router.get("/vehicles/:id", (req, res, next) => {
    void vehicleController.getVehicle(req, res, next).catch(next);
  });
  router.post("/vehicles", (req, res, next) => {
    void vehicleController.createVehicle(req, res, next).catch(next);
  });
  router.put("/vehicles/:id", (req, res, next) => {
    void vehicleController.updateVehicle(req, res, next).catch(next);
  });
  router.delete("/vehicles/:id", (req, res, next) => {
    void vehicleController.deleteVehicle(req, res, next).catch(next);
  });

  router.get("/products", (req, res, next) => {
    void productController.listProductsAdmin(req, res, next).catch(next);
  });
  router.get("/products/:id", (req, res, next) => {
    void productController.getProductAdmin(req, res, next).catch(next);
  });
  router.post("/products", (req, res, next) => {
    void productController.createProduct(req, res, next).catch(next);
  });
  router.put("/products/:id", (req, res, next) => {
    void productController.updateProduct(req, res, next).catch(next);
  });
  router.delete("/products/:id", (req, res, next) => {
    void productController.deleteProduct(req, res, next).catch(next);
  });
  router.post(
    "/products/:id/images",
    (req, res, next) => {
      uploadProductImageMiddleware(req, res, (err: unknown) => {
        if (err) {
          if (err instanceof Error && err.message === "INVALID_IMAGE_TYPE") {
            res.status(400).json({
              error: "Unsupported file type (use JPEG, PNG, or WebP)",
            });
            return;
          }
          if (err instanceof multer.MulterError) {
            res.status(400).json({ error: err.message });
            return;
          }
          next(err);
          return;
        }
        next();
      });
    },
    (req, res, next) => {
      void productController.uploadProductImage(req, res, next).catch(next);
    },
  );
  router.delete("/products/:productId/images/:imageId", (req, res, next) => {
    void productController.deleteProductImage(req, res, next).catch(next);
  });
  router.put("/products/:id/fitments", (req, res, next) => {
    void productController.replaceFitments(req, res, next).catch(next);
  });
  router.patch("/products/:id/inventory", (req, res, next) => {
    void productController.patchInventory(req, res, next).catch(next);
  });
  router.patch("/products/inventory/bulk", (req, res, next) => {
    void productController.bulkPatchInventory(req, res, next).catch(next);
  });

  return router;
}
