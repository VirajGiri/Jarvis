import { describe, expect, it } from "vitest";
import { getSystemSnapshot, parseWindowsProcessCsv, parseWindowsDiskJson } from "./system-tools";

describe("system tools", () => {
  it("returns a local runtime snapshot", async () => {
    const snapshot = await getSystemSnapshot();
    expect(snapshot.platform).toBe(process.platform);
    expect(snapshot.arch).toBe(process.arch);
    expect(snapshot.node).toMatch(/^v\d+/);
    expect(snapshot.uptimeSeconds).toBeGreaterThan(0);
    expect(snapshot.loadAverage).toHaveLength(3);
  });

  it("parses Windows tasklist CSV into stable process records", () => {
    const csv = '"Image Name","PID","Session Name","Session#","Mem Usage"\r\n"chrome.exe","1234","Console","1","123,456 K"';
    expect(parseWindowsProcessCsv(csv)).toEqual([{
      name: "chrome.exe",
      pid: 1234,
      sessionName: "Console",
      sessionNumber: 1,
      memoryBytes: 123456
    }]);
  });
  it("parses Windows disk telemetry into byte counts", () => {
    expect(parseWindowsDiskJson('{"Name":"C","Used":700,"Free":300}')).toEqual([{
      filesystem: "C", sizeBytes: 1000, freeBytes: 300, usedBytes: 700
    }]);
  });
});
