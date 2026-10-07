import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";
import type { JarvisTool } from "./tool-gateway";

const execFileAsync = promisify(execFile);

export interface SystemSnapshot {
  platform: NodeJS.Platform;
  arch: string;
  node: string;
  hostname: string;
  uptimeSeconds: number;
  memory: { totalBytes: number; freeBytes: number; usedBytes: number };
  loadAverage: number[];
}

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  return {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    hostname: os.hostname(),
    uptimeSeconds: os.uptime(),
    memory: { totalBytes, freeBytes, usedBytes: totalBytes - freeBytes },
    loadAverage: os.loadavg()
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
