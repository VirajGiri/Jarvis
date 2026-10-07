import { describe, expect, it } from "vitest";
import { createRuntime, startRuntime, stopRuntime, getRuntimeStatus } from "./index";
import { createTask } from "@jarvis/core";

describe("runtime integration", () => {
  it("executes a system task through the runtime worker", async () => {
    const runtime = createRuntime();
    await startRuntime(runtime);

    const task = createTask("integration-system-1", "system");
    await runtime.taskStore.save(task);
    await runtime.orchestrator.submit(task);

    const result = await runtime.worker.process();

    expect(result?.success).toBe(true);
    expect(result?.taskId).toBe(task.id);
    expect(runtime.history.size()).toBeGreaterThan(0);\n    expect(runtime.history.list().some((event) => event.type === "runtime.agent.status")).toBe(true);

    await stopRuntime(runtime);
    expect(getRuntimeStatus(runtime).state).toBe("STOPPED");
  });
});
