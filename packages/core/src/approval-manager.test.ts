import { describe, expect, it } from "vitest";
import { ApprovalManager } from "./approval-manager";

describe("ApprovalManager", () => {
  it("tracks approval decisions", () => {
    const manager = new ApprovalManager();
    const request = manager.create({
      tool: "system.shutdown",
      risk: "SYSTEM",
      input: {},
      reason: "test"
    });

    expect(manager.listPending()).toHaveLength(1);
    expect(manager.approve(request.id).status).toBe("APPROVED");
    expect(manager.listPending()).toHaveLength(0);
  });
});
