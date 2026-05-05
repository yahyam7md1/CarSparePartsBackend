# Phase 3: Products, images, fitments, and inventory

**Scope:** Full **admin** CRUD for **products** (backed by existing Prisma `Product` / `ProductImage` / `Fitment` models), **multipart image uploads** processed with **Multer** + **Sharp** (WebP thumb and large variants), **local file storage** behind a small adapter (ready to swap for S3-compatible storage later), **fitment** replacement per product, **inventory** single and **bulk** updates, and **public** product listing/detail for the storefront (active products only). All admin product routes remain under JWT protection (`/api/admin/*`).

---

## 1. Goals delivered

1. **Product CRUD** — Create, read (detail + paginated list with filters), update, delete. Products reference an existing **category**; **SKU** is unique. **Price** is returned as a **string** in JSON for decimal safety.
2. **Product images** — `POST` multipart upload: field **`file`** (JPEG, PNG, WebP); optional **`isMain`**, **`sortOrder`**. Server generates **thumb** (max ~300px inside box) and **large** (max ~800px) as **WebP**, stores both, persists **`urlThumb`** / **`urlLarge`** on `ProductImage`. Deleting a product or an image removes DB rows and deletes files from disk (best-effort). First image for a product is forced **main** if none exists.
3. **Storage** — **Local** adapter: files under **`UPLOAD_DIR`** (default `./uploads`), served at **`PUBLIC_UPLOAD_MOUNT`** (default `/uploads`) via Express **`express.static`**. **`STORAGE_DRIVER`** other than `local` is rejected until a future adapter exists.
4. **Fitments** — `PUT` replaces all fitments for a product with a list of **vehicle ids**; empty list clears. Validates that every vehicle id exists.
5. **Inventory** — `PATCH` single product stock; `PATCH` **bulk** for up to 200 rows (duplicate ids: last value wins after deduplication).
6. **Public catalog** — `GET /api/products` and `GET /api/products/:id` require **no JWT**; only **`isActive: true`** products are visible; inactive product detail returns **404**.
7. **Database migration** — `ProductImage` moved from a single **`url`** to **`urlThumb`**, **`urlLarge`**, and **`sortOrder`**.
8. **Docker** — Compose mounts **`./uploads:/app/uploads`** so uploads survive container restarts when using default paths.

---

## 2. Dependencies (npm)

Already present in `package.json` for this phase:

- **Multer** — multipart parsing, memory storage, file size / mimetype guard  
- **Sharp** — decode uploaded image, auto-orient (`rotate()`), resize, WebP encode  

---

## 3. Environment variables (Phase 3)

Add or rely on defaults in project root `.env` (and thus Docker `env_file`):

| Variable | Role |
| -------- | ---- |
| **`UPLOAD_DIR`** | Absolute or relative directory for stored files. Default: `uploads` under `process.cwd()` (in Docker with volume: `/app/uploads`). |
| **`PUBLIC_UPLOAD_MOUNT`** | URL path prefix for public URLs and static serving. Default: `/uploads`. No trailing slash required. |
| **`STORAGE_DRIVER`** | Optional; **`local`** (default). Any other value throws at startup until implemented. |

Existing Phase 1 vars (**`JWT_SECRET`**, etc.) and **`DATABASE_URL`** are unchanged.

---

## 4. Source files (Phase 3)

| Path | Role |
| ---- | ---- |
| `src/config/storage.ts` | `getStorageEnv()`, `createStorageAdapter()` — local driver only |
| `src/config/runtime.ts` | `configureProductDeps()` / `getProductDeps()` — injects storage into product image flows |
| `src/storage/types.ts` | `StorageAdapter` interface |
| `src/storage/local.storage.ts` | Filesystem `putObject` / `deleteObject` / `publicUrlForKey` with path traversal guard |
| `src/lib/image-processing.ts` | Sharp pipelines; `ALLOWED_IMAGE_MIMETYPES` |
| `src/middleware/product-image-upload.middleware.ts` | Multer memory, 8 MB, single field **`file`** |
| `src/utils/product-storage-paths.ts` | Maps public `/uploads/...` URLs back to storage keys for deletion |
| `src/schemas/product.schemas.ts` | Zod: product CRUD bodies, list queries, fitments, inventory bulk, upload meta |
| `src/repositories/product.repository.ts` | Product / image / fitment Prisma access, list `where` builders |
| `src/services/product.service.ts` | Business logic: image upload + rollback, delete files, fitment + inventory validation, serialization |
| `src/controllers/product.controller.ts` | HTTP handlers for all product routes |
| `src/routes/admin.routes.ts` | Product, image, fitment, inventory routes + multer error bridge |
| `src/routes/catalog.routes.ts` | Public `GET /products`, `GET /products/:id` |
| `src/index.ts` | `mkdir` upload root, `configureProductDeps`, `express.static` for uploads mount |
| `prisma/migrations/20260504180000_product_image_thumb_large/migration.sql` | `ProductImage`: add `urlThumb`, `urlLarge`, `sortOrder`; backfill from `url`; drop `url` |
| `docker-compose.yml` | `api.volumes`: `./uploads:/app/uploads` |
| `.gitignore` | `/uploads` — avoid committing user uploads |

---

## 5. API reference

### 5.1 Public (no JWT)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/products` | Paginated list; **active** products only. Query: `page`, `limit`, optional `categoryId`, `q` (search sku / names / oem). |
| GET | `/api/products/:id` | Detail with category, images, fitments + vehicles; **404** if missing or **inactive**. |

### 5.2 Admin (JWT: `Authorization: Bearer <token>`)

**Products**

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/admin/products` | List + filters: `page`, `limit`, `categoryId`, `brandName`, `isActive`, `isFeatured`, `q` |
| GET | `/api/admin/products/:id` | Full detail (all images, fitments) |
| POST | `/api/admin/products` | Create |
| PUT | `/api/admin/products/:id` | Partial update; at least one field |
| DELETE | `/api/admin/products/:id` | **204**; deletes product, fitments, image rows, then image files on disk |

**Images**

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/admin/products/:id/images` | **multipart/form-data**; field **`file`** (required); optional **`isMain`**, **`sortOrder`** |
| DELETE | `/api/admin/products/:productId/images/:imageId` | **204**; removes **both** thumb and large files for that image row |

**Fitments**

| Method | Path | Description |
| ------ | ---- | ----------- |
| PUT | `/api/admin/products/:id/fitments` | Body: `{ "vehicleIds": number[] }` — **replace** all; `[]` clears |

**Inventory**

| Method | Path | Description |
| ------ | ---- | ----------- |
| PATCH | `/api/admin/products/:id/inventory` | Body: `{ "stockQuantity": number }` |
| PATCH | `/api/admin/products/inventory/bulk` | Body: `{ "updates": [{ "id": "<uuid>", "stockQuantity": number }] }` max **200** |

---

## 6. Request body examples

**Create product**

```json
{
  "sku": "TEST-SKU-001",
  "categoryId": 5,
  "brandName": "Bosch",
  "nameEn": "Test pad",
  "nameAr": "وسادة تجريبية",
  "price": 49.99,
  "stockQuantity": 10,
  "isFeatured": true,
  "isActive": true,
  "condition": "new"
}
```

Optional: `oemNumber`, `descEn`, `descAr`, `dimensions`, `weight`, `manufacturedIn` (see Zod schema).

**Replace fitments**

```json
{
  "vehicleIds": [1, 2]
}
```

**Bulk inventory**

```json
{
  "updates": [
    { "id": "d4aef203-80e3-4259-bf1c-7593c39dedfa", "stockQuantity": 7 }
  ]
}
```

**Upload image (Postman)** — Body **form-data**:

- `file` → type **File** → pick image from disk  
- `isMain` (optional) → `true` / `false`  
- `sortOrder` (optional) → integer  

---

## 7. Business rules

- **Category** on create/update must exist; otherwise **400**.
- **SKU** unique violation → **409** (`P2002` mapped in service).
- **Product** delete: list image URLs first, delete DB product (cascade removes images/fitments), then delete files for each stored URL path.
- **Image** delete: uses **`images[].id`** from API, not the filename inside `urlThumb` / `urlLarge`. One DELETE removes **both** variants on disk.
- After deleting an image, if no row has **`isMain`**, another image is promoted (lowest `sortOrder`, then `id`).
- **Fitments:** unknown vehicle id → **400**. **Product not found** on fitments/inventory → **404** (product id not in DB for this API’s `DATABASE_URL`).
- **Public** routes never expose inactive products; admin routes show all unless filtered.

---

## 8. HTTP status summary

| Code | Typical use |
| ---- | ----------- |
| 200 | GET / PATCH success |
| 201 | POST product; POST image (returns full `product`) |
| 204 | DELETE product; DELETE image; PUT fitments |
| 400 | Zod validation, bad multipart, invalid category/vehicle reference, bulk inventory id mismatch |
| 401 | Missing or invalid JWT (admin) |
| 404 | Product or image not found; public inactive product |
| 409 | Duplicate SKU |
| 500 | Unhandled errors (global handler) |

---

## 9. Manual testing (Postman)

- Set **`{{baseUrl}}`** (e.g. `http://localhost:3001` for Docker **`3001:3000`**).
- **Login** → `POST {{baseUrl}}/api/auth/login` → Bearer token for admin routes.
- Recommended order: ensure **category** + **vehicle** exist (Phase 2) → **POST product** → **POST image** (multipart) → open browser `{{baseUrl}}` + `urlThumb` path → **PUT fitments** → **PATCH inventory** → **GET /api/products** (no auth) → **DELETE image** or **DELETE product** to clean up.

**Image URL check:** responses use paths like `/uploads/products/<productId>/<uuid>_thumb.webp` — browser: `{{baseUrl}}/uploads/...`.

---

## 10. Prisma and migration

- **`Product`** — unchanged fields from init migration: `sku` (unique), `oemNumber`, `categoryId`, names, descriptions, `price` (decimal), `stockQuantity`, flags, physical metadata, `condition`, timestamps.
- **`ProductImage`** — `id`, **`urlThumb`**, **`urlLarge`**, **`isMain`**, **`sortOrder`**, `productId` (cascade delete).
- **`Fitment`** — `productId` + `vehicleId` unique; cascade when product or vehicle deleted.

Apply migration on a DB that still had `ProductImage.url`:

```bash
npx prisma migrate deploy
```

(Docker `api` startup already runs `migrate deploy` when the image includes this migration folder.)

---

## 11. Relation to later phases

- **Remote object storage** (e.g. DigitalOcean Spaces / S3): implement another `StorageAdapter` and extend `createStorageAdapter()` / env; keep API response shape (`urlThumb` / `urlLarge` as absolute or path URLs as agreed).
- **Admin UI** will call the same routes; file input → same multipart **`file`** field.
- **Observability / rate limits** on upload endpoints can be added without changing the core contract.
