import { describe, it, expect } from "vitest";
import { screenOpportunity } from "./screen";

const codes = (r: ReturnType<typeof screenOpportunity>) => r.indicators.map((i) => i.code);

describe("screenOpportunity", () => {
  it("returns a clean-ish result for a legitimate listing", () => {
    const r = screenOpportunity({
      description: "Supporting role in an indie feature. Self-tape via casting portal.",
      payDetails: "$750/day",
      submissionMethod: "Self-tape via casting portal",
      productionCompany: "Bluebonnet Pictures LLC",
    });
    expect(r.indicators).toHaveLength(0);
    expect(r.suggestedStatus).toBe("published");
    expect(r.suggestedState).toBe("needs_review");
  });

  it("detects the classic scam pattern and flags as high risk", () => {
    const r = screenOpportunity({
      description:
        "URGENT! Guaranteed lead role. Pay a $199 registration fee via gift card. Message me on Telegram. Send your home address.",
      payDetails: "guaranteed role",
      submissionMethod: "Telegram DM",
      productionCompany: "",
    });
    expect(codes(r)).toEqual(
      expect.arrayContaining(["gift_card", "upfront_fee", "guarantee", "urgency", "off_platform", "home_address", "no_company"]),
    );
    expect(r.likelihood).toBe(5);
    expect(r.impact).toBe(5);
    expect(r.suggestedState).toBe("high_risk");
    expect(r.suggestedStatus).toBe("flagged");
  });

  it("detects highly sensitive data requests", () => {
    const r = screenOpportunity({
      description: "Please provide your SSN and banking information to proceed.",
      productionCompany: "Some Co",
    });
    expect(codes(r)).toContain("highly_sensitive");
  });

  it("flags a single high-severity signal", () => {
    const r = screenOpportunity({
      description: "Please send payment via wire transfer.",
      productionCompany: "Some Co",
    });
    expect(codes(r)).toContain("wire");
    expect(r.suggestedStatus).toBe("flagged");
  });

  it("adds a quality indicator when no production company is given", () => {
    const r = screenOpportunity({ description: "A nice role.", productionCompany: "" });
    expect(codes(r)).toContain("no_company");
  });
});
