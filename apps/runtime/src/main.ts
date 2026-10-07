import { createRuntime, startRuntime, stopRuntime } from "./index";

const runtime = createRuntime();
let stopping = false;

async function shutdown(signal: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  console.log(`JARVIS runtime stopping: ${signal}`);
  await stopRuntime(runtime);
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

await startRuntime(runtime);
runtime.logger.info("JARVIS runtime started", { state: "RUNNING" });
console.log("JARVIS runtime started");
