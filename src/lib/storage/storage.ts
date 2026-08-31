import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type UploadFileInput = {
  data: Buffer;
  contentType: string;
  extension?: string;
};

export interface Storage {
  uploadFile(input: UploadFileInput): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(key: string, contentType?: string): string;
  readFile(key: string): Promise<Buffer>;
}

const storageRoot = process.env.STORAGE_DIR?.trim() || path.join(process.cwd(), "storage", "uploads");

function safeKey(key: string) {
  const normalized = path.posix.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
  if (!normalized || normalized.startsWith("/") || normalized.includes("..")) {
    throw new Error("Invalid storage key.");
  }
  return normalized;
}

export const localStorage: Storage = {
  async uploadFile({ data, contentType, extension = "bin" }) {
    const key = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension.replace(/[^a-z0-9]/gi, "") || "bin"}`;
    const filePath = path.join(storageRoot, safeKey(key));
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    void contentType;
    return key;
  },
  async deleteFile(key) {
    try {
      await unlink(path.join(storageRoot, safeKey(key)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  },
  getFileUrl(key, contentType) {
    const type = contentType ? `&type=${encodeURIComponent(contentType)}` : "";
    return `/api/files?key=${encodeURIComponent(safeKey(key))}${type}`;
  },
  async readFile(key) {
    return readFile(path.join(storageRoot, safeKey(key)));
  },
};

export const storage = localStorage;
