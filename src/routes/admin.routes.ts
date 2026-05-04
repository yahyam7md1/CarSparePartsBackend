import { Router } from "express";
import type { AuthEnv } from "../config/env.js";
import * as adminController from "../controllers/admin.controller.js";
import { createRequireAuth } from "../middleware/auth.middleware.js";

export function createAdminRouter(authEnv: AuthEnv): Router {
  const router = Router();
  const requireAuth = createRequireAuth(authEnv);
  router.use(requireAuth);
  router.get("/me", (req, res, next) => {
    void adminController.me(req, res, next).catch(next);
  });
  return router;
}
