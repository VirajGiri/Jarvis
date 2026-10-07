export {};

declare global {
  interface Window {
    jarvis?: {
      getStatus(): Promise<{
        runtime: string;
        agents: number;
        tasks: number;
        timestamp: string;
      }>;
    };
  }
}
