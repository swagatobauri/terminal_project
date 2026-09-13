/**
 * gitReader.js — reads commit history from a local git repo
 *
 * Returns commits as plain objects so the rest of the app
 * doesn't need to know anything about simple-git's types.
 */

import simpleGit from 'simple-git';

/**
 * Fetch commits from a single repo path.
 * @param {string} repoPath  Absolute path to the repo root
 * @param {object} opts
 * @param {string} [opts.since]  e.g. "1 week ago", "2024-01-01"
 * @param {string} [opts.author] Filter by author name / email
 * @returns {Promise<Array>} Array of commit objects
 */
export async function readCommits(repoPath, opts = {}) {
  const git = simpleGit(repoPath);

  const logArgs = ['--all'];
  if (opts.since)  logArgs.push(`--since=${opts.since}`);
  if (opts.author) logArgs.push(`--author=${opts.author}`);

  const log = await git.log(logArgs);

  return log.all.map((c) => ({
    hash:    c.hash.slice(0, 7),
    message: c.message,
    author:  c.author_name,
    date:    new Date(c.date),
    repo:    repoPath,
  }));
}

/**
 * Walk an array of repo paths and aggregate commits.
 */
export async function readAllCommits(repoPaths, opts = {}) {
  const results = await Promise.allSettled(
    repoPaths.map((p) => readCommits(p, opts))
  );

  const commits = [];
  for (const r of results) {
    if (r.status === 'fulfilled') commits.push(...r.value);
  }

  // Sort newest-first
  commits.sort((a, b) => b.date - a.date);
  return commits;
}
