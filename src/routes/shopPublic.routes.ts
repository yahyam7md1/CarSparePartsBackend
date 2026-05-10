import { Router } from "express";
import * as shopPublicController from "../controllers/shopPublic.controller.js";

export function createShopPublicRouter(): Router {
  const router = Router();
  router.get("/shop/support", (req, res, next) => {
    void shopPublicController.getShopSupportPublic(req, res, next).catch(next);
  });
  return router;
}
