import { describe, it, expect } from "vitest";
import { careerFit, agencyMatch } from "./matching";

const actorProfile = {
  location: "Dallas, TX",
  experienceLevel: "emerging",
  preferredMediums: ["film", "television", "indie"],
  desiredMarkets: ["Dallas/Fort Worth", "Austin"],
  roleTypes: ["supporting", "lead"],
  compensationPref: "paid",
  productionTypePref: ["independent"],
  willingToTravel: true,
};

describe("careerFit", () => {
  it("prompts to complete profile when none exists", () => {
    const r = careerFit(null, {
      type: "film", location: "Austin", roleType: "lead", compensation: "paid",
    });
    expect(r.score).toBe(0);
  });

  it("scores a strong match highly", () => {
    const r = careerFit(actorProfile, {
      type: "film", location: "Dallas/Fort Worth", roleType: "supporting",
      compensation: "paid", productionType: "independent", experienceLevel: "emerging",
    });
    expect(r.score).toBeGreaterThanOrEqual(85);
  });

  it("scores a weak match lower than a strong one", () => {
    const strong = careerFit(actorProfile, {
      type: "film", location: "Dallas/Fort Worth", roleType: "supporting", compensation: "paid",
    }).score;
    const weak = careerFit(actorProfile, {
      type: "theater", location: "New York", roleType: "background", compensation: "unpaid",
    }).score;
    expect(weak).toBeLessThan(strong);
  });

  it("returns a breakdown row per dimension", () => {
    const r = careerFit(actorProfile, {
      type: "film", location: "Austin", roleType: "lead", compensation: "paid",
    });
    expect(r.rows.length).toBeGreaterThanOrEqual(5);
    expect(r.rows.some((row) => row.label === "Market match")).toBe(true);
  });

  it("does not fold risk into fit — a scam-shaped listing can still score well", () => {
    // A great career fit is independent of legitimacy; the UI shows risk separately.
    const r = careerFit(actorProfile, {
      type: "film", location: "Dallas/Fort Worth", roleType: "lead", compensation: "paid",
    });
    expect(r.score).toBeGreaterThan(60);
  });
});

describe("agencyMatch", () => {
  it("rates a same-market film/TV agency highly", () => {
    const r = agencyMatch(actorProfile, {
      location: "Dallas, TX",
      marketsServed: ["Dallas/Fort Worth"],
      representationSpecialties: ["film/tv", "commercial"],
      careerLevel: ["emerging"],
    });
    expect(r.score).toBeGreaterThanOrEqual(70);
  });

  it("rates a mismatched-market theater-only agency lower", () => {
    const good = agencyMatch(actorProfile, {
      location: "Dallas, TX", marketsServed: ["Dallas/Fort Worth"],
      representationSpecialties: ["film/tv"], careerLevel: ["emerging"],
    }).score;
    const poor = agencyMatch(actorProfile, {
      location: "New York, NY", marketsServed: ["New York"],
      representationSpecialties: ["theater"], careerLevel: ["professional"],
    }).score;
    expect(poor).toBeLessThan(good);
  });
});
