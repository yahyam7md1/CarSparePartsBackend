let productDeps;
export function configureProductDeps(deps) {
    productDeps = deps;
}
export function getProductDeps() {
    if (!productDeps) {
        throw new Error("Product dependencies are not configured (call configureProductDeps from bootstrap).");
    }
    return productDeps;
}
//# sourceMappingURL=runtime.js.map