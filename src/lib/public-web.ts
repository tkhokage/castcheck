import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

// Conservative IPv4-only egress. IPv6-only sources remain unavailable until an
// equivalently reviewed IPv6 policy is supplied. Pin the vetted DNS answer to
// the socket, so a second resolution cannot rebind a hostname to an internal IP.
export function isPublicIPv4(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const [a, b, c] = address.split(".").map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || b === 0 || (b === 2) || (b === 88 && c === 99))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113));
}

export function publicUrl(raw: string): URL {
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      (url.port && url.port !== (url.protocol === "https:" ? "443" : "80")) ||
      !url.hostname.includes(".") || url.hostname.endsWith(".") ||
      /\.(localhost|local|internal|test|invalid)$/i.test(url.hostname) ||
      (isIP(url.hostname) && !isPublicIPv4(url.hostname))) {
    throw new Error("Only public HTTP(S) source pages are supported.");
  }
  url.hash = "";
  return url;
}

export interface PublicPage { status: number; finalUrl: string; text: string }

export async function fetchPublicPage(raw: string, maxBytes = 200_000): Promise<PublicPage> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const aborted = new Promise<never>((_, reject) => {
    controller.signal.addEventListener("abort", () => reject(new Error("Source request timed out.")), { once: true });
  });
  async function follow(rawUrl: string, redirects: number): Promise<PublicPage> {
    const url = publicUrl(rawUrl);
    const addresses = await lookup(url.hostname, { all: true, family: 4 });
    if (!addresses.length || addresses.some(item => !isPublicIPv4(item.address))) throw new Error("Source resolves to a restricted address.");
    if (controller.signal.aborted) throw new Error("Source request timed out.");
    const response = await new Promise<{ status: number; text: string; location?: string }>((resolve, reject) => {
      const request = url.protocol === "https:" ? httpsRequest : httpRequest;
      const req = request(url, {
        agent: false,
        family: 4,
        signal: controller.signal,
        lookup: (_host, _opts, callback) => callback(null, addresses[0].address, 4),
        headers: { "User-Agent": "CastcheckVerifier/2.0", Accept: "text/html,application/xhtml+xml", "Accept-Encoding": "identity" },
      }, res => {
        const status = res.statusCode || 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.destroy();
          resolve({ status, text: "", location: res.headers.location });
          return;
        }
        if (status >= 400) { res.destroy(); resolve({ status, text: "" }); return; }
        if (!/^(text\/html|application\/xhtml\+xml)/i.test(String(res.headers["content-type"] || ""))) {
          res.destroy(); reject(new Error("Source is not an HTML page.")); return;
        }
        const chunks: Buffer[] = [];
        let bytes = 0;
        res.on("data", (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > maxBytes) { res.destroy(); reject(new Error("Source page exceeds the size limit.")); }
          else chunks.push(chunk);
        });
        res.on("error", reject);
        res.on("end", () => resolve({ status, text: Buffer.concat(chunks).toString("utf8") }));
      });
      req.on("error", reject);
      req.end();
    });
    if (response.location) {
      if (redirects >= 3) throw new Error("Too many source redirects.");
      const next = new URL(response.location, url);
      if (url.protocol === "https:" && next.protocol !== "https:") throw new Error("Insecure source redirect.");
      return follow(next.toString(), redirects + 1);
    }
    return { status: response.status, finalUrl: url.toString(), text: response.text };
  }
  try { return await Promise.race([follow(raw, 0), aborted]); }
  finally { clearTimeout(timeout); }
}
