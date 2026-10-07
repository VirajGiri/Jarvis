import { describe, expect, it } from "vitest";
import { getSystemSnapshot } from "./system-tools";

describe("system tools", () => {
  it("returns a local runtime snapshot", async () => {
    const snapshot = await getSystemSnapshot();
    expect(snapshot.platform).toBe(process.platform);
    expect(snapshot.arch).toBe(process.arch);
    expect(snapshot.node).toMatch(/^v\d+/);
    expect(snapshot.uptimeSeconds).toBeGreaterThan(0);
  });
});
