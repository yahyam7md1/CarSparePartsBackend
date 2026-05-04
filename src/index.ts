import "dotenv/config";
import cors from "cors";
import express from "express";
import { getAuthEnv } from "./config/env.js";
import { createAdminRouter } from "./routes/admin.routes.js";
import { createAuthRouter } from "./routes/auth.routes.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const authEnv = getAuthEnv();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", createAuthRouter(authEnv));
app.use("/api/admin", createAdminRouter(authEnv));

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    if (res.headersSent) {
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
