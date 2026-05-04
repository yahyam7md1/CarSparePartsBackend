import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { createRequireAuth } from "../middleware/auth.middleware.js";
export function createAdminRouter(authEnv) {
    const router = Router();
    const requireAuth = createRequireAuth(authEnv);
    router.use(requireAuth);
    router.get("/me", (req, res, next) => {
        void adminController.me(req, res, next).catch(next);
    });
    return router;
}
//# sourceMappingURL=admin.routes.js.map