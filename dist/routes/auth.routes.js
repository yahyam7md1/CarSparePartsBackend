import { Router } from "express";
import { createAuthController } from "../controllers/auth.controller.js";
export function createAuthRouter(authEnv) {
    const router = Router();
    const authController = createAuthController(authEnv);
    router.post("/login", (req, res, next) => {
        void authController.login(req, res, next).catch(next);
    });
    return router;
}
//# sourceMappingURL=auth.routes.js.map