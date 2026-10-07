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

export interface ProcessSnapshot {
  pid: number;
  name: string;
  sessionName: string;
  sessionNumber: number;
  memoryBytes: number;
}

export interface NetworkAdapterSnapshot {
  name: string;
  status: string;
  linkSpeed?: string;
  macAddress?: string;
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

export function parseWindowsProcessCsv(csv: string): ProcessSnapshot[] {
  return csv.split(/\r?\n/).filter(Boolean).map((line) => {
    const fields = [...line.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
    const memory = Number.parseInt((fields[4] ?? "0").replace(/[^0-9]/g, ""), 10) || 0;
    return {
      name: fields[0] ?? "unknown",
      pid: Number.parseInt(fields[1] ?? "0", 10) || 0,
      sessionName: fields[2] ?? "unknown",
      sessionNumber: Number.parseInt(fields[3] ?? "0", 10) || 0,
      memoryBytes: memory
    };
  });
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
    if (process.platform !== "win32") return { supported: false, processes: [] };
    const { stdout } = await execFileAsync("tasklist.exe", ["/FO", "CSV", "/NH"], {
      windowsHide: true,
      maxBuffer: 4 * 1024 * 1024
    });
    return { supported: true, processes: parseWindowsProcessCsv(stdout) };
  }
};

export const windowsNetworkSnapshotTool: JarvisTool = {
  id: "windows.network-snapshot",
  risk: "READ",
  async execute() {
    if (process.platform !== "win32") return { supported: false, adapters: [] };
    const { stdout } = await execFileAsync("powershell.exe", [
      "-NoProfile", "-NonInteractive", "-Command",
      "Get-NetAdapter | Select-Object Name,Status,LinkSpeed,MacAddress | ConvertTo-Json -Compress"
    ], { windowsHide: true, maxBuffer: 1024 * 1024 });
    const parsed = JSON.parse(stdout || "[]");
    const adapters = (Array.isArray(parsed) ? parsed : [parsed]).map((item: Record<string, unknown>) => ({
      name: String(item.Name ?? ""),
      status: String(item.Status ?? ""),
      linkSpeed: item.LinkSpeed == null ? undefined : String(item.LinkSpeed),
      macAddress: item.MacAddress == null ? undefined : String(item.MacAddress)
    }));
    return { supported: true, adapters };
  }
};

export interface DiskSnapshot {
  filesystem: string;
  sizeBytes: number;
  freeBytes: number;
  usedBytes: number;
}

export const windowsDiskSnapshotTool: JarvisTool = {
  id: "windows.disk-snapshot",
  risk: "READ",
  async execute() {
    if (process.platform !== "win32") return { supported: false, disks: [] };
    const { stdout } = await execFileAsync("powershell.exe", [
      "-NoProfile", "-NonInteractive", "-Command",
      "Get-PSDrive -PSProvider FileSystem | Select-Object Name,Used,Free | ConvertTo-Json -Compress"
    ], { windowsHide: true, maxBuffer: 1024 * 1024 });
    return { supported: true, disks: stdout };
  }
};
