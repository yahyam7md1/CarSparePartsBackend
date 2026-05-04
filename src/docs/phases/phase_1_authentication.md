# Phase 1: Authentication and admin security

**Scope:** Secure the admin API with password hashing, JWT sessions, a login route, protected `/api/admin/*` middleware, and a profile endpoint for verification. Includes local Prisma seeding and Docker Compose wiring for secrets.

---

## 1. Goals delivered

1. **Password security** — Passwords are stored only as **bcrypt** hashes in the `Admin` table; verification uses `bcrypt.compare`.
2. **Session model** — **JWT** (`jsonwebtoken`) signed with `JWT_SECRET`; payload includes `sub` (admin UUID) and standard `iat` / `exp`.
3. **Admin login** — `POST /api/auth/login` with JSON body validated by **Zod**.
4. **Protection** — `requireAuth` middleware verifies `Authorization: Bearer <token>` before any `/api/admin/*` route.
5. **Profile check** — `GET /api/admin/me` returns the current admin (no password hash).
6. **Bootstrap user** — `prisma/seed.mjs` upserts an admin from `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
7. **Docker** — `api` service uses `env_file: .env` for secrets while **overriding** `DATABASE_URL` so the container uses host `db` on the Compose network.

---

## 2. Dependencies (npm)

Already declared in `package.json`: `bcrypt`, `jsonwebtoken`, `zod`, `@prisma/client`, `express`, etc.

---

## 3. New / relevant source files

| Path | Role |
| ---- | ---- |
| `src/lib/prisma.ts` | Shared `PrismaClient` instance |
| `src/config/env.ts` | `getAuthEnv()` — `JWT_SECRET` (trim / strip quotes, min 32 chars), `JWT_EXPIRES_IN` or `JWT_EXPIRATION_TIME`, `BCRYPT_ROUNDS` |
| `src/types/express.d.ts` | Extends `Express.Request` with optional `adminId` |
| `src/utils/errors.ts` | `UnauthorizedError` |
| `src/repositories/admin.repository.ts` | `findAdminByUsername`, `findAdminById` |
| `src/services/auth.service.ts` | `login`, `verifyAccessToken` |
| `src/schemas/auth.schemas.ts` | Zod `loginBodySchema` |
| `src/controllers/auth.controller.ts` | `POST /login` handler |
| `src/controllers/admin.controller.ts` | `GET /me` handler |
| `src/middleware/auth.middleware.ts` | `createRequireAuth` |
| `src/routes/auth.routes.ts` | Mounts `POST /login` under `/api/auth` |
| `src/routes/admin.routes.ts` | Applies `requireAuth` to all routes; `GET /me` |
| `src/index.ts` | Registers routers, global error handler (`headersSent` guard), listens on `0.0.0.0` for containers |
| `prisma/seed.mjs` | Loads `.env` from repo root; upserts admin |
| `prisma/migrations/20260504160000_init/` | Baseline schema including `Admin` (among other models) |

---

## 4. Environment variables

### Host (local dev, Prisma CLI, seed)

Set in project root `.env`:

- **`DATABASE_URL`** — PostgreSQL connection; for tools on the host use `localhost` (e.g. Docker-published `5432`).
- **`JWT_SECRET`** — Required; **at least 32 characters** after trim (quotes around the value in `.env` are stripped by `getAuthEnv()`).
- **`JWT_EXPIRES_IN`** or **`JWT_EXPIRATION_TIME`** — Token lifetime (e.g. `8h`). Optional; default `8h` if both omitted.
- **`ADMIN_USERNAME`** / **`ADMIN_PASSWORD`** — Used only by the seed script (plain password hashed before insert).
- **`BCRYPT_ROUNDS`** — Optional (10–16, default 12) for seed hashing.

### Docker `api` container (`docker-compose.yml`)

- **`env_file: .env`** — Injects `JWT_SECRET`, JWT expiry, bcrypt secrets, etc.
- **`environment.DATABASE_URL`** — Must point at **`db:5432`**, not `localhost`, so the API reaches Postgres inside Compose.
- **`environment.PORT`** — `3000` inside the container; host maps **`3001:3000`**.

---

## 5. API reference

### `POST /api/auth/login`

- **Body:** `{ "username": string, "password": string }`
- **Success:** `200` — `{ "token": "<jwt>" }`
- **Validation error:** `400` — `{ "error", "details" }` (Zod)
- **Bad credentials:** `401` — `{ "error": "Invalid credentials" }` (single message for unknown user vs wrong password)

### `GET /api/admin/me`

- **Header:** `Authorization: Bearer <jwt>`
- **Success:** `200` — `{ "id", "username", "createdAt" }` (`createdAt` ISO string)
- **Missing/invalid token:** `401` — `{ "error": "..." }`

### `GET /health`

- **Success:** `200` — `{ "ok": true }` (public, not under `/api/admin`)

---

## 6. Middleware behavior

- **`createRequireAuth(authEnv)`** reads the `Bearer` token, calls `verifyAccessToken`, sets **`req.adminId`**, then `next()`.
- On failure, responds with **`401` JSON** (does not leak token internals).
- **Async routes** use `.catch(next)` so rejections reach the Express error handler.
- **Global error handler** logs the error; if **`res.headersSent`**, it does not attempt a second response.

---

## 7. Database seed

```bash
npm run db:seed
```

Equivalent to `npx prisma db seed`, which runs `node prisma/seed.mjs`. The seed resolves `.env` relative to the repository root so it works regardless of the shell’s current working directory.

Re-running the seed **updates** the password hash for the same `ADMIN_USERNAME` (upsert).

---

## 8. Useful npm scripts

| Script | Command |
| ------ | ------- |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` |
| `npm run db:seed` | `prisma db seed` |
| `npm run db:studio` | `prisma studio` |

On Windows, use **`npx prisma …`** or these scripts; the bare `prisma` CLI is not on `PATH` unless installed globally.

---

## 9. Manual testing (examples)

**Host URL when using Docker API:** `http://127.0.0.1:3001`  
**Host URL when using `npm run dev`:** `http://127.0.0.1:3000` (unless `PORT` is set)

Login (PowerShell):

```powershell
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:3001/api/auth/login" -ContentType "application/json" -Body '{"username":"<admin>","password":"<password>"}'
```

Profile (replace token):

```powershell
Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:3001/api/admin/me" -Headers @{ Authorization = "Bearer <token>" }
```

After code changes, rebuild the API image: `docker compose up --build api` (or `--build` for the full stack).

---

## 10. Security notes (MVP)

- Treat JWTs like secrets; do not log or commit them.
- Rotate **`JWT_SECRET`** if exposed; existing tokens become invalid.
- Prefer **HTTPS** in production; expand CORS for known admin origins only.
- Future hardening: rate limiting on `/api/auth/login`, refresh tokens, httpOnly cookies, etc.

---

## 11. Prisma migrations note

The repository includes an **`init`** migration aligning the database with `schema.prisma`. For a completely empty database, run **`npx prisma migrate deploy`** (e.g. in CI or the Docker `api` startup command). If the database was created earlier without migration history, use **`prisma migrate resolve`** only when you have confirmed the live schema matches the migration (see Prisma docs for drift and baselining).
