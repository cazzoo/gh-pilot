import { execSync } from "child_process";

/**
 * Run a shell command and return stdout. Throws on non-zero exit.
 */
export function run(cmd: string): string {
  return execSync(cmd, { encoding: "utf-8", timeout: 30000 }).trim();
}

/**
 * Detect the owner/repo from the current git remote.
 */
export function detectRepo(): string | null {
  try {
    const remote = run("git remote get-url origin");
    const match = remote.match(/[:/]([^/]+\/[^/.]+)(?:\.git)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Resolve a repo string: use explicit value or auto-detect.
 */
export function resolveRepo(explicit?: string): string {
  if (explicit) return explicit;
  const detected = detectRepo();
  if (!detected) {
    console.error("Cannot detect repo. Use --repo owner/repo or run inside a git repo.");
    process.exit(1);
  }
  return detected;
}

/**
 * Truncate a string to maxLen, appending "..." if needed.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}
