import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Local file storage for the demo. In production, swap this for object storage
// (S3/R2/Blob) behind the same interface. Only "public" tier media (headshots,
// resumes, demo reels) is accepted here.

export type UploadKind = "headshot" | "resume" | "reel";

const RULES: Record<UploadKind, { mimes: string[]; maxBytes: number; label: string }> = {
  headshot: {
    mimes: ["image/png", "image/jpeg", "image/webp"],
    maxBytes: 5 * 1024 * 1024,
    label: "a PNG, JPG, or WebP image up to 5MB",
  },
  resume: {
    mimes: ["application/pdf"],
    maxBytes: 10 * 1024 * 1024,
    label: "a PDF up to 10MB",
  },
  reel: {
    mimes: ["video/mp4", "video/quicktime", "video/webm"],
    maxBytes: 10 * 1024 * 1024,
    label: "an MP4/MOV/WebM video up to 10MB",
  },
};

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export interface UploadOutcome {
  ok: boolean;
  url?: string;
  error?: string;
}

export async function saveUpload(file: File, kind: UploadKind, userId: string): Promise<UploadOutcome> {
  const rule = RULES[kind];
  if (!file || file.size === 0) return { ok: false, error: "No file selected." };
  if (!rule.mimes.includes(file.type)) return { ok: false, error: `Please upload ${rule.label}.` };
  if (file.size > rule.maxBytes) return { ok: false, error: `File too large — upload ${rule.label}.` };

  const ext = EXT[file.type] ?? "bin";
  const name = `${kind}-${userId.slice(-6)}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  // Production: object storage (Vercel Blob) when configured. Local disk otherwise.
  // Both return a URL, so callers are unchanged.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${name}`, bytes, {
        access: "public",
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return { ok: true, url: blob.url };
    } catch (e) {
      console.error("[upload] blob store failed", e);
      return { ok: false, error: "Upload failed. Please try again." };
    }
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return { ok: true, url: `/uploads/${name}` };
}
