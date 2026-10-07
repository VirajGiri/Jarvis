export interface RuntimeConfig {
  version: 1;
  taskStorePath: string;
  runtimeStateDir: string;
  workerIntervalMs: number;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return {
    version: 1,
    taskStorePath: env.JARVIS_TASK_STORE ?? "./.jarvis/tasks.json",
    runtimeStateDir: env.JARVIS_RUNTIME_STATE_DIR ?? "./.jarvis",
    workerIntervalMs: positiveInteger(env.JARVIS_WORKER_INTERVAL_MS, 250)
  };
}
