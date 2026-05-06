import { Router } from "express";
import * as checkoutController from "../controllers/checkout.controller.js";
export function createCheckoutRouter() {
    const router = Router();
    router.post("/checkout/whatsapp-intent", (req, res, next) => {
        void checkoutController.postWhatsappCheckoutIntent(req, res, next).catch(next);
    });
    return router;
}
//# sourceMappingURL=checkout.routes.js.map