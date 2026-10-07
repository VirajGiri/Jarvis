import { AgentRegistry, InMemoryEventBus, InMemoryTaskStore, Orchestrator, PriorityTaskQueue, RuntimeWorker, Supervisor, getSystemSnapshot } from "@jarvis/core";
import { SystemAgent } from "@jarvis/agents";
import { RuntimeEventHistory } from "@jarvis/core";

export interface RuntimeHost {
  eventBus: InMemoryEventBus;
  queue: PriorityTaskQueue;
  registry: AgentRegistry;
  orchestrator: Orchestrator;
  supervisor: Supervisor;
  taskStore: InMemoryTaskStore;
  worker: RuntimeWorker;
  history: RuntimeEventHistory;
}

export function createRuntime(): RuntimeHost {
  const eventBus = new InMemoryEventBus();
  const queue = new PriorityTaskQueue();
  const registry = new AgentRegistry();
  const orchestrator = new Orchestrator(registry, queue, eventBus);
  const supervisor = new Supervisor();
  const systemAgent = new SystemAgent(getSystemSnapshot);
  registry.register(systemAgent.descriptor, systemAgent);
  const taskStore = new InMemoryTaskStore();
  const worker = new RuntimeWorker(orchestrator, taskStore);
  const history = new RuntimeEventHistory();
  eventBus.subscribe("runtime.task.submitted", (event) => history.append(event as any));
  eventBus.subscribe("runtime.task.completed", (event) => history.append(event as any));
  eventBus.subscribe("runtime.agent.status", (event) => history.append(event as any));
  eventBus.subscribe("runtime.status", (event) => history.append(event as any));

  return { eventBus, queue, registry, orchestrator, supervisor, taskStore, worker, history };
}

export async function startRuntime(runtime: RuntimeHost): Promise<void> {
  await runtime.registry.startAll();
  await runtime.supervisor.startAll();
  await runtime.worker.start();
}

export async function stopRuntime(runtime: RuntimeHost): Promise<void> {
  await runtime.worker.stop();
  await runtime.supervisor.stopAll();
  await runtime.registry.stopAll();
}

export function getRuntimeStatus(runtime: RuntimeHost) {
  return {
    state: runtime.worker.isRunning() ? ("RUNNING" as const) : ("STOPPED" as const),
    activeTasks: 0,
    queuedTasks: runtime.orchestrator.queueSize(),
    agents: runtime.registry.statuses(),
    updatedAt: new Date().toISOString()
  };
}
