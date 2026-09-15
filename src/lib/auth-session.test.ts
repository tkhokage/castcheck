import { describe, expect, it, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";
import { getSession } from "./auth";
import { db } from "./db";
import { cookies } from "next/headers";

vi.mock("./db", () => ({ db: { user: { findUnique: vi.fn() } } }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
beforeEach(() => vi.resetAllMocks());
async function cookie() {
  const token = await new SignJWT({ id: "actor", role: "admin" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(new TextEncoder().encode(process.env.AUTH_SECRET || "insecure-dev-secret"));
  vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: token }) } as unknown as Awaited<ReturnType<typeof cookies>>);
}
describe("session revocation and role changes", () => {
  it("rejects a deactivated account despite its valid cookie", async () => {
    await cookie();
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "actor", active: false } as never);
    expect(await getSession()).toBeNull();
  });
  it("uses the current database role instead of the cookie role", async () => {
    await cookie();
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "actor", active: true, role: "actor", name: "TK", email: "tk@example.com" } as never);
    expect((await getSession())?.role).toBe("actor");
  });
  it("rejects a deleted account", async () => {
    await cookie(); vi.mocked(db.user.findUnique).mockResolvedValue(null);
    expect(await getSession()).toBeNull();
  });
});
