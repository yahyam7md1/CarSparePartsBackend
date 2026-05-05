import path from "node:path";
import { LocalStorageAdapter } from "../storage/local.storage.js";
export function getStorageEnv() {
    const uploadRootDir = path.resolve(process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "uploads"));
    const publicMountPath = process.env.PUBLIC_UPLOAD_MOUNT?.trim().replace(/\/$/, "") || "/uploads";
    return { uploadRootDir, publicMountPath };
}
export function createStorageAdapter(env) {
    const driver = (process.env.STORAGE_DRIVER?.trim().toLowerCase() || "local");
    if (driver !== "local") {
        throw new Error(`STORAGE_DRIVER "${driver}" is not supported yet. Use "local".`);
    }
    return new LocalStorageAdapter(env.uploadRootDir, env.publicMountPath);
}
//# sourceMappingURL=storage.js.map