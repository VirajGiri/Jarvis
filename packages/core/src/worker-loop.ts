import type { AgentResult } from "@jarvis/contracts";
import { Orchestrator } from "./orchestrator";
import { TaskStore } from "./task-store";

export interface TaskProcessor {
  process(): Promise<AgentResult | undefined>;
}

export class RuntimeWorker implements TaskProcessor {
  private running = false;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly orchestrator: Orchestrator,
    private readonly store: TaskStore,
    private readonly intervalMs = 250
  ) {}

  async process(): Promise<AgentResult | undefined> {
    const result = await this.orchestrator.runNext();
    if (result) await this.store.remove(result.taskId);
    return result;
  }

  async start(): Promise<void> {
    if (this.running) return;
    await this.orchestrator.recover(await this.store.list());
    this.running = true;
    void this.tick();
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
  }

  isRunning(): boolean {
    return this.running;
  }

  private async tick(): Promise<void> {
    if (!this.running) return;

    try {
      await this.process();
    } finally {
      if (this.running) this.timer = setTimeout(() => void this.tick(), this.intervalMs);
    }
  }
}
