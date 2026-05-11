export type StorageDriver = "local" | "s3" | "spaces";

export interface StorageAdapter {
  /** Relative path segments under the public uploads mount, e.g. products/<id>/file_thumb.webp */
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  deleteObject(key: string): Promise<void>;
  /** Local: path like /uploads/... ; S3/Spaces: absolute https:// CDN URL */
  publicUrlForKey(key: string): string;
}
