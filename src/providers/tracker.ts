import { TrackerProvider } from "../types";

/**
 * Factory to get the default tracker provider.
 * Currently only GitHub is supported, but this makes it easy
 * to add GitLab, Bitbucket, etc. later.
 */
export function getTracker(): TrackerProvider {
  const { GitHubTracker } = require("./github");
  return new GitHubTracker();
}
