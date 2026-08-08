import { describe, it, expect, afterAll } from "vitest";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { saveUpload } from "./upload";

// 1x1 transparent PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

const written: string[] = [];

afterAll(async () => {
  for (const url of written) {
    try {
      await unlink(path.join(process.cwd(), "public", url));
    } catch {
      /* ignore */
    }
  }
});

describe("saveUpload", () => {
  it("rejects an empty file", async () => {
    const f = new File([], "empty.png", { type: "image/png" });
    const r = await saveUpload(f, "headshot", "user1");
    expect(r.ok).toBe(false);
  });

  it("rejects a disallowed mime type", async () => {
    const f = new File([PNG], "x.txt", { type: "text/plain" });
    const r = await saveUpload(f, "headshot", "user1");
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/PNG|JPG|WebP/i);
  });

  it("rejects a PDF uploaded as a headshot", async () => {
    const f = new File([PNG], "x.pdf", { type: "application/pdf" });
    const r = await saveUpload(f, "headshot", "user1");
    expect(r.ok).toBe(false);
  });

  it("accepts and writes a valid headshot", async () => {
    const f = new File([PNG], "shot.png", { type: "image/png" });
    const r = await saveUpload(f, "headshot", "user123456");
    expect(r.ok).toBe(true);
    expect(r.url).toMatch(/^\/uploads\/headshot-123456-[0-9a-f]+\.png$/);
    written.push(r.url!);
    const bytes = await readFile(path.join(process.cwd(), "public", r.url!));
    expect(bytes.length).toBe(PNG.length);
  });
});
