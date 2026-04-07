// Core types for gh-pilot

export interface Issue {
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  labels: string[];
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface Plan {
  issueNumber: number;
  issueTitle: string;
  summary: string;
  scope: string[];
  steps: PlanStep[];
  risks: string[];
  effort: "S" | "M" | "L";
  raw: string;
}

export interface PlanStep {
  order: number;
  title: string;
  description: string;
  files: string[];
  dependsOn: number[];
}

export interface TrackerProvider {
  listIssues(options: {
    repo?: string;
    label?: string;
    state?: string;
    limit?: number;
  }): Promise<Issue[]>;

  getIssue(repo: string, number: number): Promise<Issue>;
}

export interface PlannerProvider {
  generatePlan(issue: Issue, context?: string): Promise<Plan>;
}
