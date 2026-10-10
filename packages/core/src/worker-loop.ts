import type { AgentResult } from "@jarvis/contracts";
import { Orchestrator } from "./orchestrator";
import { TaskStore } from "./task-store";

export interface TaskProcessor {
  process(): Promise<AgentResult | undefined>;
}

export class RuntimeWorker implements TaskProcessor {
  private running = false;
  private processing = false;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly orchestrator: Orchestrator,
    private readonly store: TaskStore,
    private readonly intervalMs = 250
  ) {}

  async process(): Promise<AgentResult | undefined> {
    if (this.processing) return undefined;
    this.processing = true;
    try {
      const result = await this.orchestrator.runNext();
      if (result) await this.store.remove(result.taskId);
      return result;
    } finally {
      this.processing = false;
    }
  }

  async start(): Promise<void> {
    if (this.running) return;
    await this.orchestrator.recover(await this.store.list());
    this.running = true;
    this.timer = setTimeout(() => void this.tick(), this.intervalMs);
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
  }

  isRunning(): boolean {
    return this.running;
  }

  isProcessing(): boolean {
    return this.processing;
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
