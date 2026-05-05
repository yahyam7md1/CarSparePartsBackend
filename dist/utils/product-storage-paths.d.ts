import type { StorageEnv } from "../config/storage.js";
/** Strip public mount prefix to get storage key, or null if not under uploads. */
export declare function publicUrlToStorageKey(env: StorageEnv, publicUrl: string): string | null;
//# sourceMappingURL=product-storage-paths.d.ts.map