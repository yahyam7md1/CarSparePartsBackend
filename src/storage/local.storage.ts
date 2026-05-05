import fs from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./types.js";

export class LocalStorageAdapter implements StorageAdapter {
  constructor(
    private readonly rootDir: string,
    private readonly publicMountPath: string,
  ) {}

  private resolvePath(key: string): string {
    const normalized = key.replace(/^[/\\]+/, "").replaceAll("\\", "/");
    const full = path.resolve(path.join(this.rootDir, normalized));
    const root = path.resolve(this.rootDir);
    const rel = path.relative(root, full);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new Error("Invalid storage key");
    }
    return full;
  }

  async putObject(key: string, body: Buffer, _contentType: string): Promise<void> {
    const fullPath = this.resolvePath(key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, body);
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolvePath(key));
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== "ENOENT") {
        throw err;
      }
    }
  }

  publicUrlForKey(key: string): string {
    const clean = key.replace(/^[/\\]+/, "").replaceAll("\\", "/");
    const base = this.publicMountPath.replace(/\/$/, "");
    return `${base}/${clean}`;
  }
}
