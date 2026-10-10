import type { PermissionPolicy, ToolRequest } from "./permissions";
import { ApprovalManager } from "./approval-manager";
import { EmergencyStop } from "./emergency-stop";

export interface JarvisTool<TInput = Record<string, unknown>, TOutput = unknown> {
  readonly id: string;
  readonly risk: ToolRequest["risk"];
  execute(input: TInput): Promise<TOutput>;
}

export class ToolGateway {
  private readonly tools = new Map<string, JarvisTool>();

  constructor(
    private readonly policy: PermissionPolicy,
    private readonly approvals = new ApprovalManager(),
    private readonly emergencyStop = new EmergencyStop()
  ) {}

  register(tool: JarvisTool): void {
    this.tools.set(tool.id, tool);
  }

  async resolveApproval(id: string, decision: "APPROVE" | "DENY"): Promise<unknown> {
    const approval = this.approvals.get(id);
    if (!approval) throw new Error(`APPROVAL_NOT_FOUND: ${id}`);
    if (approval.status !== "PENDING") throw new Error(`APPROVAL_NOT_PENDING: ${id}`);
    if (decision === "DENY") return this.approvals.deny(id);

    this.emergencyStop.assertRunning();
    const request = approval.request;
    const tool = this.tools.get(request.tool);
    if (!tool) throw new Error(`TOOL_NOT_FOUND: ${request.tool}`);
    if (tool.risk !== request.risk) throw new Error(`TOOL_RISK_MISMATCH: ${request.tool}`);
    const resolved = this.approvals.approve(id);
    const output = await tool.execute(request.input);
    return { approval: resolved, output };
  }

  async execute(request: ToolRequest): Promise<unknown> {
    this.emergencyStop.assertRunning();
    const tool = this.tools.get(request.tool);
    if (!tool) throw new Error(`TOOL_NOT_FOUND: ${request.tool}`);
    if (tool.risk !== request.risk) throw new Error(`TOOL_RISK_MISMATCH: ${request.tool}`);

    const decision = this.policy.decide(request);
    if (decision === "DENY") {
      throw new Error(`PERMISSION_DENY: ${request.tool}`);
    }
    if (decision === "APPROVAL_REQUIRED") {
      const approval = this.approvals.create(request);
      throw new Error(`APPROVAL_REQUIRED: ${approval.id}`);
    }
    return tool.execute(request.input);
  }
}
