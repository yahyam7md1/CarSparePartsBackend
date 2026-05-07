# Phase 6: Admin stats, sale price, inventory filters, PLP facets & vehicle merge

**Scope:** Close gaps between storefront/admin mockups and the API: **dashboard KPIs**, optional **compare-at (strike-through) price**, **admin product filters** by vehicle/chassis, **public catalog** price range + sort, **admin vehicle** full-text search + **fitment counts**, **merge fitments** between two vehicles, and **public vehicle facet** endpoints for hero cascading (Make → Series → chassis row) limited to vehicles that already have **active** product fitments. **Activity / audit log** is explicitly **out of scope** for this phase.

---

## 1. Goals delivered

1. **Admin stats** — `GET /api/admin/stats` (JWT) returns aggregate counts in one round trip: `totalProducts`, `outOfStockCount` (`stockQuantity === 0`), `lowStockCount` (`1 <= stockQuantity < 5`), `featuredProductCount`.
2. **Sale / list price** — `Product.compareAtPrice` optional `Decimal(10,2)` nullable. Included in Zod create/update, persisted, and serialized like `price` (string in JSON) or `null` when unset.
3. **Admin product list filters** — `GET /api/admin/products` accepts optional **`vehicleId`** (exact fitment) and **`chassisCode`** (case-insensitive substring on related `Vehicle.chassisCode`). Composable with existing `categoryId`, `brandName`, `isActive`, `isFeatured`, `q`.
4. **Public PLP** — `GET /api/products` accepts **`minPrice`**, **`maxPrice`** (non-negative; `minPrice > maxPrice` → **400**), and **`sort`**: `featured` | `newest` | `price_asc` | `price_desc` | `name_en_asc` | `name_ar_asc` (default behavior matches former `featured` ordering when omitted).
5. **Admin vehicles** — List query gains **`q`**: OR search across `brand`, `series`, `specifics`, `chassisCode`, `yearRange`, `nameEn`, `nameAr` (contains, case-insensitive). Each row includes **`fitmentCount`** (`_count.fitments`).
6. **Merge fitments** — `POST /api/admin/vehicles/merge-fitments` body `{ "sourceVehicleId", "targetVehicleId" }`; for every product fitted to **source**, creates a fitment for **target** if missing. Same IDs → **400**. Returns `{ "fitmentsCreated": number }`.
7. **Public vehicle facets** — Read-only routes (no auth) for cascading UI; only vehicles with at least one fitment to an **active** product:
   - `GET /api/vehicle-facets/brands` → `{ "brands": string[] }`
   - `GET /api/vehicle-facets/series?brand=...` → `{ "series": string[] }`
   - `GET /api/vehicle-facets/vehicles?brand=...&series=...` → `{ "vehicles": [{ id, brand, series, specifics, chassisCode, yearRange, nameEn, nameAr }] }`

---

## 2. Dependencies

No new npm packages.

---

## 3. Database migration

Folder: `prisma/migrations/20260506180000_add_compare_at_price/`

- `Product`: `compareAtPrice` `DECIMAL(10,2)` **nullable**

Apply: `npx prisma migrate deploy` (or dev equivalent).

---

## 4. API reference (new or changed)

### Admin (JWT)

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/api/admin/stats` | Response: `{ totalProducts, outOfStockCount, lowStockCount, featuredProductCount }` |
| GET | `/api/admin/products` | New query: `vehicleId?`, `chassisCode?` |
| POST | `/api/admin/vehicles/merge-fitments` | JSON body: `sourceVehicleId`, `targetVehicleId`. Register **before** `GET /api/admin/vehicles/:id` so `merge-fitments` is not parsed as an id. |
| GET | `/api/admin/vehicles` | New query: `q?`. Response vehicles: each item includes **`fitmentCount`**. |

### Admin product body (create/update)

- Optional **`compareAtPrice`**: number or `null` (Zod); omitted leaves unchanged on PATCH-style update; create defaults to `null` when omitted.

### Public catalog

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/api/products` | New query: `minPrice?`, `maxPrice?`, `sort?` |
| GET | `/api/vehicle-facets/brands` | No auth |
| GET | `/api/vehicle-facets/series?brand=` | No auth |
| GET | `/api/vehicle-facets/vehicles?brand=&series=` | No auth |

**Route ordering:** In `catalog.routes.ts`, `/vehicle-facets/*` is registered with other static paths so it is not shadowed by `/products/:id`.

---

## 5. Source files (summary)

| Area | Files |
| ---- | ----- |
| Schema | `prisma/schema.prisma`, migration SQL |
| Products | `product.schemas.ts`, `product.repository.ts`, `product.service.ts`, `product.controller.ts` |
| Vehicles | `vehicle.schemas.ts`, `vehicle.repository.ts`, `vehicle.service.ts`, `vehicle.controller.ts` |
| Stats | `stats.service.ts`, `stats.controller.ts` |
| Facets | `vehicle-facets.controller.ts` |
| Routes | `admin.routes.ts`, `catalog.routes.ts` |

---

## 6. Manual testing notes

- **Stats** — `GET /api/admin/stats` with `Authorization: Bearer <token>`; adjust product `stockQuantity` / `isFeatured` and recheck counts.
- **compareAtPrice** — Create/update product with `"compareAtPrice": 99.99` and `"price": 79.99`; confirm JSON strings on GET.
- **Admin chassis filter** — `GET /api/admin/products?chassisCode=E60` returns products with any fitment whose vehicle chassis contains `E60`.
- **PLP** — `GET /api/products?minPrice=10&maxPrice=100&sort=price_asc`.
- **Vehicles** — `GET /api/admin/vehicles?q=530` and confirm `fitmentCount` matches DB.
- **Merge** — Two vehicles A/B; fit products to A only; `POST .../merge-fitments` with source A target B; confirm B gains rows without duplicates.
- **Facets** — Only brands/series/vehicles with an active product fitment appear; inactive-only products excluded.

---

## 7. Out of scope (this phase)

- **Activity / audit log** API and persistence — deferred.
- **Accept-Language** or single-field localization — unchanged; dual `nameEn`/`nameAr` remain.

---

## 8. Frontend integration pointers

- Dashboard: bind **StatCard** row to `GET /api/admin/stats`.
- PLP: wire sliders and sort to `minPrice` / `maxPrice` / `sort`; show strike-through when `compareAtPrice` is present and greater than `price`.
- Hero “by vehicle”: load `/api/vehicle-facets/brands` → series → vehicles; **Find parts** navigates to `/products?vehicleId=<id>`.
- Admin inventory: chassis field → `chassisCode` query param; vehicle filter dropdown → `vehicleId`.
- Vehicle library: combobox → `q`; show **Parts** column from `fitmentCount`; merge action → `POST .../merge-fitments`.

---

*Phase 6 rounds out catalog/admin ergonomics and removes the need for heavy client-side aggregation for KPIs and hero vehicle discovery.*
