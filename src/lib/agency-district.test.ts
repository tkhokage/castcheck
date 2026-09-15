import { describe, expect, it } from "vitest";
import { districtAgency, districtPosition } from "./agency-district";
describe("district data boundary", () => {
  it("projects only public display fields and preserves uncertainty", () => {
    const record = { id: "a", name: "Agency", location: "Dallas", representationSpecialties: '["Film"]',
      verificationState: "needs_review", isDemo: true, lastVerifiedAt: null, privateNotes: "not for browser" };
    expect(districtAgency(record, null)).toEqual({id: "a", name: "Agency", location: "Dallas",
      specialties: ["Film"], verificationState: "needs_review", isDemo: true, lastVerifiedAt: null, matchScore: null});
  });
  it("serializes timestamps and preserves a zero fit score", () => {
    expect(districtAgency({id:"a", name:"A", location:"Remote", representationSpecialties: [],
      verificationState:"high_risk", isDemo:false, lastVerifiedAt:new Date("2026-01-01T00:00:00Z")}, 0))
      .toMatchObject({matchScore:0, verificationState:"high_risk", lastVerifiedAt:"2026-01-01T00:00:00.000Z"});
  });
  it("assigns 24 distinct bounded positions", () => {
    const positions = Array.from({length:24}, (_, i) => districtPosition(i));
    expect(new Set(positions.map(p => JSON.stringify(p))).size).toBe(24);
    expect(positions.every(([x,y,z]) => Math.abs(x) < 10 && y === 0 && Math.abs(z) < 8)).toBe(true);
  });
});
