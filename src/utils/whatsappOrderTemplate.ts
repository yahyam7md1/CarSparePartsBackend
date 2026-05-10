/** Placeholders: {{lines}}, {{total}}, {{currencySymbol}}, {{notes}} */

export const DEFAULT_WHATSAPP_ORDER_TEMPLATE_EN =
  "Hello, I would like to order:\n\n{{lines}}\n\nTotal: {{currencySymbol}}{{total}}{{notes}}";

export const DEFAULT_WHATSAPP_ORDER_TEMPLATE_AR =
  "مرحباً ، أود طلب المنتجات التالية:\n\n{{lines}}\n\nالمجموع: {{total}}{{currencySymbol}}{{notes}}";

export type WhatsappOrderTemplateVars = Readonly<{
  lines: string;
  total: string;
  currencySymbol: string;
  /** Preformatted notes suffix (e.g. leading newline + text) or empty. */
  notes: string;
}>;

const PLACEHOLDER_KEYS = [
  "{{lines}}",
  "{{total}}",
  "{{currencySymbol}}",
  "{{notes}}",
] as const;

export function whatsappOrderTemplateHasRequiredPlaceholders(template: string): boolean {
  return template.includes("{{lines}}") && template.includes("{{total}}");
}

export function applyWhatsappOrderTemplate(
  template: string,
  vars: WhatsappOrderTemplateVars,
): string {
  const map: Record<(typeof PLACEHOLDER_KEYS)[number], string> = {
    "{{lines}}": vars.lines,
    "{{total}}": vars.total,
    "{{currencySymbol}}": vars.currencySymbol,
    "{{notes}}": vars.notes,
  };
  let out = template;
  for (const key of PLACEHOLDER_KEYS) {
    out = out.split(key).join(map[key]);
  }
  return out;
}

export function resolveWhatsappOrderTemplate(
  locale: "en" | "ar",
  storedEn: string | null | undefined,
  storedAr: string | null | undefined,
): string {
  const stored = (locale === "ar" ? storedAr : storedEn)?.trim() ?? "";
  if (stored.length > 0 && whatsappOrderTemplateHasRequiredPlaceholders(stored)) {
    return stored;
  }
  return locale === "ar"
    ? DEFAULT_WHATSAPP_ORDER_TEMPLATE_AR
    : DEFAULT_WHATSAPP_ORDER_TEMPLATE_EN;
}
