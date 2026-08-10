import { describe, it, expect } from "vitest";
import { analyzeContract } from "./contract";

const keys = (t: string) => analyzeContract(t).findings.map((f) => f.key);

describe("analyzeContract", () => {
  it("returns nothing meaningful for empty/irrelevant text", () => {
    const r = analyzeContract("Hello, this is a friendly note about the weather.");
    expect(r.findings).toHaveLength(0);
    expect(r.flags).toHaveLength(0);
  });

  it("flags AI / digital-likeness language as high concern", () => {
    const text =
      "The Company may create a digital replica of the Artist and use artificial intelligence to synthesize the Artist's voice.";
    const r = analyzeContract(text);
    expect(keys(text)).toContain("digital_likeness");
    expect(r.flags.some((f) => f.key === "digital_likeness")).toBe(true);
  });

  it("flags perpetual / irrevocable rights", () => {
    const r = analyzeContract("The Artist grants these rights irrevocably and in perpetuity throughout the universe.");
    expect(r.flags.some((f) => f.key === "perpetual_rights")).toBe(true);
  });

  it("detects exclusivity and commission as findings", () => {
    const r = analyzeContract(
      "The Agency shall be the sole and exclusive representative of the Artist. The Agency's commission shall be ten percent (10%) of gross earnings.",
    );
    const k = r.findings.map((f) => f.key);
    expect(k).toContain("exclusivity");
    expect(k).toContain("commission");
  });

  it("extracts commission percentage and flags an unusually high rate", () => {
    const r = analyzeContract("The Agency shall receive a commission of 35% of all compensation.");
    expect(r.commissionPct).toBe(35);
    expect(r.flags.some((f) => f.key === "commission")).toBe(true);
  });

  it("treats a standard 10% commission as non-high", () => {
    const r = analyzeContract("The Agency commission is 10% of gross earnings.");
    expect(r.commissionPct).toBe(10);
    expect(r.flags.some((f) => f.key === "commission")).toBe(false);
  });

  it("escalates plain likeness to high when tied to perpetual/AI language", () => {
    const r = analyzeContract("The Company may use the Artist's name and likeness in perpetuity.");
    const likeness = r.findings.find((f) => f.key === "likeness");
    expect(likeness?.concern).toBe("high");
  });

  it("always includes the not-legal-advice disclaimer", () => {
    const r = analyzeContract("The term of this agreement is two (2) years.");
    expect(r.disclaimer).toMatch(/not legal advice/i);
    expect(r.disclaimer).toMatch(/attorney/i);
  });

  it("detects post-termination commissions and auto-renewal cautions", () => {
    const r = analyzeContract(
      "This agreement shall automatically renew for successive one (1) year terms. Commissions shall continue after the termination of this agreement.",
    );
    const k = r.findings.map((f) => f.key);
    expect(k).toContain("renewal");
    expect(k).toContain("post_term_commission");
  });
});
