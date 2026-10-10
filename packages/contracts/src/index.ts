export type AgentState =
  | "REGISTERED" | "IDLE" | "THINKING" | "EXECUTING"
  | "VALIDATING" | "COMPLETED" | "FAILED" | "PAUSED" | "CANCELLED";

export type TaskPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW" | "BACKGROUND";

export interface AgentDescriptor {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
}

export interface AgentTask {
  id: string;
  type: string;
  priority: TaskPriority;
  input: Record<string, unknown>;
  createdAt: string;
  parentTaskId?: string;
  requiresApproval?: boolean;
}

export interface AgentStatus {
  agentId: string;
  state: AgentState;
  lastTaskId?: string;
  updatedAt: string;
}

export interface AgentResult {
  taskId: string;
  success: boolean;
  output?: unknown;
  error?: { code: string; message: string };
  completedAt: string;
}

export interface RuntimeStatus {
  state: "STARTING" | "RUNNING" | "DEGRADED" | "STOPPING" | "STOPPED";
  activeTasks: number;
  queuedTasks: number;
  agents: AgentStatus[];
  updatedAt: string;
}

export interface JarvisEvent {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  payload: Record<string, unknown>;
}
