import type { AgentTask, AgentResult } from "@jarvis/contracts";
import { AgentRegistry } from "./agent-registry";
import { PriorityTaskQueue } from "./task-queue";

export class Orchestrator {
  constructor(
    private readonly registry: AgentRegistry,
    private readonly queue: PriorityTaskQueue
  ) {}

  async submit(task: AgentTask): Promise<void> {
    await this.queue.enqueue(task);
  }

  async runNext(): Promise<AgentResult | undefined> {
    const task = await this.queue.dequeue();
    if (!task) return undefined;

    const agent = this.registry.get(task.type);
    if (!agent) {
      return {
        taskId: task.id,
        success: false,
        error: { code: "AGENT_NOT_FOUND", message: `No agent registered for task type: ${task.type}` },
        completedAt: new Date().toISOString()
      };
    }

    try {
      const output = await agent.execute(task);
      return { taskId: task.id, success: true, output, completedAt: new Date().toISOString() };
    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        error: { code: "AGENT_EXECUTION_FAILED", message: error instanceof Error ? error.message : String(error) },
        completedAt: new Date().toISOString()
      };
    }
  }

  queueSize(): number {
    return this.queue.size();
  }
}
