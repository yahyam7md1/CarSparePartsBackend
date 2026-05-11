import type { StorageEnv } from "../config/storage.js";

/** Strip CDN base or /uploads prefix to get storage key, or null if unknown. */
export function publicUrlToStorageKey(
  env: StorageEnv,
  publicUrl: string,
): string | null {
  const u = publicUrl.trim();
  if (env.publicAssetBaseUrl) {
    const base = env.publicAssetBaseUrl.replace(/\/$/, "");
    if (u.startsWith(`${base}/`)) {
      const rest = u.slice(base.length + 1);
      return rest.length > 0 ? rest.split("?")[0]!.replaceAll("\\", "/") : null;
    }
  }
  const mount = env.publicMountPath.replace(/\/$/, "");
  if (!u.startsWith(`${mount}/`) && u !== mount) {
    return null;
  }
  const rest = u.startsWith(`${mount}/`) ? u.slice(mount.length + 1) : "";
  const noQuery = rest.split("?")[0]!;
  return noQuery.length > 0 ? noQuery.replaceAll("\\", "/") : null;
}
