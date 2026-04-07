import { writeFileSync } from "fs";
import { resolveRepo } from "../utils";
import { getTracker } from "../providers/tracker";
import { OpenAIPlanner } from "../providers/planner";
import { MarkdownPlanner } from "../providers/markdown-planner";
import chalk from "chalk";

interface PlanOptions {
  repo?: string;
  output?: string;
  model?: string;
}

export async function planIssue(issueRef: string, options: PlanOptions): Promise<void> {
  const repo = resolveRepo(options.repo);
  const tracker = getTracker();

  let issueNumber: number;
  if (issueRef === "next") {
    console.log(chalk.dim("Finding next unassigned issue..."));
    const issues = await tracker.listIssues({ repo, state: "open", limit: 10 });
    const unassigned = issues.find((i) => !i.assignee);
    if (!unassigned) {
      console.log(chalk.yellow("No unassigned open issues found."));
      return;
    }
    issueNumber = unassigned.number;
    console.log(chalk.dim(`Selected issue #${issueNumber}: ${unassigned.title}\n`));
  } else {
    issueNumber = parseInt(issueRef, 10);
    if (isNaN(issueNumber)) {
      console.error(chalk.red(`Invalid issue number: ${issueRef}`));
      process.exit(1);
    }
  }

  console.log(chalk.dim(`Fetching issue #${issueNumber}...`));
  const issue = await tracker.getIssue(repo, issueNumber);

  console.log(chalk.dim(`Generating plan using ${options.model || "gpt-4o"}...`));
  const planner = new OpenAIPlanner(options.model);
  const renderer = new MarkdownPlanner(planner);

  try {
    const markdown = await renderer.generate(issue);

    if (options.output) {
      writeFileSync(options.output, markdown, "utf-8");
      console.log(chalk.green(`Plan written to ${options.output}`));
    } else {
      console.log("\n" + markdown);
    }
  } catch (err: any) {
    console.error(chalk.red(`Planning failed: ${err.message}`));
    process.exit(1);
  }
}
