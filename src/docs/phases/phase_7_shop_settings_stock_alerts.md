# Phase 7: Shop settings, stock alerts, OEMs, and low-stock behavior

**Scope:** Central **admin settings** stored in the database (**singleton** `ShopSettings` row): **WhatsApp** business phone and greeting overrides (with **environment fallbacks**), **default per-product stock alert tiers** for new products, and **configurable low-stock dashboard thresholds** driven by **movement class**. Also documents related **product** changes: **multiple OEMs** (`ProductOem`), removal of legacy **`Product.oemNumber`**, optional **per-product stock alert fields**, and how **checkout** merges DB settings with Phase 5 **env** config.

---

## 1. Goals delivered

### 1.1 Shop settings (admin API)

1. **`ShopSettings` model** — Single logical configuration row with primary key **`id = 1`**. Create/seed on first access if missing.
2. **`GET /api/admin/settings`** (JWT) — Returns current values for WhatsApp digits, greeting names (EN/AR), default stock alert tiers (nullable integers), and low-stock cutoffs (`lowStockSlowAtOrBelow`, `lowStockMediumBelow`, `lowStockFastBelow`), plus `updatedAt`.
3. **`PATCH /api/admin/settings`** (JWT) — Partial update; **at least one field** required. Validates:
   - **WhatsApp phone:** normalized to **digits only** (8–15 digits) for storage in `whatsappPhoneDigits`; **`null`** or clearing clears DB override (**env** used again).
   - **Default stock alerts:** when present, must satisfy **fast ≤ medium ≤ slow** (same rule as product create/update Zod).
   - **Low-stock cutoffs:** after merge with existing row, must satisfy **slow < medium < fast** (slow uses “at or below”; medium and fast use “strictly below” in queries—see section 2.3).

### 1.2 WhatsApp checkout integration

4. **`mergeWhatsAppCheckoutEnv()`** (`src/config/whatsapp.ts`) — Merges **stored** greetings/phone with **`getWhatsAppCheckoutEnv()`** (Phase 5 **`.env`**). Stored **non-empty** values override env; invalid stored phone logs a warning and **falls back** to env for the number.
5. **`buildWhatsappCheckoutPayload`** (`src/services/whatsapp-order.service.ts`) — Now **async**: loads `ShopSettings` and uses merged config so **`wa.me`** links and default greeting names reflect admin configuration **without** redeploy.

### 1.3 Product creation and stock alerts

6. **Default tiers on create** — When **`POST /api/admin/products`** omits `stockAlertThresholdFast` / `Medium` / `Slow`, the service fills them from **`ShopSettings.defaultStockAlert*`** (each can be `null`). Explicit **`null`** in the request still means “no threshold” for that tier.
7. **Per-product thresholds** — `Product` exposes optional **`stockAlertThresholdFast`**, **`stockAlertThresholdMedium`**, **`stockAlertThresholdSlow`** (nullable integers). Zod **create/update** enforces **fast ≤ medium ≤ slow** when each tier is set.

### 1.4 Low-stock admin list & stats

8. **Configurable thresholds** — `buildLowStockWhere` in **`product.repository.ts`** accepts optional **`lowStockThresholds`**: defaults remain **slow at or below 0**, **medium strictly below 3**, **fast strictly below 7** if not supplied.
9. **Stats service** — **`stats.service.ts`** loads `ShopSettings` and passes **stored** cutoffs into **`buildLowStockWhere`** for **`GET /api/admin/stats`** (low stock count) and **`GET /api/admin/stats/low-stock`** (paginated rows), and for **ignore** validation.

### 1.5 OEMs and related product API (same delivery window)

10. **`ProductOem`** — Many OEM reference strings per product; **unique** `(productId, value)`; search/filter uses **`oems.some.value`**.
11. **Legacy `oemNumber` removed** from `Product` (migration backfills into `ProductOem` then drops column). API accepts **`oemNumbers: string[]`** on create; **`oemNumbers`** on update **replaces** the full list when provided. Optional legacy **`oemNumber`** in JSON is still accepted in services and **merged** into the OEM list for backward compatibility where implemented.
12. **`MovementClass`** — `slow` | `medium` | `fast` on `Product` (default `medium`) used with low-stock rules above.
13. **`lowStockIgnored`** — Boolean on `Product`; excluded from low-stock queries when **exclude ignored** is enabled (existing admin behavior).

---

## 2. Behavioral reference

### 2.1 Stock alert tiers (per product)

- Meaning: optional **inventory warning levels** when **on-hand quantity is at or below** the configured integer (operational use in admin/UI; not a separate automated notifier in this phase).
- **Order constraint:** **fast ≤ medium ≤ slow** when more than one tier is set (aligned with “faster reaction” at lower stock).

### 2.2 Default stock alerts (`ShopSettings`)

- Applied **only** when the **create product** payload **does not include** that threshold key. Does not retroactively change existing products.

### 2.3 Low-stock dashboard rules (`ShopSettings`)

| Movement class | Included in low-stock set when |
| -------------- | ------------------------------ |
| **slow** | `stockQuantity <= lowStockSlowAtOrBelow` |
| **medium** | `stockQuantity < lowStockMediumBelow` |
| **fast** | `stockQuantity < lowStockFastBelow` |

- Admin PATCH requires **slow < medium < fast** so the three bands stay ordered.
- **`lowStockIgnored: true`** products are omitted from counts/lists when the admin queries use **exclude ignored** (default for dashboard listings).

---

## 3. Database migrations (relevant)

| Folder (examples) | Notes |
| ----------------- | ----- |
| `20260507140000_product_oems_stock_alerts_vehicle_generation` | `ProductOem` table; backfill from `oemNumber`; drop `oemNumber`; add **`stockAlertThreshold*`** on `Product`; **`Vehicle.generation`**. |
| `20260508190000_add_movement_class` | **`MovementClass`** enum + `Product.movementClass`. |
| `20260508205000_add_low_stock_ignored` | **`Product.lowStockIgnored`**. |
| `20260510120000_shop_settings` | **`ShopSettings`** table + seed row `id = 1`. |

Apply with **`npx prisma migrate deploy`** (e.g. Docker Compose `api` command).

---

## 4. API reference (settings)

### Admin (JWT)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/admin/settings` | `{ "settings": { … } }` — shop configuration for admin UI. |
| PATCH | `/api/admin/settings` | JSON body: optional `whatsappBusinessPhone`, `whatsappGreetingNameEn`, `whatsappGreetingNameAr`, `defaultStockAlertFast` \| `Medium` \| `Slow` (number or `null`), `lowStockSlowAtOrBelow`, `lowStockMediumBelow`, `lowStockFastBelow`. |

### Public / checkout (no change to route)

| Method | Path | Notes |
| ------ | ---- | ----- |
| POST | `/api/checkout/whatsapp-intent` | Still returns `message`, `waUrl`, etc.; **`waUrl`** uses **merged** phone from DB + env. |

---

## 5. Source files (summary)

| Area | Files |
| ---- | ----- |
| Schema | `prisma/schema.prisma`, `prisma/migrations/…_shop_settings/`, related product/OEM migrations |
| Settings | `shopSettings.schemas.ts`, `shopSettings.repository.ts`, `shopSettings.service.ts`, `shopSettings.controller.ts` |
| Routes | `admin.routes.ts` — `GET`/`PATCH` `/settings` |
| WhatsApp | `config/whatsapp.ts` (`mergeWhatsAppCheckoutEnv`), `services/whatsapp-order.service.ts`, `controllers/checkout.controller.ts` (awaits async builder) |
| Products / stock | `product.schemas.ts`, `product.repository.ts` (`buildLowStockWhere`, OEMs, alerts), `product.service.ts` (defaults from settings on create), `product.controller.ts` |
| Stats | `stats.service.ts` — loads settings, passes low-stock thresholds |

---

## 6. Environment variables (unchanged from Phase 5)

| Variable | Role when `ShopSettings.whatsappPhoneDigits` is **empty** |
| -------- | -------------------------------------------------------- |
| `WHATSAPP_BUSINESS_PHONE` | Fallback digits for `wa.me` link |
| `WHATSAPP_GREETING_NAME_EN` / `WHATSAPP_GREETING_NAME_AR` | Fallback default greeting names |

---

## 7. Manual testing notes

1. **Migrate** — Run migrations; confirm `ShopSettings` row exists (`id = 1`).
2. **PATCH settings** — Set phone to valid international digits; call **`POST /api/checkout/whatsapp-intent`** and confirm **`waUrl`** uses stored number; **clear** phone in settings and confirm **env** phone is used again.
3. **Defaults** — Set default fast/medium/slow in settings; **create product** without alert fields; verify product row matches defaults.
4. **Low stock** — Change **`lowStock*`** cutoffs; verify **`GET /api/admin/stats`** and **`GET /api/admin/stats/low-stock`** reflect new movement-class logic.
5. **Constraints** — PATCH invalid phone → **400**; PATCH default alerts breaching **fast ≤ medium ≤ slow** → **400**; PATCH low-stock with **slow ≥ medium** (etc.) → **400**.

---

## 8. Out of scope / follow-ups

- Email or push **notifications** when stock crosses tiers.
- Bulk “apply defaults to all products”.
- Storefront admin UI is implemented in the separate **frontend** repo (Settings page calling these endpoints).
