import { describe, expect, it } from "vitest";
import { RuntimeEventHistory } from "./runtime-history";

describe("runtime event history", () => {
  it("keeps only configured recent events", () => {
    const history = new RuntimeEventHistory(2);
    history.append({ id: "1", type: "a", source: "test", timestamp: "1", payload: {} });
    history.append({ id: "2", type: "b", source: "test", timestamp: "2", payload: {} });
    history.append({ id: "3", type: "c", source: "test", timestamp: "3", payload: {} });
    expect(history.size()).toBe(2);
    expect(history.list()[0].id).toBe("2");
  });
});
