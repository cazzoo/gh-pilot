import { PlannerProvider, Plan, Issue } from "../types";

/**
 * Planner that uses OpenAI's chat completions API.
 */
export class OpenAIPlanner implements PlannerProvider {
  private apiKey: string;
  private model: string;

  constructor(model?: string) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY environment variable is required.");
    }
    this.apiKey = key;
    this.model = model || "gpt-4o";
  }

  async generatePlan(issue: Issue, context?: string): Promise<Plan> {
    const prompt = this.buildPrompt(issue, context);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert software architect. Given a GitHub issue, produce a structured implementation plan. Always respond in valid markdown.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    return this.parsePlan(issue, raw);
  }

  private buildPrompt(issue: Issue, context?: string): string {
    let prompt = `## Issue #${issue.number}: ${issue.title}\n\n`;
    if (issue.labels.length) prompt += `**Labels:** ${issue.labels.join(", ")}\n\n`;
    prompt += `${issue.body || "(no description)"}\n\n`;
    if (context) prompt += `## Additional Context\n\n${context}\n\n`;
    prompt += `---\n\nProduce an implementation plan with:\n`;
    prompt += `1. **Summary** — what this issue is about (2-3 sentences)\n`;
    prompt += `2. **Scope** — what's in scope and out of scope\n`;
    prompt += `3. **Steps** — numbered implementation steps, each with:\n`;
    prompt += `   - Title, description, affected files (guess if unsure)\n`;
    prompt += `   - Dependencies on previous steps\n`;
    prompt += `4. **Risks** — potential pitfalls or edge cases\n`;
    prompt += `5. **Effort** — rate S (hours), M (1-2 days), or L (3+ days)\n`;
    return prompt;
  }

  private parsePlan(issue: Issue, raw: string): Plan {
    const summaryMatch = raw.match(/\*\*Summary\*\*[\s\S]*?\n([\s\S]*?)(?=\n\*\*|\n##|$)/i);
    const effortMatch = raw.match(/\*\*Effort\*\*[^\n]*?([SML])/i);

    return {
      issueNumber: issue.number,
      issueTitle: issue.title,
      summary: summaryMatch?.[1]?.trim() || "",
      scope: [],
      steps: [],
      risks: [],
      effort: effortMatch?.[1] as "S" | "M" | "L" || "M",
      raw,
    };
  }
}
