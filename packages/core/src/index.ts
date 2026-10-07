export { InMemoryEventBus } from "./event-bus";
export { PriorityTaskQueue } from "./task-queue";
export { AgentRegistry } from "./agent-registry";
export { Orchestrator } from "./orchestrator";
export { Supervisor } from "./supervisor";
export { DefaultPermissionPolicy, type PermissionPolicy, type ToolRequest } from "./permissions";
export { ToolGateway, type JarvisTool } from "./tool-gateway";
export { getSystemSnapshot, systemSnapshotTool, windowsProcessListTool, windowsDiskSnapshotTool, type SystemSnapshot } from "./system-tools";

export interface EventBus {
  publish(event: unknown): Promise<void>;
  subscribe(type: string, handler: (event: unknown) => Promise<void>): () => void;
}
export interface TaskQueue {
  enqueue(task: unknown): Promise<void>;
  dequeue(): Promise<unknown | undefined>;
}
export interface AgentRuntime {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export { InMemoryTaskStore, JsonFileTaskStore, createTask, type TaskStore } from "./task-store";
export { RuntimeWorker, type TaskProcessor } from "./worker-loop";

export { RUNTIME_EVENTS, createRuntimeEvent, publishTaskSubmitted, publishTaskCompleted, publishAgentStatus } from "./runtime-events";

export { RuntimeEventHistory } from "./runtime-history";

export { JsonLogger, type Logger, type LogLevel, type LogRecord } from "./logger";
export { getRuntimeHealth } from "./runtime-health";

export { ApprovalManager, requiresApproval, type ApprovalRequest } from "./approval-manager";
export { EmergencyStop } from "./emergency-stop";
