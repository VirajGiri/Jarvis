import { describe, expect, it } from "vitest";
import { ResearchAgent } from "@jarvis/agents";
import { AgentRegistry } from "./agent-registry";
import { InMemoryEventBus } from "./event-bus";
import { Orchestrator } from "./orchestrator";
import { PriorityTaskQueue } from "./task-queue";

describe("Orchestrator", () => {
  it("preserves the agent result contract without nesting the report", async () => {
    const registry = new AgentRegistry();
    const agent = new ResearchAgent();
    registry.register(agent.descriptor, agent);
    const orchestrator = new Orchestrator(registry, new PriorityTaskQueue(), new InMemoryEventBus());
    await agent.start();
    await orchestrator.submit({
      id: "research-orchestrator-1",
      type: "research",
      priority: "NORMAL",
      input: { query: "Grounding", sources: [{ title: "Notes", content: "A grounded fact." }] },
      createdAt: new Date(0).toISOString()
    });

    const result = await orchestrator.runNext();
    expect(result?.success).toBe(true);
    expect(result?.output).toMatchObject({
      query: "Grounding",
      findings: [{ text: "A grounded fact.", sourceTitle: "Notes" }]
    });
  });
});
