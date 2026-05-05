import fs from "node:fs/promises";
import path from "node:path";
export class LocalStorageAdapter {
    rootDir;
    publicMountPath;
    constructor(rootDir, publicMountPath) {
        this.rootDir = rootDir;
        this.publicMountPath = publicMountPath;
    }
    resolvePath(key) {
        const normalized = key.replace(/^[/\\]+/, "").replaceAll("\\", "/");
        const full = path.resolve(path.join(this.rootDir, normalized));
        const root = path.resolve(this.rootDir);
        const rel = path.relative(root, full);
        if (rel.startsWith("..") || path.isAbsolute(rel)) {
            throw new Error("Invalid storage key");
        }
        return full;
    }
    async putObject(key, body, _contentType) {
        const fullPath = this.resolvePath(key);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, body);
    }
    async deleteObject(key) {
        try {
            await fs.unlink(this.resolvePath(key));
        }
        catch (err) {
            const e = err;
            if (e.code !== "ENOENT") {
                throw err;
            }
        }
    }
    publicUrlForKey(key) {
        const clean = key.replace(/^[/\\]+/, "").replaceAll("\\", "/");
        const base = this.publicMountPath.replace(/\/$/, "");
        return `${base}/${clean}`;
    }
}
//# sourceMappingURL=local.storage.js.map