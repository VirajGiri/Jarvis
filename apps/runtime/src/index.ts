import { AgentRegistry, InMemoryEventBus, JsonFileTaskStore, Orchestrator, PriorityTaskQueue, RuntimeWorker, Supervisor, getSystemSnapshot, RuntimeEventHistory, createRuntimeEvent, getRuntimeHealth, JsonLogger, RuntimeFileBridge } from "@jarvis/core";
import { SystemAgent } from "@jarvis/agents";

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
  fileBridge: RuntimeFileBridge;
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
  const fileBridge = new RuntimeFileBridge();
  for (const eventType of ["runtime.task.submitted", "runtime.task.completed", "runtime.agent.status", "runtime.status"]) {
    eventBus.subscribe(eventType, async (event) => {\n      await history.append(event as any);\n      await fileBridge.appendEvent(event as any);\n      await fileBridge.writeStatus(getRuntimeHealth(registry, orchestrator, worker));\n    });
  }
  return { eventBus, queue, registry, orchestrator, supervisor, taskStore, worker, history, logger, fileBridge };
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
}
