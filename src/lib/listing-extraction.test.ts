import { describe, expect, it } from "vitest";
import { extractListing } from "./listing-extraction";
const url = "https://casting.com/role";
describe("source extraction", () => {
  it("extracts a single structured role with provenance", () => {
    const html = '<script type="application/ld+json">{"@type":"JobPosting","title":"Actor","description":"<p>Paid role</p>","validThrough":"2026-10-01"}</script>';
    const result = extractListing(html, url, url);
    expect(result.title).toBe("Actor");
    expect(result.description).toBe("Paid role");
    expect(result.deadline).toBe("2026-10-01T00:00:00.000Z");
    expect(result.contentHash).toHaveLength(64);
  });
  it("does not invent fields absent from the source", () => {
    const result = extractListing("<title>Open calls</title>", url, url);
    expect(result.description).toBe(""); expect(result.deadline).toBeNull();
    expect(result.extraction).toBe("page_metadata");
  });
  it("does not pick an arbitrary role from a collection", () => {
    const result = extractListing('<title>Collection</title><script type="application/ld+json">[{"@type":"JobPosting","title":"A"},{"@type":"JobPosting","title":"B"}]</script>', url, url);
    expect(result.title).toBe("Collection"); expect(result.extraction).toBe("page_metadata");
  });
  it("ignores malformed JSON and strips script content", () => {
    const result = extractListing('<title>Call</title><script type="application/ld+json">broken</script><meta name="description" content="<script>bad</script>Read me">', url, url);
    expect(result.title).toBe("Call"); expect(result.description).not.toContain("bad");
  });
});
