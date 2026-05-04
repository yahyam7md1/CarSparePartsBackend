import { Router } from "express";
import type { AuthEnv } from "../config/env.js";
import { createAuthController } from "../controllers/auth.controller.js";

export function createAuthRouter(authEnv: AuthEnv): Router {
  const router = Router();
  const authController = createAuthController(authEnv);
  router.post("/login", (req, res, next) => {
    void authController.login(req, res, next).catch(next);
  });
  return router;
}
