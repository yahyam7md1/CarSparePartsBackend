import type { StorageAdapter } from "../storage/types.js";
import type { StorageEnv } from "./storage.js";
type ProductDeps = {
    storageEnv: StorageEnv;
    storage: StorageAdapter;
};
export declare function configureProductDeps(deps: ProductDeps): void;
export declare function getProductDeps(): ProductDeps;
export {};
//# sourceMappingURL=runtime.d.ts.map