import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * File storage abstraction. Development uses the local disk; for Daun Penh
 * Cloud (or any S3-compatible object storage) implement this interface and
 * return it from getStorage() — nothing else in the app needs to change.
 */
export interface StorageProvider {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  publicUrl(key: string): string;
}

const SAFE_KEY = /^[a-z0-9][a-z0-9/_.-]*$/i;

class LocalDiskStorage implements StorageProvider {
  constructor(private readonly root: string) {}

  private resolve(key: string) {
    if (!SAFE_KEY.test(key) || key.includes("..")) throw new Error("Invalid storage key");
    const full = path.resolve(this.root, key);
    if (!full.startsWith(path.resolve(this.root) + path.sep)) throw new Error("Invalid storage key");
    return full;
  }

  async put(key: string, data: Buffer) {
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
  }

  async get(key: string) {
    try {
      return await readFile(this.resolve(key));
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    await rm(this.resolve(key), { force: true });
  }

  publicUrl(key: string) {
    return `/media/${key}`;
  }
}

let instance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  instance ??= new LocalDiskStorage(path.resolve(process.cwd(), process.env.STORAGE_DIR || "storage/uploads"));
  return instance;
}
