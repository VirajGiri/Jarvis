import type { PermissionDecision, PermissionRisk, ToolRequest } from "./permissions";

export interface ApprovalRequest {
  id: string;
  request: ToolRequest;
  createdAt: string;
  status: "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";
}

export class ApprovalManager {
  private readonly requests = new Map<string, ApprovalRequest>();

  create(request: ToolRequest): ApprovalRequest {
    const item: ApprovalRequest = {
      id: crypto.randomUUID(),
      request,
      createdAt: new Date().toISOString(),
      status: "PENDING"
    };
    this.requests.set(item.id, item);
    return item;
  }

  approve(id: string): ApprovalRequest {
    return this.transition(id, "APPROVED");
  }

  deny(id: string): ApprovalRequest {
    return this.transition(id, "DENIED");
  }

  get(id: string): ApprovalRequest | undefined {
    return this.requests.get(id);
  }

  listPending(): ApprovalRequest[] {
    return [...this.requests.values()].filter((item) => item.status === "PENDING");
  }

  private transition(id: string, status: ApprovalRequest["status"]): ApprovalRequest {
    const item = this.requests.get(id);
    if (!item) throw new Error(`APPROVAL_NOT_FOUND: ${id}`);
    if (item.status !== "PENDING") throw new Error(`APPROVAL_NOT_PENDING: ${id}`);
    const updated = { ...item, status };
    this.requests.set(id, updated);
    return updated;
  }
}

export function requiresApproval(risk: PermissionRisk): boolean {
  return risk !== "READ";
}
