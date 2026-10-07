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
  const orchestrator = new Orchestrator(queue, registry);
  const supervisor = new Supervisor();

  return { eventBus, queue, registry, orchestrator, supervisor };
}
