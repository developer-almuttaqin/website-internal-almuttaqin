import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDemo, supabaseServer } from "./db";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};
export const MAX_UPLOAD = 5 * 1024 * 1024;
export const BUCKET = "internal-files";
const DEMO_DIR = path.join(process.cwd(), ".data", "uploads");

export class UploadError extends Error {}

/** Simpan bukti/foto (gambar atau PDF, maks. 5 MB) dan kembalikan path-nya; null bila tidak ada file. */
export async function saveUpload(file: unknown, folder: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = ALLOWED[file.type];
  if (!ext) throw new UploadError("errors.fileType");
  if (file.size > MAX_UPLOAD) throw new UploadError("errors.fileSize");
  const name = `${folder.replace(/[^a-z0-9_-]/gi, "")}/${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (isDemo) {
    const target = path.join(DEMO_DIR, name);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  } else {
    const sb = await supabaseServer();
    const { error } = await sb.storage.from(BUCKET).upload(name, bytes, { contentType: file.type });
    if (error) throw new Error(error.message);
  }
  return name;
}

export async function readUpload(name: string): Promise<{ body: Buffer; type: string } | { redirect: string } | null> {
  if (!/^[a-z0-9_-]+\/[a-f0-9-]+\.(jpg|png|webp|pdf)$/i.test(name)) return null;
  const ext = name.split(".").pop()!.toLowerCase();
  const type = Object.entries(ALLOWED).find(([, e]) => e === ext)?.[0] ?? "application/octet-stream";
  if (isDemo) {
    try {
      return { body: await readFile(path.join(DEMO_DIR, name)), type };
    } catch {
      return null;
    }
  }
  const sb = await supabaseServer();
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(name, 60);
  return data?.signedUrl ? { redirect: data.signedUrl } : null;
}
