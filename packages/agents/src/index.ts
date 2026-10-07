import type { AgentDescriptor, AgentResult, AgentStatus, AgentTask } from "@jarvis/contracts";

export interface JarvisAgent {
  readonly id: string;
  readonly name: string;
  readonly descriptor: AgentDescriptor;
  start(): Promise<void>;
  stop(): Promise<void>;
  execute(task: AgentTask): Promise<AgentResult>;
  status(): AgentStatus;
}

export abstract class BaseAgent implements JarvisAgent {
  protected state: AgentStatus["state"] = "REGISTERED";
  protected lastTaskId?: string;

  readonly descriptor: AgentDescriptor;

  constructor(
    readonly id: string,
    readonly name: string,
    capabilities: string[] = []
  ) {
    this.descriptor = { id, name, version: "0.1.0", capabilities };
  }

  async start(): Promise<void> {
    this.state = "IDLE";
  }

  async stop(): Promise<void> {
    this.state = "PAUSED";
  }

  status(): AgentStatus {
    return {
      agentId: this.id,
      state: this.state,
      lastTaskId: this.lastTaskId,
      updatedAt: new Date().toISOString()
    };
  }

  protected begin(taskId: string): void {
    this.lastTaskId = taskId;
    this.state = "THINKING";
  }

  protected executing(): void {
    this.state = "EXECUTING";
  }

  protected complete(): void {
    this.state = "COMPLETED";
  }

  protected fail(): void {
    this.state = "FAILED";
  }

  abstract execute(task: AgentTask): Promise<AgentResult>;
}
