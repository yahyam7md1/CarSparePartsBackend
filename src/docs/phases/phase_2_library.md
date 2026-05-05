# Phase 2: Library — categories and vehicles

**Scope:** Admin CRUD for **hierarchical categories** (with `parentId`, unique slugs, cycle checks, safe delete rules) and **vehicle library** rows. Public **category tree** for the shop. **Slug** helper for SEO-friendly category URLs. All admin mutations live under existing JWT protection (`/api/admin/*`).

---

## 1. Goals delivered

1. **Hierarchical categories** — Create / list (flat) / update / delete with optional `parentId`; prevent invalid parents and **parent cycles**; **delete** blocked if sub-categories or products exist.
2. **Category slugs** — Auto from English name (`slugify`) plus **numeric suffix** until unique (`brakes`, `brakes-1`, …). Optional explicit `slug` on create/update.
3. **Vehicle library** — Full admin CRUD: list with pagination + optional `brand` filter (case-insensitive), get by id, create, update, delete.
4. **Public catalog** — `GET /api/categories` returns a **nested tree** (no auth).
5. **Shared errors** — `HttpError` in `src/utils/errors.ts` for **400 / 404 / 409** with a `statusCode` (used by category/vehicle flows).

---

## 2. Dependencies

No new packages. Uses existing **Express**, **Prisma**, **Zod**, and Phase 1 **auth middleware**.

---

## 3. Source files (Phase 2)

| Path | Role |
| ---- | ---- |
| `src/utils/slug.ts` | `slugify()` — NFKD / ASCII-ish URL segment from English text; fallback base `"category"` if empty |
| `src/utils/errors.ts` | `HttpError` (in addition to `UnauthorizedError`) |
| `src/repositories/category.repository.ts` | Category Prisma access: find, list, counts, create, update, delete, `slugTaken` |
| `src/repositories/vehicle.repository.ts` | Vehicle list/count/create/update/delete; list `where` uses empty object when no brand filter |
| `src/services/category.service.ts` | Parent validation, cycle check, unique slug, delete rules, `buildCategoryTree` |
| `src/services/vehicle.service.ts` | Pagination bounds, 404 on missing vehicle, trim inputs |
| `src/schemas/category.schemas.ts` | Zod: create/update bodies, `id` param |
| `src/schemas/vehicle.schemas.ts` | Zod: create/update bodies, list query, `id` param |
| `src/controllers/category.controller.ts` | Admin CRUD + public tree handler |
| `src/controllers/vehicle.controller.ts` | Admin vehicle CRUD |
| `src/routes/catalog.routes.ts` | Public `GET /categories` mounted at `/api` |
| `src/routes/admin.routes.ts` | Extended with `/categories` and `/vehicles` admin routes (all behind `requireAuth`) |
| `src/index.ts` | `app.use("/api", createCatalogRouter())` before `/api/admin` |

---

## 4. API reference

### 4.1 Public (no JWT)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/categories` | Nested `{ categories: CategoryTreeNode[] }` |

Each tree node: `id`, `parentId`, `nameEn`, `nameAr`, `slug`, `children[]`. Orphan rows (missing parent id in DB) are attached at root level for resilience.

### 4.2 Admin (JWT: `Authorization: Bearer <token>`)

**Categories**

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/admin/categories` | Flat list `{ categories }` ordered by `parentId`, `id` |
| POST | `/api/admin/categories` | Create; body: `nameEn`, `nameAr`, optional `parentId` (null root), optional `slug` |
| PUT | `/api/admin/categories/:id` | Update; at least one field; optional `parentId`, `slug`, names |
| DELETE | `/api/admin/categories/:id` | **204** empty body if ok |

**Vehicles**

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/admin/vehicles` | Query: `page`, `limit` (max 200), optional `brand` — response `{ vehicles, total, page, limit }` |
| GET | `/api/admin/vehicles/:id` | Single vehicle |
| POST | `/api/admin/vehicles` | Create |
| PUT | `/api/admin/vehicles/:id` | Partial update; at least one field |
| DELETE | `/api/admin/vehicles/:id` | **204** if ok |

---

## 5. Request body shapes (examples)

**Create category (root)**

```json
{
  "nameEn": "Brakes",
  "nameAr": "فرامل",
  "parentId": null
}
```

**Create category (child)**

```json
{
  "nameEn": "Pads",
  "nameAr": "فحمات",
  "parentId": 1
}
```

**Update category**

```json
{
  "nameEn": "Brakes updated",
  "parentId": null
}
```

**Create vehicle**

```json
{
  "brand": "BMW",
  "series": "5 Series",
  "specifics": "530i",
  "chassisCode": "E60",
  "yearRange": "2004-2010"
}
```

---

## 6. Business rules

### Categories

- **Parent** must exist if `parentId` is set; **cannot** be self; **cannot** introduce a **cycle** (new parent must not lie in the subtree of the category being updated — implemented by walking ancestors from the candidate parent).
- **Slug** — from `slug` field if non-empty after trim; else from `nameEn`. **Uniqueness** enforced except current row on update.
- **Delete** — Rejected with **409** if any **child categories** or **products** reference the category (service checks before delete; DB also enforces product FK).

### Vehicles

- **List filter** — `brand` match is **case-insensitive** (Prisma `mode: 'insensitive'`).
- **Delete** — Prisma schema sets `Fitment` → `Vehicle` **onDelete: Cascade**, so deleting a vehicle removes related fitment rows (links only; products remain).

---

## 7. HTTP status summary

| Code | Typical use |
| ---- | ------------- |
| 200 | GET / PUT success |
| 201 | POST category / vehicle |
| 204 | DELETE category / vehicle |
| 400 | Zod validation / bad params |
| 401 | Missing or invalid JWT (admin) |
| 404 | Category or vehicle not found |
| 409 | Delete category with children or products |

Unhandled errors still go to the global **500** handler in `src/index.ts`.

---

## 8. Manual testing (Postman)

- Set **`{{baseUrl}}`** (e.g. `http://127.0.0.1:3001` for Docker API).
- **Login:** `POST {{baseUrl}}/api/auth/login` → save `token`.
- Admin requests: **Bearer** `{{token}}`.
- Order: **Login → GET /api/admin/me → POST categories → GET /api/categories (tree) → vehicles CRUD**.

---

## 9. Prisma models (reference)

- **`Category`** — `id`, `parentId?`, `nameEn`, `nameAr`, `slug` (unique), self-relation `SubCategories`, `products`.
- **`Vehicle`** — `id`, `brand`, `series`, `specifics`, `chassisCode`, `yearRange`, `fitments[]`.

No migration changes were required for Phase 2 beyond what Phase 1 already applied for these tables.

---

## 10. Relation to later phases

**Products** depend on **Category**; **Fitments** depend on **Product** and **Vehicle**. Phase 2 establishes the library so product and fitment features can attach to real category and vehicle rows.
