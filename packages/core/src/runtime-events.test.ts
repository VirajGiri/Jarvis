import { describe, expect, it } from "vitest";
import { InMemoryEventBus } from "./event-bus";
import { createRuntimeEvent, RUNTIME_EVENTS } from "./runtime-events";

describe("runtime events", () => {
  it("publishes typed runtime events", async () => {
    const bus = new InMemoryEventBus();
    const received: unknown[] = [];
    bus.subscribe(RUNTIME_EVENTS.RUNTIME_STATUS, (event) => received.push(event));
    const event = createRuntimeEvent(RUNTIME_EVENTS.RUNTIME_STATUS, "runtime", { state: "RUNNING" });
    await bus.publish(event);
    expect(received).toHaveLength(1);
    expect(event.payload).toEqual({ state: "RUNNING" });
  });
});
