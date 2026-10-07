import { describe, expect, it } from "vitest";
import { createRuntime, getRuntimeStatus, startRuntime, stopRuntime } from "./index";

describe("runtime host", () => {
  it("starts with a registered system agent and worker", async () => {
    const runtime = createRuntime();
    expect(runtime.registry.list().map((agent) => agent.id)).toContain("system");

    await startRuntime(runtime);
    expect(getRuntimeStatus(runtime).state).toBe("RUNNING");

    const system = runtime.registry.get("system");
    expect(system?.status().state).toBe("IDLE");

    await stopRuntime(runtime);
    expect(getRuntimeStatus(runtime).state).toBe("STOPPED");
  });
});
