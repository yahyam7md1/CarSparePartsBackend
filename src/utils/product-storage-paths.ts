import type { StorageEnv } from "../config/storage.js";

/** Strip public mount prefix to get storage key, or null if not under uploads. */
export function publicUrlToStorageKey(
  env: StorageEnv,
  publicUrl: string,
): string | null {
  const mount = env.publicMountPath.replace(/\/$/, "");
  const u = publicUrl.trim();
  if (!u.startsWith(`${mount}/`) && u !== mount) {
    return null;
  }
  const rest = u.startsWith(`${mount}/`) ? u.slice(mount.length + 1) : "";
  return rest.length > 0 ? rest.replaceAll("\\", "/") : null;
}
