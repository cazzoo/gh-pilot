import { resolveRepo, truncate } from "../utils";
import { getTracker } from "../providers/tracker";
import chalk from "chalk";

interface ListOptions {
  repo?: string;
  label?: string;
  state?: string;
  limit?: string;
}

export async function listIssues(options: ListOptions): Promise<void> {
  const repo = resolveRepo(options.repo);
  const tracker = getTracker();

  console.log(chalk.dim(`Fetching issues from ${repo}...\n`));

  try {
    const issues = await tracker.listIssues({
      repo,
      label: options.label,
      state: options.state,
      limit: options.limit ? parseInt(options.limit, 10) : 20,
    });

    if (issues.length === 0) {
      console.log(chalk.yellow("No issues found."));
      return;
    }

    for (const issue of issues) {
      const num = chalk.cyan(`#${issue.number}`);
      const title = chalk.bold(truncate(issue.title, 72));
      const labels = issue.labels.length
        ? chalk.dim(` [${issue.labels.join(", ")}]`)
        : "";
      const assignee = issue.assignee
        ? chalk.dim(` @${issue.assignee}`)
        : "";

      console.log(`  ${num}  ${title}${labels}${assignee}`);
    }

    console.log("");
    console.log(chalk.dim(`${issues.length} issue(s) found. Use \`gh-pilot plan <number>\` to generate a plan.`));
  } catch (err: any) {
    console.error(chalk.red(`Error: ${err.message}`));
    process.exit(1);
  }
}
