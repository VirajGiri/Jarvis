import { describe, expect, it } from "vitest";
import { loadRuntimeConfig } from "./config";

describe("runtime config", () => {
  it("loads stable defaults", () => {
    expect(loadRuntimeConfig({})).toEqual({
      version: 1,
      taskStorePath: "./.jarvis/tasks.json",
      runtimeStateDir: "./.jarvis",
      workerIntervalMs: 250
    });
  });

  it("accepts configured paths and a positive worker interval", () => {
    const config = loadRuntimeConfig({
      JARVIS_TASK_STORE: "data/tasks.json",
      JARVIS_RUNTIME_STATE_DIR: "data/runtime",
      JARVIS_WORKER_INTERVAL_MS: "500"
    });
    expect(config.taskStorePath).toBe("data/tasks.json");
    expect(config.runtimeStateDir).toBe("data/runtime");
    expect(config.workerIntervalMs).toBe(500);
  });
});
