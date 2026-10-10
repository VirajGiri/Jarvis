import type { AgentTask, TaskPriority } from "@jarvis/contracts";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";

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
  constructor(private readonly filePath: string) {}

  private async read(): Promise<AgentTask[]> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("TASK_STORE_INVALID_FORMAT");
      return parsed as AgentTask[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  private async write(tasks: AgentTask[]): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const tempPath = this.filePath + ".tmp";
    await writeFile(tempPath, JSON.stringify(tasks, null, 2), "utf8");
    await rename(tempPath, this.filePath);
  }

  async save(task: AgentTask): Promise<void> {
    const tasks = await this.read();
    await this.write([...tasks.filter((item) => item.id !== task.id), task]);
  }

  async remove(taskId: string): Promise<void> {
    const tasks = await this.read();
    await this.write(tasks.filter((item) => item.id !== taskId));
  }

  async list(): Promise<AgentTask[]> { return this.read(); }
  async clear(): Promise<void> { await this.write([]); }
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
