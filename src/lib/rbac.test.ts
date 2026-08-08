import { describe, it, expect } from "vitest";
import { can, isStaff } from "./rbac";

describe("can", () => {
  it("lets moderators moderate but not actors", () => {
    expect(can("moderator", "opportunity.moderate")).toBe(true);
    expect(can("actor", "opportunity.moderate")).toBe(false);
  });

  it("restricts admin management to admins", () => {
    expect(can("admin", "admin.manage")).toBe(true);
    expect(can("grc", "admin.manage")).toBe(false);
    expect(can("support", "admin.manage")).toBe(false);
  });

  it("lets casting and agency create opportunities", () => {
    expect(can("casting", "opportunity.create")).toBe(true);
    expect(can("agency", "opportunity.create")).toBe(true);
    expect(can("actor", "opportunity.create")).toBe(false);
  });

  it("returns false for null/undefined roles", () => {
    expect(can(null, "grc.view")).toBe(false);
    expect(can(undefined, "grc.view")).toBe(false);
  });
});

describe("isStaff", () => {
  it("recognizes staff roles", () => {
    for (const r of ["moderator", "support", "grc", "admin"] as const) {
      expect(isStaff(r)).toBe(true);
    }
  });
  it("excludes non-staff", () => {
    for (const r of ["actor", "casting", "agency"] as const) {
      expect(isStaff(r)).toBe(false);
    }
    expect(isStaff(null)).toBe(false);
  });
});
