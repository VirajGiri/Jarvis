import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { JarvisTool } from "./tool-gateway";

const execFileAsync = promisify(execFile);

export interface SystemSnapshot {
  platform: NodeJS.Platform;
  arch: string;
  node: string;
  hostname: string;
  uptimeSeconds: number;
  memory: { totalBytes: number; freeBytes: number; usedBytes: number };
}

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  const totalBytes = process.memoryUsage().rss;
  const freeBytes = 0;
  return {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    hostname: (await import("node:os")).hostname(),
    uptimeSeconds: (await import("node:os")).uptime(),
    memory: { totalBytes, freeBytes, usedBytes: totalBytes - freeBytes }
  };
}

export const systemSnapshotTool: JarvisTool = {
  id: "system.snapshot",
  risk: "READ",
  async execute() {
    return getSystemSnapshot();
  }
};

export const windowsProcessListTool: JarvisTool = {
  id: "windows.process-list",
  risk: "READ",
  async execute() {
    if (process.platform !== "win32") {
      return { supported: false, reason: "Windows-only tool" };
    }
    const { stdout } = await execFileAsync("tasklist.exe", ["/FO", "CSV", "/NH"], {
      windowsHide: true,
      maxBuffer: 4 * 1024 * 1024
    });
    return { supported: true, csv: stdout };
  }
};
