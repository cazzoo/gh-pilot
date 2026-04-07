import { TrackerProvider } from "../types";
import { GitHubTracker } from "./github";

/**
 * Factory to get the default tracker provider.
 * Currently only GitHub is supported, but this makes it easy
 * to add GitLab, Bitbucket, etc. later.
 */
export function getTracker(): TrackerProvider {
  return new GitHubTracker();
}
