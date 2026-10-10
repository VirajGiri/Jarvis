import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { AgentRegistry, ApprovalManager, DefaultPermissionPolicy, InMemoryEventBus, JsonFileTaskStore, Orchestrator, PriorityTaskQueue, ToolGateway } from "@jarvis/core";
import { RuntimeCommandBridge } from "./command-bridge";

describe("RuntimeCommandBridge", () => {
  let directory = "";

  afterEach(async () => {
    if (directory) await rm(directory, { recursive: true, force: true });
    directory = "";
  });

  it("validates and queues research commands durably", async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), "jarvis-commands-"));
    const commands = path.join(directory, "commands");
    await mkdir(commands, { recursive: true });
    const id = "b7c1d4a2-3e5f-4a6b-8c9d-0123456789ab";
    await writeFile(path.join(commands, id + ".json"), JSON.stringify({
      id, type: "research.submit", query: "Test question",
      sources: [{ title: "Source", content: "Grounded text." }]
    }));
    const queue = new PriorityTaskQueue();
    const store = new JsonFileTaskStore(path.join(directory, "tasks.json"));
    const bridge = new RuntimeCommandBridge(commands, store, new Orchestrator(new AgentRegistry(), queue, new InMemoryEventBus()), new ToolGateway(new DefaultPermissionPolicy(), new ApprovalManager()), new InMemoryEventBus());

    expect(await bridge.processPending()).toBe(1);
    expect(queue.size()).toBe(1);
    await expect(store.list()).resolves.toMatchObject([{ id: "research-" + id, type: "research", input: { query: "Test question" } }]);
  });

  it("discards malformed commands without queueing work", async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), "jarvis-commands-"));
    const commands = path.join(directory, "commands");
    await mkdir(commands, { recursive: true });
    await writeFile(path.join(commands, "bad.json"), JSON.stringify({ type: "system.exec", command: "unsafe" }));
    const queue = new PriorityTaskQueue();
    const bridge = new RuntimeCommandBridge(commands, new JsonFileTaskStore(path.join(directory, "tasks.json")), new Orchestrator(new AgentRegistry(), queue, new InMemoryEventBus()), new ToolGateway(new DefaultPermissionPolicy(), new ApprovalManager()), new InMemoryEventBus());

    expect(await bridge.processPending()).toBe(0);
    expect(queue.size()).toBe(0);
  });
});
