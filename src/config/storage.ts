import path from "node:path";
import type { StorageAdapter } from "../storage/types.js";
import { LocalStorageAdapter } from "../storage/local.storage.js";
import {
  S3StorageAdapter,
  createS3ClientForSpaces,
} from "../storage/s3.storage.js";

export type StorageEnv = {
  uploadRootDir: string;
  publicMountPath: string;
  /** Set when STORAGE_DRIVER is s3/spaces — full public origin (CDN), no trailing slash */
  publicAssetBaseUrl: string | null;
};

function storageDriver(): string {
  return process.env.STORAGE_DRIVER?.trim().toLowerCase() || "local";
}

function requireTrimmed(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(`${name} is required for S3 / DigitalOcean Spaces storage`);
  }
  return v;
}

export function getStorageEnv(): StorageEnv {
  const uploadRootDir = path.resolve(
    process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "uploads"),
  );
  const publicMountPath =
    process.env.PUBLIC_UPLOAD_MOUNT?.trim().replace(/\/$/, "") || "/uploads";
  const driver = storageDriver();
  let publicAssetBaseUrl: string | null = null;
  if (driver === "s3" || driver === "spaces") {
    const base =
      process.env.PUBLIC_ASSET_BASE_URL?.trim().replace(/\/$/, "") ?? "";
    if (!base) {
      throw new Error(
        "PUBLIC_ASSET_BASE_URL is required when STORAGE_DRIVER is s3 or spaces (CDN origin, e.g. https://my-bucket.fra1.cdn.digitaloceanspaces.com)",
      );
    }
    publicAssetBaseUrl = base;
  }
  return { uploadRootDir, publicMountPath, publicAssetBaseUrl };
}

/** True when serving uploads from local disk (Express static + mkdir). */
export function isLocalStorageDriver(): boolean {
  const d = storageDriver();
  return d !== "s3" && d !== "spaces";
}

export function createStorageAdapter(env: StorageEnv): StorageAdapter {
  const driver = storageDriver();
  if (driver === "s3" || driver === "spaces") {
    const endpoint = requireTrimmed("S3_ENDPOINT");
    const region = requireTrimmed("S3_REGION");
    const bucket = requireTrimmed("S3_BUCKET");
    const accessKeyId =
      process.env.S3_ACCESS_KEY_ID?.trim() ||
      process.env.SPACES_KEY?.trim() ||
      "";
    const secretAccessKey =
      process.env.S3_SECRET_ACCESS_KEY?.trim() ||
      process.env.SPACES_SECRET?.trim() ||
      "";
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "S3_ACCESS_KEY_ID (or SPACES_KEY) and S3_SECRET_ACCESS_KEY (or SPACES_SECRET) are required for S3 / Spaces storage",
      );
    }
    if (!env.publicAssetBaseUrl) {
      throw new Error("publicAssetBaseUrl missing; check getStorageEnv()");
    }
    const aclRaw = process.env.S3_OBJECT_ACL_PUBLIC_READ?.trim().toLowerCase();
    const useObjectAcl =
      aclRaw === undefined || aclRaw === "" || aclRaw === "true" || aclRaw === "1";
    const client = createS3ClientForSpaces({
      endpoint,
      region,
      accessKeyId,
      secretAccessKey,
    });
    return new S3StorageAdapter(
      client,
      bucket,
      env.publicAssetBaseUrl,
      useObjectAcl,
    );
  }
  if (driver !== "local") {
    throw new Error(
      `STORAGE_DRIVER "${driver}" is not supported. Use "local", "s3", or "spaces".`,
    );
  }
  return new LocalStorageAdapter(env.uploadRootDir, env.publicMountPath);
}
