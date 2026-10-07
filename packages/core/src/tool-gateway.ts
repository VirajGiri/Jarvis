import type { PermissionPolicy, ToolRequest } from "./permissions";

export interface JarvisTool<TInput = Record<string, unknown>, TOutput = unknown> {
  readonly id: string;
  readonly risk: ToolRequest["risk"];
  execute(input: TInput): Promise<TOutput>;
}

export class ToolGateway {
  private readonly tools = new Map<string, JarvisTool>();

  constructor(private readonly policy: PermissionPolicy) {}

  register(tool: JarvisTool): void {
    this.tools.set(tool.id, tool);
  }

  async execute(request: ToolRequest): Promise<unknown> {
    const tool = this.tools.get(request.tool);
    if (!tool) throw new Error(`TOOL_NOT_FOUND: ${request.tool}`);
    if (tool.risk !== request.risk) throw new Error(`TOOL_RISK_MISMATCH: ${request.tool}`);

    const decision = this.policy.decide(request);
    if (decision !== "ALLOW") {
      throw new Error(`PERMISSION_${decision}: ${request.tool}`);
    }
    return tool.execute(request.input);
  }
}
