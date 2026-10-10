import type { RuntimeStatus } from "@jarvis/contracts";
import type { AgentRegistry } from "./agent-registry";
import type { Orchestrator } from "./orchestrator";
import type { RuntimeWorker } from "./worker-loop";

export function getRuntimeHealth(
  registry: AgentRegistry,
  orchestrator: Orchestrator,
  worker: RuntimeWorker
): RuntimeStatus {
  const agents = registry.statuses();
  const failed = agents.some((agent) => agent.state === "FAILED");
  const allPaused = agents.length > 0 && agents.every((agent) => agent.state === "PAUSED");
  const state = !worker.isRunning()
    ? "STOPPED"
    : failed
      ? "DEGRADED"
      : allPaused
        ? "DEGRADED"
        : "RUNNING";

  return {
    state,
    activeTasks: worker.isProcessing() ? 1 : 0,
    queuedTasks: orchestrator.queueSize(),
    agents,
    updatedAt: new Date().toISOString()
  };
}
