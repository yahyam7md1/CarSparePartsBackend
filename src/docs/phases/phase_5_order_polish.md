# Phase 5: Order orchestration & polish

**Scope:** **WhatsApp checkout intent** API — builds a bilingual order message and optional **`wa.me` deep link** from a cart payload (aligned with `general_documents/technical_req.md` §4). **Centralized error handling** maps `HttpError`, Zod, Prisma, and unknown errors to stable JSON without crashing the process.

---

## 1. Goals delivered

1. **WhatsApp message builder** — `POST /api/checkout/whatsapp-intent` accepts `locale` (`en` | `ar`), line items (SKU, quantities, prices, **both** `nameEn` / `nameAr`), optional notes (VIN / condition / free text), optional `businessDisplayName` and `currencySymbol`. Server computes line totals and grand total, formats text like the English/Arabic examples in the technical spec, returns **`message`**, **`waUrl`** (when phone is configured), **`total`**, **`currencySymbol`**, and **`waUrlConfigured`**.
2. **Language** — The **client sends `locale`** matching the storefront i18n; the service chooses `nameEn` vs `nameAr` per line and picks the correct template strings. Default greeting names come from env when `businessDisplayName` is omitted.
3. **Global error middleware** — `src/middleware/error.middleware.ts` — **`HttpError`** → status + message; **`UnauthorizedError`** → 401; **`ZodError`** → 400 + flatten; **Prisma known request** → mapped 400/404/409 + safe message; **Prisma validation** → 400; others → 500 + generic message. Registered last in `src/index.ts` as Express error handler.
4. **Checkout router** — `createCheckoutRouter()` mounted at `/api` alongside the catalog router (unmatched routes fall through to the next router).

---

## 2. Environment variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| **`WHATSAPP_BUSINESS_PHONE`** | No | Digits with country code, `+` optional (e.g. `962791234567`). If missing or invalid, **`waUrl`** is **`null`** but **`message`** is still returned. Invalid value logs a warning and behaves like unset. |
| **`WHATSAPP_GREETING_NAME_EN`** | No | Default English greeting name when body omits `businessDisplayName` (default fallback: `"there"`). |
| **`WHATSAPP_GREETING_NAME_AR`** | No | Default Arabic greeting name (default fallback: `"فريق خدمة العملاء"`). |

---

## 3. API reference

### `POST /api/checkout/whatsapp-intent`

- **Auth:** none (public; cart is client-supplied snapshot).
- **Body (JSON):**

```json
{
  "locale": "en",
  "businessDisplayName": "Car Parts Co",
  "currencySymbol": "$",
  "items": [
    {
      "sku": "MB-102",
      "quantity": 1,
      "unitPrice": 50,
      "nameEn": "Brake Pad",
      "nameAr": "فحمات فرامل"
    }
  ],
  "notes": "VIN: WBA..."
}
```

- **Success `200`:**  
  `{ "message": "...", "waUrl": "https://wa.me/...?text=...", "total": "50.00", "currencySymbol": "$", "waUrlConfigured": true }`  
  If phone env is not set: `"waUrl": null`, `"waUrlConfigured": false`.

- **Validation `400`:** Zod `{ error, details }`.

---

## 4. Source files

| Path | Role |
| ---- | ---- |
| `src/config/whatsapp.ts` | Normalize phone; `getWhatsAppCheckoutEnv()` |
| `src/schemas/whatsapp.schemas.ts` | Zod cart / locale |
| `src/services/whatsapp-order.service.ts` | Message + URL building |
| `src/controllers/checkout.controller.ts` | HTTP handler |
| `src/routes/checkout.routes.ts` | `POST /checkout/whatsapp-intent` |
| `src/middleware/error.middleware.ts` | Global `errorHandler` |
| `src/index.ts` | Mount checkout router; `app.use(errorHandler)` |

---

## 5. Production notes

- **Trust boundaries:** The endpoint does not verify stock or prices against the DB; the storefront should send accurate data. Optional future: log snapshot (`POST /api/orders/log` from `api_endpoints.md`).
- **PII in logs:** Error middleware logs unknown errors with `console.error`; avoid logging full request bodies in production if you add custom logging.
- **Rate limiting:** Consider rate limits on this public POST in production.

---

## 6. Manual test (Postman)

`POST {{baseUrl}}/api/checkout/whatsapp-intent` with body above; switch `locale` to `"ar"` and confirm Arabic template. Set `WHATSAPP_BUSINESS_PHONE` in `.env`, restart, confirm `waUrl` opens with prefilled text.
