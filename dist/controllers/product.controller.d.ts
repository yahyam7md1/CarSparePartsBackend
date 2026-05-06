import type { NextFunction, Request, Response } from "express";
export declare function listProductsAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getProductAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function uploadProductImage(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteProductImage(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function replaceFitments(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function patchInventory(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function bulkPatchInventory(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listProductsPublic(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listFeaturedProductsPublic(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getProductFitmentsPublic(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getProductPublic(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=product.controller.d.ts.map