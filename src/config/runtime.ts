import type { StorageAdapter } from "../storage/types.js";
import type { StorageEnv } from "./storage.js";

type ProductDeps = {
  storageEnv: StorageEnv;
  storage: StorageAdapter;
};

let productDeps: ProductDeps | undefined;

export function configureProductDeps(deps: ProductDeps): void {
  productDeps = deps;
}

export function getProductDeps(): ProductDeps {
  if (!productDeps) {
    throw new Error("Product dependencies are not configured (call configureProductDeps from bootstrap).");
  }
  return productDeps;
}
