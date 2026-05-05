import type { StorageAdapter } from "../storage/types.js";
export type StorageEnv = {
    uploadRootDir: string;
    publicMountPath: string;
};
export declare function getStorageEnv(): StorageEnv;
export declare function createStorageAdapter(env: StorageEnv): StorageAdapter;
//# sourceMappingURL=storage.d.ts.map