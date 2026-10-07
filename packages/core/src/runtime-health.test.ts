import { describe, expect, it } from "vitest";
import { getRuntimeHealth } from "./runtime-health";
import { AgentRegistry } from "./agent-registry";
import { PriorityTaskQueue } from "./task-queue";
import { Orchestrator } from "./orchestrator";
import { RuntimeWorker } from "./worker-loop";
import { InMemoryTaskStore } from "./task-store";

describe("runtime health", () => {
  it("reports stopped before the worker starts", () => {
    const registry = new AgentRegistry();
    const queue = new PriorityTaskQueue();
    const orchestrator = new Orchestrator(registry, queue);
    const worker = new RuntimeWorker(orchestrator, new InMemoryTaskStore());
    expect(getRuntimeHealth(registry, orchestrator, worker).state).toBe("STOPPED");
  });
});
