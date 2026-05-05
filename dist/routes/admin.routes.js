import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import * as categoryController from "../controllers/category.controller.js";
import * as vehicleController from "../controllers/vehicle.controller.js";
import { createRequireAuth } from "../middleware/auth.middleware.js";
export function createAdminRouter(authEnv) {
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
    return router;
}
//# sourceMappingURL=admin.routes.js.map