# Phase 4: Public catalog, fitment-facing APIs, and schema extensions

**Scope:** Extend the **public** product API with **search filters** (category slug, OEM, vehicle fitment), add **featured** listing and a **slim fitments** endpoint for storefront use, and evolve the **data model**: bilingual **vehicle display names** (`nameEn`, `nameAr`) and optional **product `generation`**. Responses continue to expose **English and Arabic** fields side by side for the customer site to choose by locale.

---

## 1. Goals delivered

1. **Public search** — `GET /api/products` gains optional `categorySlug`, `vehicleId`, `oem` (dedicated substring filter on `oemNumber`), alongside existing `categoryId` and `q`. Unknown category slug → **400** `"Category not found"`. If both `categoryId` and `categorySlug` are sent and they disagree → **400**.
2. **Featured homepage feed** — `GET /api/products/featured` — active + `isFeatured`; pagination `page`, `limit` (default limit **12**, max **50**); ordered by `updatedAt` desc.
3. **Fitment list** — `GET /api/products/:id/fitments` — `{ vehicles: Vehicle[] }` for **active** products only; **404** if missing or inactive (same rule as public detail).
4. **Route ordering** — In `catalog.routes.ts`, **`/products/featured`** and **`/products/:id/fitments`** are registered **before** **`/products/:id`** so paths are not swallowed by the generic id route.
5. **Vehicle names** — `Vehicle` model: **`nameEn`**, **`nameAr`** (defaults `""`; backfilled for existing rows). Admin create/update accepts optional `nameEn` / `nameAr` (trimmed); omitted on create stores empty strings.
6. **Product generation** — Optional nullable **`generation`** string on `Product`; included in admin create/update Zod schemas and in all product JSON payloads.

---

## 2. Dependencies

No new npm packages.

---

## 3. Database migration

Folder: `prisma/migrations/20260506120000_vehicle_names_product_generation/`

- `Vehicle`: `nameEn`, `nameAr` `TEXT NOT NULL DEFAULT ''`
- `Product`: `generation` `TEXT` nullable

Apply: `npx prisma migrate deploy` (or dev equivalent).

---

## 4. API changes (public)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/products` | Query: `page`, `limit`, `categoryId?`, `categorySlug?`, `vehicleId?`, `oem?`, `q?` |
| GET | `/api/products/featured` | Query: `page?`, `limit?` |
| GET | `/api/products/:id/fitments` | `{ vehicles }` only |
| GET | `/api/products/:id` | Unchanged (full product + images + fitments) |

**Multilingual contract:** Product and category payloads still include `nameEn` / `nameAr` (and descriptions `descEn` / `descAr` where applicable). Vehicles include `nameEn` / `nameAr` plus structural fields (`brand`, `series`, etc.). The client selects language.

---

## 5. Admin API changes

- **Products:** create/update body may include **`generation`** (optional string, nullable).
- **Vehicles:** create/update body may include **`nameEn`**, **`nameAr`** (optional strings).

---

## 6. Source files touched (summary)

| Area | Files |
| ---- | ----- |
| Schema | `prisma/schema.prisma`, new migration SQL |
| Products | `product.schemas.ts`, `product.repository.ts`, `product.service.ts`, `product.controller.ts` |
| Vehicles | `vehicle.schemas.ts`, `vehicle.repository.ts`, `vehicle.service.ts`, `vehicle.controller.ts` |
| Routes | `catalog.routes.ts` |

---

## 7. Manual testing notes

- Featured: flag products with `isFeatured: true` via admin, then `GET /api/products/featured` without auth.
- Vehicle filter: `GET /api/products?vehicleId=2` returns only SKUs with a fitment row for vehicle `2`.
- OEM: `GET /api/products?oem=ABC` filters `oemNumber` contains (case-insensitive); `q` still searches across sku / names / OEM together when combined, as AND clauses.

---

## 8. Relation to future work

- **Accept-Language** or `?lang=` to return a single localized string set — optional; current design keeps dual fields for flexibility.
- **Category slug** on admin product filters — can mirror public if the admin UI uses slugs.
- **Search tuning** (prefix OEM, normalized part numbers) — extend `buildPublicProductWhere` without breaking query params.
