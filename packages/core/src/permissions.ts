export type PermissionRisk = "READ" | "WRITE" | "EXTERNAL" | "SYSTEM";

export interface ToolRequest {
  tool: string;
  risk: PermissionRisk;
  input: Record<string, unknown>;
  reason: string;
}

export type PermissionDecision = "ALLOW" | "DENY" | "APPROVAL_REQUIRED";

export interface PermissionPolicy {
  decide(request: ToolRequest): PermissionDecision;
}

export class DefaultPermissionPolicy implements PermissionPolicy {
  decide(request: ToolRequest): PermissionDecision {
    if (request.risk === "READ") return "ALLOW";
    return "APPROVAL_REQUIRED";
  }
}
