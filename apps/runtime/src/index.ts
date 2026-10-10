import path from "node:path";
import { RuntimeCommandBridge } from "./command-bridge";
import { AgentRegistry, InMemoryEventBus, JsonFileTaskStore, Orchestrator, PriorityTaskQueue, RuntimeWorker, Supervisor, getSystemSnapshot, RuntimeEventHistory, createRuntimeEvent, getRuntimeHealth, JsonLogger, RuntimeFileBridge, loadRuntimeConfig, ApprovalManager, EmergencyStop, ToolGateway, DefaultPermissionPolicy, systemSnapshotTool, windowsProcessListTool, windowsNetworkSnapshotTool, windowsDiskSnapshotTool } from "@jarvis/core";
import { ResearchAgent, SystemAgent } from "@jarvis/agents";

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
  approvals: ApprovalManager;
  emergencyStop: EmergencyStop;
  toolGateway: ToolGateway;
  commandBridge: RuntimeCommandBridge;
}

export function createRuntime(): RuntimeHost {
  const config = loadRuntimeConfig();
  const eventBus = new InMemoryEventBus();
  const queue = new PriorityTaskQueue();
  const registry = new AgentRegistry();
  const orchestrator = new Orchestrator(registry, queue, eventBus);
  const supervisor = new Supervisor();
  const systemAgent = new SystemAgent(getSystemSnapshot);
  registry.register(systemAgent.descriptor, systemAgent);
  const researchAgent = new ResearchAgent();
  registry.register(researchAgent.descriptor, researchAgent);
  const taskStore = new JsonFileTaskStore(config.taskStorePath);
  const worker = new RuntimeWorker(orchestrator, taskStore, config.workerIntervalMs);
  const history = new RuntimeEventHistory();
  const logger = new JsonLogger("runtime");
  const fileBridge = new RuntimeFileBridge(config.runtimeStateDir);
  const approvals = new ApprovalManager();
  const emergencyStop = new EmergencyStop();
  const toolGateway = new ToolGateway(new DefaultPermissionPolicy(), approvals, emergencyStop);
  const commandBridge = new RuntimeCommandBridge(path.join(config.runtimeStateDir, "commands"), taskStore, orchestrator);
  for (const tool of [systemSnapshotTool, windowsProcessListTool, windowsNetworkSnapshotTool, windowsDiskSnapshotTool]) toolGateway.register(tool);

  for (const eventType of ["runtime.task.submitted", "runtime.task.completed", "runtime.agent.status", "runtime.status"]) {
    eventBus.subscribe(eventType, async (event) => {
      await history.append(event as any);
      await fileBridge.appendEvent(event as any);
      const status = { ...getRuntimeHealth(registry, orchestrator, worker), telemetry: await getSystemSnapshot() };
      await fileBridge.writeStatus(status);
    });
  }

  return { eventBus, queue, registry, orchestrator, supervisor, taskStore, worker, history, logger, fileBridge, approvals, emergencyStop, toolGateway, commandBridge };
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
