import type { AgentDescriptor, AgentResult, AgentState, AgentStatus, AgentTask } from "@jarvis/contracts";

export interface ResearchSource {
  title: string;
  url?: string;
  content: string;
}

export interface ResearchFinding {
  text: string;
  sourceTitle: string;
  sourceUrl?: string;
}

export interface ResearchReport {
  query: string;
  summary: string;
  findings: ResearchFinding[];
  limitations: string[];
}

export interface ResearchProvider {
  research(query: string, sources: ResearchSource[]): Promise<ResearchReport>;
}

/**
 * Safe offline provider: it only extracts sentences from sources explicitly
 * supplied with the task. It does not claim to search the web or verify URLs.
 */
export class SourceDigestResearchProvider implements ResearchProvider {
  async research(query: string, sources: ResearchSource[]): Promise<ResearchReport> {
    const validSources = sources
      .filter((source) => typeof source.title === "string" && typeof source.content === "string")
      .slice(0, 12)
      .map((source) => ({ ...source, content: source.content.slice(0, 12_000) }));

    const findings: ResearchFinding[] = validSources.flatMap((source) => {
      const sentences = source.content
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .slice(0, 5);
      return sentences.map((text) => ({ text, sourceTitle: source.title, ...(source.url ? { sourceUrl: source.url } : {}) }));
    }).slice(0, 40);

    return {
      query,
      summary: findings.length
        ? `Collected ${findings.length} source-grounded statements from ${validSources.length} supplied source(s). Review the cited statements to form a conclusion.`
        : "No source content was supplied, so no factual summary can be produced.",
      findings,
      limitations: [
        "Offline source-digest mode; no web search was performed.",
        "Statements are extracted from supplied text and have not been independently verified.",
        ...(sources.length > 12 ? ["Only the first 12 sources were processed."] : [])
      ]
    };
  }
}

export class ResearchAgent {
  readonly id = "research";
  readonly name = "Research Agent";
  readonly descriptor: AgentDescriptor = { id: this.id, name: this.name, version: "0.1.0", capabilities: ["research.digest", "research.source-analysis"] };
  private state: AgentState = "REGISTERED";
  private lastTaskId?: string;

  constructor(private readonly provider: ResearchProvider = new SourceDigestResearchProvider()) {}

  async start(): Promise<void> { this.state = "IDLE"; }
  async stop(): Promise<void> { this.state = "PAUSED"; }
  status(): AgentStatus { return { agentId: this.id, state: this.state, lastTaskId: this.lastTaskId, updatedAt: new Date().toISOString() }; }

  async execute(task: AgentTask): Promise<AgentResult> {
    this.lastTaskId = task.id;
    this.state = "EXECUTING";
    try {
      const query = typeof task.input.query === "string" ? task.input.query.trim() : "";
      if (!query) throw new Error("RESEARCH_QUERY_REQUIRED");
      const rawSources = Array.isArray(task.input.sources) ? task.input.sources : [];
      const sources: ResearchSource[] = rawSources.filter((source): source is ResearchSource =>
        typeof source === "object" && source !== null &&
        typeof (source as ResearchSource).title === "string" &&
        typeof (source as ResearchSource).content === "string"
      );
      const output = await this.provider.research(query, sources);
      this.state = "COMPLETED";
      return { taskId: task.id, success: true, output, completedAt: new Date().toISOString() };
    } catch (error) {
      this.state = "FAILED";
      return {
        taskId: task.id,
        success: false,
        error: { code: "RESEARCH_FAILED", message: error instanceof Error ? error.message : String(error) },
        completedAt: new Date().toISOString()
      };
    }
  }
}
