import { AgentRegistry, InMemoryEventBus, JsonFileTaskStore, Orchestrator, PriorityTaskQueue, RuntimeWorker, Supervisor, getSystemSnapshot, RuntimeEventHistory, createRuntimeEvent, getRuntimeHealth, JsonLogger } from "@jarvis/core";
import { SystemAgent } from "@jarvis/agents";
import { RuntimeEventHistory } from "@jarvis/core";

export interface RuntimeHost {
  eventBus: InMemoryEventBus;
  queue: PriorityTaskQueue;
  registry: AgentRegistry;
  orchestrator: Orchestrator;
  supervisor: Supervisor;
  taskStore: JsonFileTaskStore;
  worker: RuntimeWorker;
  history: RuntimeEventHistory;
  logger: JsonLogger;
}

export function createRuntime(): RuntimeHost {
  const eventBus = new InMemoryEventBus();
  const queue = new PriorityTaskQueue();
  const registry = new AgentRegistry();
  const orchestrator = new Orchestrator(registry, queue, eventBus);
  const supervisor = new Supervisor();
  const systemAgent = new SystemAgent(getSystemSnapshot);
  registry.register(systemAgent.descriptor, systemAgent);
  const taskStore = new JsonFileTaskStore(process.env.JARVIS_TASK_STORE ?? "./.jarvis/tasks.json");
  const worker = new RuntimeWorker(orchestrator, taskStore);
  const history = new RuntimeEventHistory();
  const logger = new JsonLogger("runtime");
  eventBus.subscribe("runtime.task.submitted", (event) => history.append(event as any));
  eventBus.subscribe("runtime.task.completed", (event) => history.append(event as any));
  eventBus.subscribe("runtime.agent.status", (event) => history.append(event as any));
  eventBus.subscribe("runtime.status", (event) => history.append(event as any));

  return { eventBus, queue, registry, orchestrator, supervisor, taskStore, worker, history, logger };
}

export async function startRuntime(runtime: RuntimeHost): Promise<void> {
  await runtime.eventBus.publish(createRuntimeEvent("runtime.status", "runtime", { state: "STARTING" }));
  await runtime.registry.startAll();
  await runtime.supervisor.startAll();
  await runtime.worker.start();
  await runtime.eventBus.publish(createRuntimeEvent("runtime.status", "runtime", { state: "RUNNING" }));
}

export async function stopRuntime(runtime: RuntimeHost): Promise<void> {
  await runtime.eventBus.publish(createRuntimeEvent("runtime.status", "runtime", { state: "STOPPING" }));
  await runtime.worker.stop();
  await runtime.supervisor.stopAll();
  await runtime.registry.stopAll();
  await runtime.eventBus.publish(createRuntimeEvent("runtime.status", "runtime", { state: "STOPPED" }));
}

export function getRuntimeStatus(runtime: RuntimeHost) {
  return getRuntimeHealth(runtime.registry, runtime.orchestrator, runtime.worker);
    activeTasks: 0,
    queuedTasks: runtime.orchestrator.queueSize(),
    agents: runtime.registry.statuses(),
    updatedAt: new Date().toISOString()
  };
}
