import { mkdir, readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { createTask, type JsonFileTaskStore, type Orchestrator } from "@jarvis/core";

interface ResearchCommand {
  id: string;
  type: "research.submit";
  query: string;
  sources: Array<{ title: string; content: string; url?: string }>;
}

function isResearchCommand(value: unknown): value is ResearchCommand {
  if (!value || typeof value !== "object") return false;
  const command = value as Partial<ResearchCommand>;
  return command.type === "research.submit" &&
    typeof command.id === "string" && /^[a-f0-9-]{36}$/i.test(command.id) &&
    typeof command.query === "string" && command.query.trim().length > 0 &&
    command.query.length <= 2000 && Array.isArray(command.sources) && command.sources.length <= 12 &&
    command.sources.every((source) => source && typeof source.title === "string" &&
      source.title.length <= 200 && typeof source.content === "string" && source.content.length <= 12000 &&
      (source.url === undefined || typeof source.url === "string"));
}

export class RuntimeCommandBridge {
  private processing = false;

  constructor(
    private readonly directory: string,
    private readonly store: JsonFileTaskStore,
    private readonly orchestrator: Orchestrator
  ) {}

  async processPending(): Promise<number> {
    if (this.processing) return 0;
    this.processing = true;
    let accepted = 0;
    try {
      await mkdir(this.directory, { recursive: true });
      const entries = await readdir(this.directory, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
        const filePath = path.join(this.directory, entry.name);
        try {
          const raw = await readFile(filePath, "utf8");
          const parsed: unknown = JSON.parse(raw);
          if (!isResearchCommand(parsed)) {
            await unlink(filePath);
            continue;
          }
          const taskId = `research-${parsed.id}`;
          const existing = await this.store.list();
          if (!existing.some((task) => task.id === taskId)) {
            const task = createTask(taskId, "research", {
              query: parsed.query.trim(),
              sources: parsed.sources
            });
            await this.store.save(task);
            await this.orchestrator.submit(task);
            accepted += 1;
          }
          await unlink(filePath);
        } catch (error) {
          // Malformed files are discarded; transient filesystem errors leave
          // the command in place for the next poll.
          if (error instanceof SyntaxError) {
            await unlink(filePath).catch(() => undefined);
          }
        }
      }
      return accepted;
    } finally {
      this.processing = false;
    }
  }
}
