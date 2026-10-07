import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { JarvisEvent, RuntimeStatus } from "@jarvis/contracts";

export class RuntimeFileBridge {
  private readonly statePath: string;
  private readonly eventsPath: string;

  constructor(directory = process.env.JARVIS_RUNTIME_STATE_DIR ?? "./.jarvis") {
    this.statePath = path.join(directory, "runtime-status.json");
    this.eventsPath = path.join(directory, "runtime-events.ndjson");
  }

  async writeStatus(status: RuntimeStatus): Promise<void> {
    await mkdir(path.dirname(this.statePath), { recursive: true });
    await writeFile(this.statePath, JSON.stringify(status, null, 2), "utf8");
  }

  async appendEvent(event: JarvisEvent): Promise<void> {
    await mkdir(path.dirname(this.eventsPath), { recursive: true });
    await appendFile(this.eventsPath, JSON.stringify(event) + "\n", "utf8");
  }

  getStatePath(): string {
    return this.statePath;
  }

  getEventsPath(): string {
    return this.eventsPath;
  }
}
