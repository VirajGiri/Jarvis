import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRuntime, startRuntime, stopRuntime } from "./index";
import { createTask } from "@jarvis/core";

describe("runtime restart recovery", () => {
  it("recovers a persisted task after a runtime restart", async () => {
    const dir = await mkdtemp(join(tmpdir(), "jarvis-runtime-"));
    const taskPath = join(dir, "tasks.json");
    const previousTaskStore = process.env.JARVIS_TASK_STORE;
    process.env.JARVIS_TASK_STORE = taskPath;

    try {
      const first = createRuntime();
      await startRuntime(first);
      const task = createTask("restart-recovery-1", "system");
      await first.taskStore.save(task);
      await first.orchestrator.submit(task);
      await stopRuntime(first);

      const second = createRuntime();
      await startRuntime(second);
      const result = await second.worker.process();

      expect(result?.taskId).toBe(task.id);
      expect(result?.success).toBe(true);
      await stopRuntime(second);
    } finally {
      if (previousTaskStore === undefined) delete process.env.JARVIS_TASK_STORE;
      else process.env.JARVIS_TASK_STORE = previousTaskStore;
      await rm(dir, { recursive: true, force: true });
    }
  });
});
