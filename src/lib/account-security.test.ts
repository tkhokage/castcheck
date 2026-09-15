import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { beginMfa, resendVerification } from "@/app/actions/account";
import { requestPasswordReset } from "@/app/actions/password";
import { db } from "./db";
import { getSession } from "./auth";
import { rateLimit } from "./rate-limit";
import { sendVerification, sendPasswordReset, baseUrl } from "./email";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("./db", () => ({ db: { user: { updateMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() } } }));
vi.mock("./auth", () => ({ getSession: vi.fn(), hashPassword: vi.fn() }));
vi.mock("./audit", () => ({ audit: vi.fn() }));
vi.mock("./rate-limit", () => ({ rateLimit: vi.fn() }));
vi.mock("./email", () => ({ sendVerification: vi.fn(), sendPasswordReset: vi.fn(), baseUrl: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("NODE_ENV", "production");
  vi.mocked(getSession).mockResolvedValue({ id: "actor", email: "actor@example.test" } as never);
  vi.mocked(rateLimit).mockResolvedValue({ ok: true, remaining: 4, retryAfterSec: 0 });
  vi.mocked(baseUrl).mockResolvedValue("https://castcheck.example.test");
});
afterEach(() => vi.unstubAllEnvs());

describe("account security boundaries", () => {
  it("cannot restart enrollment on an account with active MFA", async () => {
    vi.mocked(db.user.updateMany).mockResolvedValue({ count: 0 });
    expect(await beginMfa()).toHaveProperty("error");
    expect(db.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "actor", mfaEnabled: false } }));
    expect(db.user.update).not.toHaveBeenCalled();
  });
  it("never returns a production reset token when email delivery fails", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "actor", email: "actor@example.test", active: true } as never);
    vi.mocked(sendPasswordReset).mockResolvedValue({ delivered: false });
    const form = new FormData(); form.set("email", "actor@example.test");
    expect(await requestPasswordReset(undefined, form)).toEqual({ ok: true });
  });
  it("never returns a production verification token when delivery fails", async () => {
    vi.mocked(sendVerification).mockResolvedValue({ delivered: false });
    const result = await resendVerification();
    expect(result).toHaveProperty("error"); expect(result).not.toHaveProperty("link");
  });
});
