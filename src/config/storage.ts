import path from "node:path";
import type { StorageAdapter } from "../storage/types.js";
import { LocalStorageAdapter } from "../storage/local.storage.js";

export type StorageEnv = {
  uploadRootDir: string;
  publicMountPath: string;
};

export function getStorageEnv(): StorageEnv {
  const uploadRootDir = path.resolve(
    process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "uploads"),
  );
  const publicMountPath =
    process.env.PUBLIC_UPLOAD_MOUNT?.trim().replace(/\/$/, "") || "/uploads";
  return { uploadRootDir, publicMountPath };
}

export function createStorageAdapter(env: StorageEnv): StorageAdapter {
  const driver = (process.env.STORAGE_DRIVER?.trim().toLowerCase() || "local") as
    | "local"
    | string;
  if (driver !== "local") {
    throw new Error(`STORAGE_DRIVER "${driver}" is not supported yet. Use "local".`);
  }
  return new LocalStorageAdapter(env.uploadRootDir, env.publicMountPath);
}
