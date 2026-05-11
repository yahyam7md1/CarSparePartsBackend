# Production deployment guide: DigitalOcean + Spaces, Netlify frontend

This document describes **everything you need** to go from “local development only” to a **production** setup with:

- **Backend API + PostgreSQL** on **DigitalOcean** (recommended: **App Platform** + **Managed Database**).
- **Object storage** for product images on **DigitalOcean Spaces** (S3-compatible).
- **Frontend** (Next.js) on **Netlify**.

You do **not** need a custom domain on day one: Netlify and DigitalOcean each give you HTTPS URLs. Add DNS later when you buy a domain.

---

## 1. Target architecture

```
[Browser]
    |
    | HTTPS (your-site.netlify.app)
    v
[Netlify: Next.js]
    |  Proxied routes (recommended): /api/*, /uploads/* -> DigitalOcean API
    |
    v
[DigitalOcean App Platform: Node API]
    |-- PostgreSQL (Managed DB, DATABASE_URL)
    |-- Optional: serves /health; /uploads via static only if you keep local
    |   fallbacks — with Spaces, images are usually full CDN URLs in API JSON.
    |
    v
[DigitalOcean Spaces + CDN]
    (WebP thumbs/large images, public read)
```

**Why proxy `/api` and `/uploads` through Netlify?**

- Your frontend’s Axios clients default to **same-origin** (`NEXT_PUBLIC_API_BASE_URL` unset → empty `baseURL` in the browser). That matches how you develop with Next **`rewrites`** to the API.
- You avoid tuning **CORS** for every admin/shop endpoint while the browser only talks to `https://*.netlify.app`.

**Alternative:** Point `NEXT_PUBLIC_API_BASE_URL` at the raw DigitalOcean app URL and **lock down CORS** on the API to your Netlify origin. This works but requires strict `Access-Control-Allow-Origin` (never `*` if you use credentials). The proxy pattern is simpler for this codebase.

---

## 2. Accounts and provisioning checklist

Do these **before** cutting production traffic:

| Step | Where | Notes |
|------|--------|--------|
| 1 | DigitalOcean account | Billing method on file |
| 2 | **Managed PostgreSQL** | Same region as the app; note host, port, user, password, DB name, **SSL CA** if required |
| 3 | **Spaces** bucket | e.g. `carspareparts-media`; choose region; enable **CDN** endpoint |
| 4 | Spaces **access keys** | “Spaces access keys” in DO control panel (S3-compatible) |
| 5 | **App Platform** app | Connect GitHub repo or upload Dockerfile; attach DB + env vars |
| 6 | Netlify account | Connect **frontend** Git repo |
| 7 | Secrets | Generate a long random **JWT_SECRET** (≥ 32 chars); never reuse dev secrets |

**Domain (later):** Point `www` / `@` CNAME to Netlify; optionally `api.` A/ALIAS to App Platform load balancer—only after you are comfortable with TLS and docs for your DNS host.

---

## 3. DigitalOcean: database

1. Create **PostgreSQL** (managed).
2. Create a database user + database for the app (or use the default with a strong password).
3. Build **`DATABASE_URL`** in Prisma format, for example:

   `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`

   Use the exact SSL mode your provider shows (`require` or `verify-full` + CA).

4. **Do not** run `prisma migrate dev` against production. Use:

   ```bash
   npx prisma migrate deploy
   ```

   Run this from CI/CD or a one-off job with **`DATABASE_URL`** set to production (see §8).

5. Optional: run **seed** once if you need baseline data (only if your seed is safe for prod):

   ```bash
   npx prisma db seed
   ```

---

## 4. DigitalOcean: Spaces (images)

The backend supports **`STORAGE_DRIVER=local`** (default) and **`s3`** or **`spaces`** (DigitalOcean Spaces via the S3 API). With `s3`/`spaces`, uploads use **`@aws-sdk/client-s3`**, and `publicUrlForKey` returns **full CDN `https://…` URLs** stored in the database.

### 4.1 Behaviour to preserve

- `StorageAdapter` methods: `putObject`, `deleteObject`, `publicUrlForKey`.
- API and DB today store paths like **`/uploads/products/...`** for images. The storefront `getMediaUrl()` already supports **absolute `https://` URLs**.
- **`publicUrlForKey`** for Spaces should return a **full HTTPS URL** (bucket CDN endpoint + key), e.g.  
  `https://carspareparts-media.nyc3.cdn.digitaloceanspaces.com/products/<id>/..._thumb.webp`

### 4.2 Implementation (in repo)

- Dependency: **`@aws-sdk/client-s3`**
- **`src/storage/s3.storage.ts`** — `PutObject`, `DeleteObject`, `publicUrlForKey`
- **`src/config/storage.ts`** — `STORAGE_DRIVER`, S3 env vars; optional **`S3_OBJECT_ACL_PUBLIC_READ`** (`true`/`false`; use `false` if your bucket rejects per-object ACLs and you rely on a public-read bucket policy)
- **`src/index.ts`** — `express.static` for `/uploads` only when **`local`**

### 4.3 Migration / backfill

Existing rows with **`/uploads/...`** in the database are **not** moved automatically. Either run a one-time copy + URL rewrite, re-upload in admin, or keep serving legacy paths until migrated.

### 4.4 Spaces CORS (browser uploads from admin UI)

If the **admin browser** ever uploads **directly** to Spaces via presigned URLs, configure **CORS** on the bucket for your Netlify origin. If uploads **always go through your API** (current multipart flow to Express), **Spaces CORS for the site origin is unnecessary**—only the API receives the file.

---

## 5. DigitalOcean: App Platform (API)

### 5.1 Build & run

Your repo already has a **multi-stage `Dockerfile`**: build TypeScript, copy `dist`, production `npm ci`.

Typical App Platform settings:

| Setting | Value |
|--------|--------|
| Dockerfile path | `Dockerfile` (repo root backend) |
| HTTP port | `3000` (matches Dockerfile `EXPOSE` and `PORT` default) |
| Health check path | `/health` |

Ensure **run command** is the image default (`node dist/index.js`) unless you override.

### 5.2 Attach managed DB

Link the PostgreSQL resource so App Platform injects **`DATABASE_URL`** (verify variable name matches what you use in Prisma).

### 5.3 Ephemeral filesystem

App Platform instances have **ephemeral disks**. With **`STORAGE_DRIVER=local`**, uploads **disappear** on redeploy. Use **`s3`** / **`spaces`** in production with Spaces.

---

## 6. Netlify: Next.js frontend

### 6.1 Build settings

| Setting | Typical value |
|--------|----------------|
| Base directory | repository root of **frontend** (if monorepo, set subfolder) |
| Build command | `npm run build` |
| Publish directory | Use Netlify’s **Next.js** runtime / plugin (see Netlify docs for your Next 15 version) |
| Node version | Match local dev; **Node 20 or 22 LTS** — set `NODE_VERSION` on Netlify |

### 6.2 Proxy API + uploads (recommended)

Add **`netlify.toml`** at the **frontend** repo root (paths and plugin depend on Netlify’s current Next preset):

```toml
[build]
  command = "npm run build"

# Replace with your real DigitalOcean app URL (HTTPS, no trailing slash)

[[redirects]]
  from = "/api/*"
  to = "https://YOUR-DO-APP-URL.ondigitalocean.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/uploads/*"
  to = "https://YOUR-DO-APP-URL.ondigitalocean.app/uploads/:splat"
  status = 200
  force = true
```

**Notes:**

- During local dev you still use `next.config.ts` **rewrites** with `API_PROXY_TARGET`. Netlify does **not** apply those rewrites for inbound browser traffic the same way—in production you need **`netlify.toml`** (or Netlify UI redirects).
- If all images become **full Spaces CDN URLs**, `/uploads/*` proxy is only needed for **legacy** relative paths until data is migrated.

### 6.3 When to set `NEXT_PUBLIC_API_BASE_URL`

Set it **only** if you **stop** using the proxy and call the API directly from the browser. Then:

- Must configure backend **CORS** to allow `https://YOUR-SITE.netlify.app` (and your future production domain).
- `adminApi` uses `withCredentials: true`; prefer **proxy** unless you are sure CORS + auth headers are correct.

---

## 7. Environment variables — full reference

### 7.1 Backend (DigitalOcean App Platform)

| Variable | Required | Purpose |
|----------|-----------|---------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Often auto-set | Listen port (default `3000` in code) |
| `DATABASE_URL` | Yes | Prisma PostgreSQL URL (managed DB) |
| `JWT_SECRET` | Yes | ≥ 32 characters (`src/config/env.ts`) |
| `JWT_EXPIRES_IN` | Optional | Default `8h` |
| `BCRYPT_ROUNDS` | Optional | Default `12` if unset/invalid |
| `WHATSAPP_BUSINESS_PHONE` | Optional | Shop WhatsApp fallback (`src/config/whatsapp.ts`) |
| `WHATSAPP_GREETING_NAME_EN` / `_AR` | Optional | Greeting names |
| **Local storage (dev / legacy)** |
| `STORAGE_DRIVER` | Optional | `local` (default), or **`s3`** / **`spaces`** for DigitalOcean Spaces |
| `UPLOAD_DIR` | With local | Filesystem root for uploads |
| `PUBLIC_UPLOAD_MOUNT` | With local | Default `/uploads` |
| **Spaces / S3** |
| `STORAGE_DRIVER` | Yes (prod media) | **`s3`** or **`spaces`** |
| `S3_ENDPOINT` | Yes | e.g. `https://fra1.digitaloceanspaces.com` |
| `S3_REGION` | Yes | e.g. `fra1` |
| `S3_BUCKET` | Yes | Bucket name |
| `S3_ACCESS_KEY_ID` or `SPACES_KEY` | Yes | Use either naming convention |
| `S3_SECRET_ACCESS_KEY` or `SPACES_SECRET` | Yes | |
| `PUBLIC_ASSET_BASE_URL` | Yes | CDN base **without** trailing slash |
| `S3_OBJECT_ACL_PUBLIC_READ` | Optional | Default `true` (`public-read` on upload); set `false` if the bucket disallows ACLs |

**CORS:** If you do **not** use Netlify proxy, set explicit origins—**replace** `app.use(cors())` in `src/index.ts` with configuration that lists Netlify + future production domains.

### 7.2 Frontend (Netlify)

| Variable | Required | Purpose |
|----------|-----------|---------|
| `NODE_VERSION` | Recommended | e.g. `22` |
| `NEXT_PUBLIC_*` | As needed | Only secrets that are **safe** to expose (no private API keys) |
| `API_PROXY_TARGET` | **Build-time** for `next.config.ts` | Used when Netlify build runs Next; set to same backend URL if build does SSR that calls API |
| `NEXT_PUBLIC_API_BASE_URL` | Only if **no** proxy | Full API origin |

With **proxies** in `netlify.toml`, **browser** calls can keep `baseURL` empty; **server components** during Netlify build/SSR still resolve `getApiBaseUrl()` using `API_PROXY_TARGET` or default—set `API_PROXY_TARGET` to your **production** DO API URL for consistent SSR.

### 7.3 Spaces (bucket policy)

Configure bucket **public read** for object URLs you store in `urlThumb` / `urlLarge`, or use **signed URLs** (requires larger code changes). Simplest: **public CDN + non-guessable object keys** (UUIDs already in paths).

---

## 8. Deploy order (runbook)

1. Create **PostgreSQL** + note `DATABASE_URL`.
2. Create **Spaces** + keys + CDN URL.
3. Implement **S3 `StorageAdapter`** and deploy backend to **App Platform** with env vars.
4. Run **`prisma migrate deploy`** against production DB (from CI or job container).
5. Smoke-test: `GET https://<do-app>/health`, admin login, one image upload, verify **HTTPS** image URL in JSON.
6. Configure **Netlify** build + **`netlify.toml` proxies**.
7. Deploy frontend; open Netlify URL: shop PLP, PDP images, admin upload.
8. Add **monitoring** (DO metrics, optional uptime check on `/health`).

---

## 9. Security checklist

- [ ] Strong unique **`JWT_SECRET`** in production (rotated from dev).
- [ ] **DATABASE_URL** only in backend env, never in frontend.
- [ ] Spaces **secret keys** only in backend.
- [ ] **HTTPS** everywhere (default on DO + Netlify).
- [ ] Restrict **CORS** if using direct API URL from browser.
- [ ] Rate limit `/api/auth/login` (future hardening; mentioned in internal docs).
- [ ] Backups enabled on managed PostgreSQL (+ test restore).

---

## 10. Verification matrix

| Check | How |
|--------|-----|
| API up | `GET /health` → `{ "ok": true }` |
| DB | Admin login works; products list |
| Images | Upload image; open `urlThumb` in new tab (200, WebP) |
| Shop | Netlify site loads; PLP filters; cart if enabled |
| i18n | `/en` / `ar` routes |
| SSL | No mixed-content warnings |

---

## 11. What is **not** covered yet in code (explicit gap list)

Implement or decide before relying on production uploads:

1. **`STORAGE_DRIVER` other than `local`** — must implement Spaces/S3 adapter (§4).
2. **Netlify `netlify.toml`** — add to the **frontend** repo. A starter file is at **`carsparepartsfrontend/netlify.toml.example`** (copy to `netlify.toml` and set your DO app URL).
3. **Production CORS** — still wide open if you expose the API URL directly to browsers.
4. **Image backfill** — plan for existing `/uploads/...` rows if migrating from local.

---

## 12. Quick reference: Prisma in production

```bash
# One-off from a trusted machine or CI job with DATABASE_URL set:
cd CarSparePartsBackend
npx prisma migrate deploy
```

Never commit production `DATABASE_URL` to Git.

---

## 13. Related files in this codebase

| Area | File(s) |
|------|---------|
| API entry, port, health, static | `src/index.ts` |
| Auth env | `src/config/env.ts` |
| Storage driver | `src/config/storage.ts`, `src/storage/local.storage.ts`, `src/storage/types.ts` |
| WhatsApp env | `src/config/whatsapp.ts` |
| Prisma datasource | `prisma/schema.prisma` (`DATABASE_URL`) |
| Docker image | `Dockerfile` |

---

*Document version: 1.0 — aligns with backend `src/index.ts`, frontend `next.config.ts` rewrites + `getApiBaseUrl.ts`, and storage in `src/config/storage.ts`.*
