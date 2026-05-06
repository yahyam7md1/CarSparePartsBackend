import type { WhatsappCheckoutBody } from "../schemas/whatsapp.schemas.js";
/**
 * Builds bilingual WhatsApp order text and optional wa.me URL per technical_req.md §4.
 */
export declare function buildWhatsappCheckoutPayload(body: WhatsappCheckoutBody): {
    message: string;
    waUrl: string | null;
    total: string;
    currencySymbol: string;
};
//# sourceMappingURL=whatsapp-order.service.d.ts.map