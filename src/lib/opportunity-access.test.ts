import { describe, expect, it } from "vitest";
import { canReadOpportunity } from "./opportunity-access";
describe("private opportunity boundary", () => {
  it.each(["imported", "draft", "rejected"])("hides %s records from anonymous and unrelated users", status => {
    const opp = { status, createdById: "owner" };
    expect(canReadOpportunity(opp, null)).toBe(false);
    expect(canReadOpportunity(opp, { id: "other", role: "actor" })).toBe(false);
    expect(canReadOpportunity(opp, { id: "owner", role: "actor" })).toBe(true);
  });
  it("does not treat missing creator and anonymous user as ownership", () => expect(canReadOpportunity({ status: "draft", createdById: null }, null)).toBe(false));
  it("keeps published and flagged records readable", () => {
    expect(canReadOpportunity({ status: "published", createdById: null }, null)).toBe(true);
    expect(canReadOpportunity({ status: "flagged", createdById: null }, null)).toBe(true);
  });
});
