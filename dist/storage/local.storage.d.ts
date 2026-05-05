import type { StorageAdapter } from "./types.js";
export declare class LocalStorageAdapter implements StorageAdapter {
    private readonly rootDir;
    private readonly publicMountPath;
    constructor(rootDir: string, publicMountPath: string);
    private resolvePath;
    putObject(key: string, body: Buffer, _contentType: string): Promise<void>;
    deleteObject(key: string): Promise<void>;
    publicUrlForKey(key: string): string;
}
//# sourceMappingURL=local.storage.d.ts.map