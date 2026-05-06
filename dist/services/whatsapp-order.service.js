import { getWhatsAppCheckoutEnv } from "../config/whatsapp.js";
function formatMoney(amount) {
    return amount.toFixed(2);
}
function lineTotal(quantity, unitPrice) {
    return Math.round(quantity * unitPrice * 100) / 100;
}
/**
 * Builds bilingual WhatsApp order text and optional wa.me URL per technical_req.md §4.
 */
export function buildWhatsappCheckoutPayload(body) {
    const env = getWhatsAppCheckoutEnv();
    const currencySymbol = body.currencySymbol?.trim() || "$";
    const businessName = body.businessDisplayName?.trim() ??
        (body.locale === "ar"
            ? env.defaultBusinessDisplayNameAr
            : env.defaultBusinessDisplayNameEn);
    let total = 0;
    const lines = [];
    for (const item of body.items) {
        const name = body.locale === "ar" ? item.nameAr : item.nameEn;
        const lt = lineTotal(item.quantity, item.unitPrice);
        total += lt;
        if (body.locale === "en") {
            lines.push(`${item.quantity}x ${name} (SKU: ${item.sku}) - ${currencySymbol}${formatMoney(lt)}`);
        }
        else {
            lines.push(`${item.quantity}x ${name} (SKU: ${item.sku}) - ${formatMoney(lt)}${currencySymbol}`);
        }
    }
    total = Math.round(total * 100) / 100;
    const totalStr = formatMoney(total);
    let message;
    if (body.locale === "en") {
        const head = `Hello ${businessName}, I would like to order:\n`;
        const mid = lines.join("\n");
        const tail = `\nTotal: ${currencySymbol}${totalStr}`;
        const notes = body.notes !== undefined && body.notes.length > 0 ? `\n${body.notes}` : "";
        message = head + mid + tail + notes;
    }
    else {
        const head = `مرحباً ${businessName}، أود طلب المنتجات التالية:\n`;
        const mid = lines.join("\n");
        const tail = `\nالمجموع: ${totalStr}${currencySymbol}`;
        const notes = body.notes !== undefined && body.notes.length > 0 ? `\n${body.notes}` : "";
        message = head + mid + tail + notes;
    }
    const waUrl = env.businessPhoneWa !== null
        ? `https://wa.me/${env.businessPhoneWa}?text=${encodeURIComponent(message)}`
        : null;
    return {
        message,
        waUrl,
        total: totalStr,
        currencySymbol,
    };
}
//# sourceMappingURL=whatsapp-order.service.js.map