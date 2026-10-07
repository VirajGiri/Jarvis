import type { AgentDescriptor } from "@jarvis/contracts";
import type { JarvisAgent } from "@jarvis/agents";

export class AgentRegistry {
  private readonly agents = new Map<string, { descriptor: AgentDescriptor; agent: JarvisAgent }>();

  register(descriptor: AgentDescriptor, agent: JarvisAgent): void {
    if (this.agents.has(descriptor.id)) throw new Error(`Agent already registered: ${descriptor.id}`);
    this.agents.set(descriptor.id, { descriptor, agent });
  }

  get(id: string): JarvisAgent | undefined {
    return this.agents.get(id)?.agent;
  }

  list(): AgentDescriptor[] {
    return [...this.agents.values()].map(({ descriptor }) => descriptor);
  }

  statuses() {
    return [...this.agents.values()].map(({ agent }) => agent.status());
  }

  async startAll(): Promise<void> {
    for (const { agent } of this.agents.values()) await agent.start();
  }

  async stopAll(): Promise<void> {
    for (const { agent } of this.agents.values()) await agent.stop();
  }
}
