import { afterEach, describe, expect, it, vi } from "vitest";
import { sendEmail, baseUrl } from "./email";
import { saveUpload } from "./upload";

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("production integration failures", () => {
  it("never logs an email token when the provider is missing", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("EMAIL_PROVIDER_API_KEY", "");
    const log = vi.spyOn(console, "log");
    expect((await sendEmail({ to: "actor@example.com", subject: "Reset", html: "secret-token", text: "secret-token" })).delivered).toBe(false);
    expect(log).not.toHaveBeenCalled();
  });
  it("does not derive production reset origins from incoming host headers", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("APP_URL", "");
    await expect(baseUrl()).rejects.toThrow("APP_URL");
  });
  it("does not acknowledge a production upload to ephemeral local disk", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    const result = await saveUpload(new File(["content"], "photo.png", { type: "image/png" }), "headshot", "actor");
    expect(result.ok).toBe(false); expect(result.url).toBeUndefined();
  });
});
