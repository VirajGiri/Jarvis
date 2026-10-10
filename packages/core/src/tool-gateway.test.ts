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
  it("executes a privileged tool only after explicit approval", async () => {
    const approvals = new ApprovalManager();
    const gateway = new ToolGateway(new DefaultPermissionPolicy(), approvals);
    let executions = 0;
    gateway.register({
      id: "test.write",
      risk: "WRITE",
      async execute() { executions += 1; return { changed: true }; }
    });
    let approvalId = "";
    try {
      await gateway.execute({ tool: "test.write", risk: "WRITE", input: {}, reason: "user requested change" });
    } catch (error) {
      const match = String(error).match(/APPROVAL_REQUIRED: ([a-f0-9-]+)/i);
      approvalId = match?.[1] ?? "";
    }
    expect(approvalId).not.toBe("");
    expect(executions).toBe(0);
    const result = await gateway.resolveApproval(approvalId, "APPROVE") as { output: { changed: boolean } };
    expect(result.output.changed).toBe(true);
    expect(executions).toBe(1);
  });

  it("does not execute a denied privileged tool", async () => {
    const approvals = new ApprovalManager();
    const gateway = new ToolGateway(new DefaultPermissionPolicy(), approvals);
    let executions = 0;
    gateway.register({ id: "test.write", risk: "WRITE", async execute() { executions += 1; } });
    let approvalId = "";
    try {
      await gateway.execute({ tool: "test.write", risk: "WRITE", input: {}, reason: "test denial" });
    } catch (error) {
      approvalId = String(error).split("APPROVAL_REQUIRED: ")[1] ?? "";
    }
    await gateway.resolveApproval(approvalId, "DENY");
    expect(executions).toBe(0);
    expect(approvals.listPending()).toHaveLength(0);
  });

});
