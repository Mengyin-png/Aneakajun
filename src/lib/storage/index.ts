import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * File storage abstraction. Supports Neon Object Storage (S3-compatible) when
 * AWS_ENDPOINT_URL_S3 is configured; falls back to local disk in development.
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

class NeonObjectStorage implements StorageProvider {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(bucket = process.env.NEON_OBJECT_STORAGE_BUCKET || "assets") {
    this.bucket = bucket;
    this.s3 = new S3Client({
      forcePathStyle: true, // required: Neon uses path-style addressing
    });
  }

  async put(key: string, data: Buffer, contentType: string) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    );
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const res = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      if (!res.Body) return null;
      const bytes = await res.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (err: unknown) {
      const error = err as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  async delete(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  publicUrl(key: string) {
    return `/media/${key}`;
  }
}

let instance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!instance) {
    if (process.env.AWS_ENDPOINT_URL_S3) {
      instance = new NeonObjectStorage();
    } else {
      instance = new LocalDiskStorage(path.resolve(process.cwd(), process.env.STORAGE_DIR || "storage/uploads"));
    }
  }
  return instance;
}
