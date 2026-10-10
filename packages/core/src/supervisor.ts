export interface Worker {
  id: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  health(): Promise<"healthy" | "degraded" | "failed">;
}

export class Supervisor {
  private readonly workers = new Map<string, Worker>();

  register(worker: Worker): void {
    this.workers.set(worker.id, worker);
  }

  async startAll(): Promise<void> {
    await Promise.all([...this.workers.values()].map((worker) => worker.start()));
  }

  async health(): Promise<Record<string, string>> {
    const entries = await Promise.all(
      [...this.workers.values()].map(async (worker) => [worker.id, await worker.health()] as const)
    );
    return Object.fromEntries(entries);
  }

  async stopAll(): Promise<void> {
    await Promise.all([...this.workers.values()].map((worker) => worker.stop()));
  }
}
