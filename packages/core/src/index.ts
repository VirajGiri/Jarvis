export interface EventBus {
  publish(event: unknown): Promise<void>;
  subscribe(type: string, handler: (event: unknown) => Promise<void>): () => void;
}

export interface TaskQueue {
  enqueue(task: unknown): Promise<void>;
  dequeue(): Promise<unknown | undefined>;
}

export interface AgentRuntime {
  start(): Promise<void>;
  stop(): Promise<void>;
}
