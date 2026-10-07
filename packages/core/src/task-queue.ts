import type { AgentTask, TaskPriority } from "@jarvis/contracts";

const priorityRank: Record<TaskPriority, number> = {
  CRITICAL: 0, HIGH: 1, NORMAL: 2, LOW: 3, BACKGROUND: 4
};

export class PriorityTaskQueue {
  private readonly queue: AgentTask[] = [];

  async enqueue(task: AgentTask): Promise<void> {
    this.queue.push(task);
    this.queue.sort((a, b) =>
      priorityRank[a.priority] - priorityRank[b.priority] ||
      a.createdAt.localeCompare(b.createdAt)
    );
  }

  async dequeue(): Promise<AgentTask | undefined> {
    return this.queue.shift();
  }

  size(): number {
    return this.queue.length;
  }
}
