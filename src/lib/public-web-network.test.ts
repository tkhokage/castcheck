import { describe, expect, it, vi, beforeEach } from "vitest";
import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { EventEmitter } from "node:events";
import { fetchPublicPage } from "./public-web";

vi.mock("node:dns/promises", () => ({ lookup: vi.fn() }));
vi.mock("node:https", () => ({ request: vi.fn() }));
vi.mock("node:http", () => ({ request: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

function network(status: number, headers: Record<string, string>, body = "") {
  vi.mocked(lookup).mockResolvedValue([{ address: "93.184.216.34", family: 4 }] as never);
  vi.mocked(request).mockImplementation(((_url: unknown, _options: unknown, callback: (res: unknown) => void) => {
    const req = new EventEmitter() as EventEmitter & { end: () => void };
    req.end = () => queueMicrotask(() => {
      const res = Object.assign(new EventEmitter(), { statusCode: status, headers, destroy: vi.fn() });
      callback(res);
      res.emit("data", Buffer.from(body)); res.emit("end");
    });
    return req;
  }) as never);
}

describe("source fetch transport", () => {
  it("pins the validated IP on the actual request", async () => {
    network(200, { "content-type": "text/html" }, "<title>Role</title>");
    expect((await fetchPublicPage("https://casting.com/role")).status).toBe(200);
    const options = vi.mocked(request).mock.calls[0][1] as { lookup: (host: string, options: object, cb: (err: unknown, address: string, family: number) => void) => void };
    const callback = vi.fn(); options.lookup("casting.com", {}, callback);
    expect(callback).toHaveBeenCalledWith(null, "93.184.216.34", 4);
  });
  it("rejects a DNS response containing an internal address before connection", async () => {
    network(200, { "content-type": "text/html" });
    vi.mocked(lookup).mockResolvedValue([{ address: "10.0.0.1", family: 4 }] as never);
    await expect(fetchPublicPage("https://casting.com")).rejects.toThrow("restricted");
    expect(request).not.toHaveBeenCalled();
  });
  it("rejects a redirect into the internal network", async () => {
    network(302, { location: "https://127.0.0.1/secret" });
    await expect(fetchPublicPage("https://casting.com")).rejects.toThrow();
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("rejects oversized responses", async () => {
    network(200, { "content-type": "text/html" }, "too large");
    await expect(fetchPublicPage("https://casting.com", 4)).rejects.toThrow("size limit");
  });
  it("rejects non-HTML bodies", async () => {
    network(200, { "content-type": "application/octet-stream" });
    await expect(fetchPublicPage("https://casting.com")).rejects.toThrow("not an HTML");
  });
  it("bounds redirect loops", async () => {
    network(302, { location: "https://casting.com/again" });
    await expect(fetchPublicPage("https://casting.com")).rejects.toThrow("Too many");
    expect(request).toHaveBeenCalledTimes(4);
  });
});
