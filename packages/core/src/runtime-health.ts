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
  const failed = agents.filter((agent) => agent.state === "FAILED").length;
  const state = !worker.isRunning()
    ? "STOPPED"
    : failed > 0
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
