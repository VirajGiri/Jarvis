import type { JarvisEvent } from "@jarvis/contracts";

export class RuntimeEventHistory {
  private readonly events: JarvisEvent[] = [];

  constructor(private readonly maxEvents = 500) {}

  append(event: JarvisEvent): void {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents);
    }
  }

  list(limit = 100): JarvisEvent[] {
    return this.events.slice(Math.max(0, this.events.length - limit));
  }

  clear(): void {
    this.events.length = 0;
  }

  size(): number {
    return this.events.length;
  }
}
