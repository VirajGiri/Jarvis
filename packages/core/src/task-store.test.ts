import { describe, expect, it } from "vitest";
import { InMemoryTaskStore, createTask } from "./task-store";

describe("task store", () => {
  it("persists and removes tasks", async () => {
    const store = new InMemoryTaskStore();
    const task = createTask("task-1", "system.snapshot");

    await store.save(task);
    expect(await store.list()).toEqual([task]);

    await store.remove(task.id);
    expect(await store.list()).toEqual([]);
  });
});
