import { describe, expect, it } from "vitest";
import type { AgentTask } from "@jarvis/contracts";
import { ResearchAgent } from "./research-agent";

const task = (input: Record<string, unknown>): AgentTask => ({
  id: "research-test-1",
  type: "research",
  priority: "NORMAL",
  input,
  createdAt: new Date(0).toISOString()
});

describe("ResearchAgent", () => {
  it("extracts source-grounded findings and declares offline limitations", async () => {
    const agent = new ResearchAgent();
    await agent.start();
    const result = await agent.execute(task({
      query: "What is in the source?",
      sources: [{ title: "Source A", url: "https://example.com", content: "First fact. Second fact!" }]
    }));

    expect(result.success).toBe(true);
    const report = result.output as { findings: Array<{ text: string; sourceTitle: string }>; limitations: string[] };
    expect(report.findings).toHaveLength(2);
    expect(report.findings[0]).toMatchObject({ text: "First fact.", sourceTitle: "Source A" });
    expect(report.limitations[0]).toContain("no web search");
  });

  it("rejects tasks without a query", async () => {
    const result = await new ResearchAgent().execute(task({ sources: [] }));
    expect(result.success).toBe(false);
    expect(result.error?.message).toBe("RESEARCH_QUERY_REQUIRED");
  });
});
