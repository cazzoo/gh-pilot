import { Issue, TrackerProvider } from "../types";
import { run } from "../utils";

/**
 * GitHub tracker provider using the `gh` CLI.
 */
export class GitHubTracker implements TrackerProvider {
  async listIssues(options: {
    repo?: string;
    label?: string;
    state?: string;
    limit?: number;
  }): Promise<Issue[]> {
    const args = ["gh issue list", "--json number,title,body,state,labels,assignees,createdAt,updatedAt,url"];

    if (options.repo) args.push(`--repo ${options.repo}`);
    if (options.label) args.push(`--label "${options.label}"`);
    if (options.state) args.push(`--state ${options.state}`);
    args.push(`--limit ${options.limit || 20}`);

    const raw = run(args.join(" "));
    const parsed = JSON.parse(raw);

    return parsed.map((i: any) => ({
      number: i.number,
      title: i.title,
      body: i.body || "",
      state: i.state,
      labels: (i.labels || []).map((l: any) => l.name),
      assignee: i.assignees?.[0]?.login || null,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
      url: i.url,
    }));
  }

  async getIssue(repo: string, number: number): Promise<Issue> {
    const raw = run(`gh issue view ${number} --repo ${repo} --json number,title,body,state,labels,assignees,createdAt,updatedAt,url`);
    const i = JSON.parse(raw);

    return {
      number: i.number,
      title: i.title,
      body: i.body || "",
      state: i.state,
      labels: (i.labels || []).map((l: any) => l.name),
      assignee: i.assignees?.[0]?.login || null,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
      url: i.url,
    };
  }
}
