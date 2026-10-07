import { describe, expect, it } from "vitest";
import { ApprovalManager } from "./approval-manager";
import { EmergencyStop } from "./emergency-stop";
import { ToolGateway } from "./tool-gateway";
import { DefaultPermissionPolicy } from "./permissions";

describe("ToolGateway safety controls", () => {
  it("creates an approval instead of executing privileged tools", async () => {
    const approvals = new ApprovalManager();
    const gateway = new ToolGateway(new DefaultPermissionPolicy(), approvals);
    gateway.register({
      id: "test.write",
      risk: "WRITE",
      async execute() { return "executed"; }
    });

    await expect(gateway.execute({
      tool: "test.write",
      risk: "WRITE",
      input: {},
      reason: "test"
    })).rejects.toThrow(/^APPROVAL_REQUIRED:/);

    expect(approvals.listPending()).toHaveLength(1);
  });

  it("blocks every tool while emergency stop is active", async () => {
    const stop = new EmergencyStop();
    stop.activate();
    const gateway = new ToolGateway(new DefaultPermissionPolicy(), new ApprovalManager(), stop);
    gateway.register({
      id: "test.read",
      risk: "READ",
      async execute() { return "executed"; }
    });

    await expect(gateway.execute({
      tool: "test.read",
      risk: "READ",
      input: {},
      reason: "test"
    })).rejects.toThrow("EMERGENCY_STOP_ACTIVE");
  });
});
