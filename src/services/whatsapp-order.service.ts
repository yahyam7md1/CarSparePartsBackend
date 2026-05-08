import { mergeWhatsAppCheckoutEnv } from "../config/whatsapp.js";
import type { WhatsappCheckoutBody } from "../schemas/whatsapp.schemas.js";
import * as shopSettingsRepository from "../repositories/shopSettings.repository.js";

function formatMoney(amount: number): string {
  return amount.toFixed(2);
}

function lineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Builds bilingual WhatsApp order text and optional wa.me URL per technical_req.md §4.
 * Merges configured shop phone/greetings with environment fallbacks.
 */
export async function buildWhatsappCheckoutPayload(
  body: WhatsappCheckoutBody,
): Promise<{
  message: string;
  waUrl: string | null;
  total: string;
  currencySymbol: string;
}> {
  const stored = await shopSettingsRepository.getShopSettings();
  const env = mergeWhatsAppCheckoutEnv(stored);
  const currencySymbol = body.currencySymbol?.trim() || "$";

  const businessName =
    body.businessDisplayName?.trim() ??
    (body.locale === "ar"
      ? env.defaultBusinessDisplayNameAr
      : env.defaultBusinessDisplayNameEn);

  let total = 0;
  const lines: string[] = [];

  for (const item of body.items) {
    const name = body.locale === "ar" ? item.nameAr : item.nameEn;
    const lt = lineTotal(item.quantity, item.unitPrice);
    total += lt;
    if (body.locale === "en") {
      lines.push(
        `${item.quantity}x ${name} (SKU: ${item.sku}) - ${currencySymbol}${formatMoney(lt)}`,
      );
    } else {
      lines.push(
        `${item.quantity}x ${name} (SKU: ${item.sku}) - ${formatMoney(lt)}${currencySymbol}`,
      );
    }
  }

  total = Math.round(total * 100) / 100;
  const totalStr = formatMoney(total);

  let message: string;
  if (body.locale === "en") {
    const head = `Hello ${businessName}, I would like to order:\n`;
    const mid = lines.join("\n");
    const tail = `\nTotal: ${currencySymbol}${totalStr}`;
    const notes =
      body.notes !== undefined && body.notes.length > 0 ? `\n${body.notes}` : "";
    message = head + mid + tail + notes;
  } else {
    const head = `مرحباً ${businessName}، أود طلب المنتجات التالية:\n`;
    const mid = lines.join("\n");
    const tail = `\nالمجموع: ${totalStr}${currencySymbol}`;
    const notes =
      body.notes !== undefined && body.notes.length > 0 ? `\n${body.notes}` : "";
    message = head + mid + tail + notes;
  }

  const waUrl =
    env.businessPhoneWa !== null
      ? `https://wa.me/${env.businessPhoneWa}?text=${encodeURIComponent(message)}`
      : null;

  return {
    message,
    waUrl,
    total: totalStr,
    currencySymbol,
  };
}
