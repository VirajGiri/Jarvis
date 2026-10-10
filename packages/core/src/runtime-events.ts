import type { AgentResult, AgentStatus, AgentTask, JarvisEvent } from "@jarvis/contracts";
import type { InMemoryEventBus } from "./event-bus";

export const RUNTIME_EVENTS = {
  TASK_SUBMITTED: "runtime.task.submitted",
  TASK_COMPLETED: "runtime.task.completed",
  AGENT_STATUS: "runtime.agent.status",
  RUNTIME_STATUS: "runtime.status"
} as const;

export function createRuntimeEvent(type: string, source: string, payload: Record<string, unknown>): JarvisEvent {
  return { id: crypto.randomUUID(), type, source, timestamp: new Date().toISOString(), payload };
}

export async function publishTaskSubmitted(bus: InMemoryEventBus, task: AgentTask): Promise<void> {
  await bus.publish(createRuntimeEvent(RUNTIME_EVENTS.TASK_SUBMITTED, "orchestrator", { task }));
}

export async function publishTaskCompleted(bus: InMemoryEventBus, result: AgentResult): Promise<void> {
  await bus.publish(createRuntimeEvent(RUNTIME_EVENTS.TASK_COMPLETED, "orchestrator", { result }));
}

export async function publishAgentStatus(bus: InMemoryEventBus, status: AgentStatus): Promise<void> {
  await bus.publish(createRuntimeEvent(RUNTIME_EVENTS.AGENT_STATUS, status.agentId, { status }));
}
