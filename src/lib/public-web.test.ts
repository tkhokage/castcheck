import { describe, expect, it } from "vitest";
import { isPublicIPv4, publicUrl } from "./public-web";

describe("public source network boundary", () => {
  it.each(["127.0.0.1", "10.0.0.1", "169.254.169.254", "172.16.0.1", "192.168.1.1", "100.64.0.1", "0.0.0.0", "224.0.0.1", "198.18.0.1", "::1", "::ffff:127.0.0.1"])("rejects restricted address %s", ip => expect(isPublicIPv4(ip)).toBe(false));
  it.each(["https://127.1", "https://2130706433", "http://0x7f000001", "https://[::1]", "file:///etc/passwd", "https://user:pass@casting.com", "https://casting.com:8443", "https://metadata.internal", "http://localhost"])("rejects unsafe source URL %s", url => expect(() => publicUrl(url)).toThrow());
  it("allows a normal public source and removes fragment", () => expect(publicUrl("https://casting.com/a#top").toString()).toBe("https://casting.com/a"));
  it("permits ordinary public IPv4 addresses", () => expect(isPublicIPv4("93.184.216.34")).toBe(true));
});
