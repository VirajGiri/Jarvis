import { describe, expect, it } from "vitest";
import { JsonLogger } from "./logger";

describe("JsonLogger", () => {
  it("emits structured JSON records", () => {
    const lines: string[] = [];
    const sink = {
      debug: (line: string) => lines.push(line),
      info: (line: string) => lines.push(line),
      warn: (line: string) => lines.push(line),
      error: (line: string) => lines.push(line)
    };
    new JsonLogger("test", sink).info("hello", { taskId: "1" });
    const record = JSON.parse(lines[0]);
    expect(record.source).toBe("test");
    expect(record.message).toBe("hello");
    expect(record.data.taskId).toBe("1");
  });
});
