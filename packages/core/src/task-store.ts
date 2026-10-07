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

export class JsonFileTaskStore implements TaskStore {
  private readonly fallback = new InMemoryTaskStore();

  constructor(private readonly filePath: string) {}

  private async read(): Promise<AgentTask[]> {
    try {
      const fs = await import("node:fs/promises");
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed as AgentTask[] : [];
    } catch {
      return this.fallback.list();
    }
  }

  private async write(tasks: AgentTask[]): Promise<void> {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(tasks, null, 2), "utf8");
  }

  async save(task: AgentTask): Promise<void> {
    const tasks = await this.read();
    const next = tasks.filter((item) => item.id !== task.id);
    next.push(task);
    await this.write(next);
  }

  async remove(taskId: string): Promise<void> {
    const tasks = await this.read();
    await this.write(tasks.filter((item) => item.id !== taskId));
  }

  async list(): Promise<AgentTask[]> {
    return this.read();
  }

  async clear(): Promise<void> {
    await this.write([]);
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
