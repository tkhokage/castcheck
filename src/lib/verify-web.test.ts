import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyWebsite } from "./verify-web";

function mockFetch(status: number, finalUrl: string, body: string) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    status,
    url: finalUrl,
    text: () => Promise.resolve(body),
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe("verifyWebsite", () => {
  it("fails when no URL is provided (network never touched)", async () => {
    const r = await verifyWebsite({ url: null, contactEmail: "x@y.com" });
    expect(r.verdict).toBe("fail");
    expect(r.reachable).toBe(false);
    expect(r.normalizedUrl).toBeNull();
  });

  it("passes when the site loads and the email domain matches", async () => {
    mockFetch(200, "https://reedcasting.com/", "<html>Reed Casting Dallas</html>");
    const r = await verifyWebsite({ url: "reedcasting.com", contactEmail: "submissions@reedcasting.com" });
    expect(r.reachable).toBe(true);
    expect(r.domainMatch).toBe("match");
    expect(r.verdict).toBe("pass");
  });

  it("warns when reachable but the email domain does not match the site", async () => {
    mockFetch(200, "https://bluebonnetpictures.com/", "<html>Bluebonnet</html>");
    const r = await verifyWebsite({ url: "bluebonnetpictures.com", contactEmail: "michael@fastmail.com" });
    expect(r.reachable).toBe(true);
    expect(r.domainMatch).toBe("mismatch");
    expect(r.verdict).toBe("warn");
  });

  it("passes on entity mention even without an email to compare", async () => {
    mockFetch(200, "https://kimdawsonagency.com/", "<html>Welcome to the Kim Dawson Agency</html>");
    const r = await verifyWebsite({ url: "https://kimdawsonagency.com", entityName: "Kim Dawson Agency" });
    expect(r.mentionsEntity).toBe(true);
    expect(r.verdict).toBe("pass");
  });

  it("fails when the server returns an error status", async () => {
    mockFetch(503, "https://down.example/", "");
    const r = await verifyWebsite({ url: "down.example" });
    expect(r.reachable).toBe(false);
    expect(r.verdict).toBe("fail");
  });

  it("fails when the fetch throws (unreachable)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ENOTFOUND")));
    const r = await verifyWebsite({ url: "nope.example" });
    expect(r.reachable).toBe(false);
    expect(r.verdict).toBe("fail");
  });
});
