export {};

declare global {
  interface Window {
    jarvis?: {
      getStatus(): Promise<{
        state: string;
        activeTasks: number;
        queuedTasks: number;
        agents: Array<{ agentId: string; state: string; updatedAt: string; lastTaskId?: string }>;
        updatedAt: string;
        telemetry?: { uptimeSeconds: number; memory: { totalBytes: number; freeBytes: number; usedBytes: number }; loadAverage: number[]; hostname: string; platform: string };
      }>;
      onEvent(handler: (event: { id: string; type: string; source: string; timestamp: string; payload: Record<string, unknown> }) => void): () => void;
    };
  }
}
