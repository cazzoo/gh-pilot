#!/usr/bin/env node

import { Command } from "commander";
import { listIssues } from "./commands/list";
import { planIssue } from "./commands/plan";

const program = new Command();

program
  .name("gh-pilot")
  .description("AI-assisted GitHub issue planner and triage CLI")
  .version("0.1.0");

program
  .command("list")
  .description("List issues in a GitHub repository")
  .option("-r, --repo <owner/repo>", "Repository (default: auto-detect from git remote)")
  .option("-l, --label <label>", "Filter by label")
  .option("-s, --state <state>", "Issue state (open, closed, all)", "open")
  .option("--limit <n>", "Max issues to fetch", "20")
  .action(listIssues);

program
  .command("plan <issue>")
  .description("Generate an implementation plan for an issue")
  .option("-r, --repo <owner/repo>", "Repository (default: auto-detect)")
  .option("-o, --output <file>", "Write plan to file instead of stdout")
  .option("--model <model>", "OpenAI model to use", "gpt-4o")
  .action(planIssue);

program.parse();
