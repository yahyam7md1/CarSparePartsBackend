export type StorageDriver = "local";
export interface StorageAdapter {
    /** Relative path segments under the public uploads mount, e.g. products/<id>/file_thumb.webp */
    putObject(key: string, body: Buffer, contentType: string): Promise<void>;
    deleteObject(key: string): Promise<void>;
    /** Public URL path beginning with the uploads mount, e.g. /uploads/products/... */
    publicUrlForKey(key: string): string;
}
//# sourceMappingURL=types.d.ts.map