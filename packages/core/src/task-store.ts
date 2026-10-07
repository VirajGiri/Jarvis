import type { AgentTask, TaskPriority } from "@jarvis/contracts";

export interface TaskStore {
  save(task: AgentTask): Promise<void>;
  remove(taskId: string): Promise<void>;
  list(): Promise<AgentTask[]>;
  clear(): Promise<void>;
}

export class InMemoryTaskStore implements TaskStore {
  private readonly tasks = new Map<string, AgentTask>();

  async save(task: AgentTask): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async remove(taskId: string): Promise<void> {
    this.tasks.delete(taskId);
  }

  async list(): Promise<AgentTask[]> {
    return [...this.tasks.values()];
  }

  async clear(): Promise<void> {
    this.tasks.clear();
  }
}

export function createTask(
  id: string,
  type: string,
  input: Record<string, unknown> = {},
  priority: TaskPriority = "NORMAL"
): AgentTask {
  return {
    id,
    type,
    priority,
    input,
    createdAt: new Date().toISOString()
  };
}
