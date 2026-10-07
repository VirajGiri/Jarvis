import { AgentRegistry, InMemoryEventBus, Orchestrator, PriorityTaskQueue, Supervisor } from "@jarvis/core";

export interface RuntimeHost {
  eventBus: InMemoryEventBus;
  queue: PriorityTaskQueue;
  registry: AgentRegistry;
  orchestrator: Orchestrator;
  supervisor: Supervisor;
}

export function createRuntime(): RuntimeHost {
  const eventBus = new InMemoryEventBus();
  const queue = new PriorityTaskQueue();
  const registry = new AgentRegistry();
  const orchestrator = new Orchestrator(registry, queue);
  const supervisor = new Supervisor();

  return { eventBus, queue, registry, orchestrator, supervisor };
}

export async function startRuntime(runtime: RuntimeHost): Promise<void> {
  await runtime.registry.startAll();
  await runtime.supervisor.startAll();
}

export async function stopRuntime(runtime: RuntimeHost): Promise<void> {
  await runtime.supervisor.stopAll();
  await runtime.registry.stopAll();
}

export function getRuntimeStatus(runtime: RuntimeHost) {
  return {
    state: "RUNNING" as const,
    activeTasks: 0,
    queuedTasks: runtime.orchestrator.queueSize(),
    agents: runtime.registry.statuses(),
    updatedAt: new Date().toISOString()
  };
}
