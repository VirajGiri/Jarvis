import type { AgentTask, AgentResult } from "@jarvis/contracts";
import { AgentRegistry } from "./agent-registry";
import { PriorityTaskQueue } from "./task-queue";
import { InMemoryEventBus } from "./event-bus";
import { publishAgentStatus, publishTaskCompleted, publishTaskSubmitted } from "./runtime-events";

export class Orchestrator {
  constructor(
    private readonly registry: AgentRegistry,
    private readonly queue: PriorityTaskQueue,
    private readonly events?: InMemoryEventBus
  ) {}

  async submit(task: AgentTask): Promise<void> {
    await this.queue.enqueue(task);
    if (this.events) await publishTaskSubmitted(this.events, task);
  }

  async recover(tasks: AgentTask[]): Promise<void> {
    for (const task of tasks) await this.queue.enqueue(task);
  }

  async runNext(): Promise<AgentResult | undefined> {
    const task = await this.queue.dequeue();
    if (!task) return undefined;

    const agent = this.registry.get(task.type);
    if (!agent) {
      const result = {
        taskId: task.id,
        success: false,
        error: { code: "AGENT_NOT_FOUND", message: `No agent registered for task type: ${task.type}` },
        completedAt: new Date().toISOString()
      };
      if (this.events) await publishTaskCompleted(this.events, result);
      return result;
    }

    try {
      const output = await agent.execute(task);
      const result = { taskId: task.id, success: true, output, completedAt: new Date().toISOString() };
      if (this.events) {
        await publishAgentStatus(this.events, agent.status());
        await publishTaskCompleted(this.events, result);
      }
      return result;
    } catch (error) {
      const result = {
        taskId: task.id,
        success: false,
        error: { code: "AGENT_EXECUTION_FAILED", message: error instanceof Error ? error.message : String(error) },
        completedAt: new Date().toISOString()
      };
      if (this.events) {
        await publishAgentStatus(this.events, agent.status());
        await publishTaskCompleted(this.events, result);
      }
      return result;
    }
  }

  queueSize(): number {
    return this.queue.size();
  }
}
