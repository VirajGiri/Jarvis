import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { InMemoryTaskStore, JsonFileTaskStore, createTask } from "./task-store";

describe("task store", () => {
  it("persists and removes tasks in memory", async () => {
    const store = new InMemoryTaskStore();
    const task = createTask("task-1", "system.snapshot");
    await store.save(task);
    expect(await store.list()).toEqual([task]);
    await store.remove(task.id);
    expect(await store.list()).toEqual([]);
  });

  it("persists tasks across store instances", async () => {
    const dir = await mkdtemp(join(tmpdir(), "jarvis-"));
    const file = join(dir, "tasks.json");
    const task = createTask("task-persistent", "system.snapshot");

    await new JsonFileTaskStore(file).save(task);
    const restored = await new JsonFileTaskStore(file).list();

    expect(restored).toEqual([task]);
    expect(await readFile(file, "utf8")).toContain("task-persistent");
    await rm(dir, { recursive: true, force: true });
  });
});
