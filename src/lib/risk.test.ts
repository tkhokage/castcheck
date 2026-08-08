import { describe, it, expect } from "vitest";
import { riskScore, riskLevel, deriveVerificationState } from "./risk";

describe("riskScore", () => {
  it("multiplies likelihood by impact", () => {
    expect(riskScore(4, 5)).toBe(20);
    expect(riskScore(1, 1)).toBe(1);
  });
});

describe("riskLevel", () => {
  it("maps scores to levels at the spec thresholds", () => {
    expect(riskLevel(1)).toBe("low");
    expect(riskLevel(4)).toBe("low");
    expect(riskLevel(5)).toBe("moderate");
    expect(riskLevel(9)).toBe("moderate");
    expect(riskLevel(10)).toBe("high");
    expect(riskLevel(16)).toBe("high");
    expect(riskLevel(17)).toBe("critical");
    expect(riskLevel(25)).toBe("critical");
  });
});

describe("deriveVerificationState", () => {
  it("is verified only when every check passes", () => {
    const checks = [{ status: "pass" }, { status: "pass" }, { status: "pass" }];
    expect(deriveVerificationState(checks).state).toBe("verified");
  });

  it("never returns verified with a warn present", () => {
    const checks = [{ status: "pass" }, { status: "warn" }, { status: "pass" }];
    expect(deriveVerificationState(checks).state).not.toBe("verified");
  });

  it("flags on a single failure", () => {
    const checks = [{ status: "pass" }, { status: "fail" }];
    expect(deriveVerificationState(checks).state).toBe("flagged");
  });

  it("is high_risk on two or more failures", () => {
    const checks = [{ status: "fail" }, { status: "fail" }, { status: "pass" }];
    expect(deriveVerificationState(checks).state).toBe("high_risk");
  });

  it("is high_risk when high-risk indicators are present regardless of checks", () => {
    const checks = [{ status: "pass" }, { status: "pass" }];
    expect(deriveVerificationState(checks, true).state).toBe("high_risk");
  });

  it("reports passed/total counts", () => {
    const checks = [{ status: "pass" }, { status: "warn" }, { status: "pass" }];
    const r = deriveVerificationState(checks);
    expect(r.passed).toBe(2);
    expect(r.total).toBe(3);
  });
});
