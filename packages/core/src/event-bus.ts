export type EventHandler<T = unknown> = (event: T) => Promise<void> | void;

export class InMemoryEventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  subscribe<T>(type: string, handler: EventHandler<T>): () => void {
    const set = this.handlers.get(type) ?? new Set<EventHandler>();
    set.add(handler as EventHandler);
    this.handlers.set(type, set);
    return () => set.delete(handler as EventHandler);
  }

  async publish<T extends { type: string }>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers) return;
    await Promise.all([...handlers].map((handler) => handler(event)));
  }

  listenerCount(type?: string): number {
    if (type) return this.handlers.get(type)?.size ?? 0;
    return [...this.handlers.values()].reduce((sum, set) => sum + set.size, 0);
  }

  clear(): void {
    this.handlers.clear();
  }
}
