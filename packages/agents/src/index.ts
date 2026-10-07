export interface JarvisAgent {
  readonly id: string;
  readonly name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  execute(task: unknown): Promise<unknown>;
}
