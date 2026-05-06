//This file is used to create the server and listen on the port
//we are importing the dotenv config to load the environment variables from the .env file
import "dotenv/config";
import { mkdirSync } from "node:fs";
//we are importing the cors to handle the cors errors, cors errors are errors that are caused by the cors policy which is a security feature that is used to prevent cross-origin requests
import cors from "cors";
//we are importing the express to create the server
import express from "express";
//we are importing the getAuthEnv to get the authentication environment variables
import { getAuthEnv } from "./config/env.js";
import { configureProductDeps } from "./config/runtime.js";
import { createStorageAdapter, getStorageEnv } from "./config/storage.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { createAdminRouter } from "./routes/admin.routes.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createCatalogRouter } from "./routes/catalog.routes.js";
import { createCheckoutRouter } from "./routes/checkout.routes.js";
//we are creating the express server
const app = express();
//we are getting the port from the environment variables
const port = Number(process.env.PORT) || 3000;
//we are getting the authentication environment variables
const authEnv = getAuthEnv();
const storageEnv = getStorageEnv();
const storageAdapter = createStorageAdapter(storageEnv);
configureProductDeps({ storageEnv, storage: storageAdapter });
mkdirSync(storageEnv.uploadRootDir, { recursive: true });
//we are using the cors middleware to handle the cors errors
app.use(cors());
//we are using the express.json middleware to parse the request body
app.use(express.json());
app.use(storageEnv.publicMountPath, express.static(storageEnv.uploadRootDir));
//we are creating the health route to check if the server is running
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
//Here the app.use is used to call the createAuthRouter and createAdminRouter functions to create the auth and admin routes
app.use("/api/auth", createAuthRouter(authEnv));
app.use("/api", createCatalogRouter());
app.use("/api", createCheckoutRouter());
app.use("/api/admin", createAdminRouter(authEnv));
app.use(errorHandler);
//we are listening on the port and the host is 0.0.0.0, the reason why we are using 0.0.0.0 is because we want to listen on all interfaces
app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
});
//# sourceMappingURL=index.js.map