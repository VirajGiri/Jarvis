export {};

declare global {
  interface Window {
    jarvis?: {
      submitResearch(payload: { query: string; sourceTitle: string; sourceContent: string }): Promise<{ accepted: boolean; id: string }>;
      resolveApproval(payload: { approvalId: string; decision: "APPROVE" | "DENY" }): Promise<{ accepted: boolean; id: string }>;
      getStatus(): Promise<{
        state: string;
        activeTasks: number;
        queuedTasks: number;
        agents: Array<{ agentId: string; state: string; updatedAt: string; lastTaskId?: string }>;
        updatedAt: string;
        telemetry?: { uptimeSeconds: number; memory: { totalBytes: number; freeBytes: number; usedBytes: number }; loadAverage: number[]; hostname: string; platform: string };
        pendingApprovals?: Array<{ id: string; tool: string; risk: string; reason: string; createdAt: string }>;
      }>;
      onEvent(handler: (event: { id: string; type: string; source: string; timestamp: string; payload: Record<string, unknown> }) => void): () => void;
    };
  }
}
