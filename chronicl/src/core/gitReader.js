import fs from 'fs/promises';
import path from 'path';
import simpleGit from 'simple-git';

export async function findRepos(rootPath, depth = 0) {
  if (depth > 5) return [];

  const repos = [];

  // Check if current directory is a git repo
  try {
    const gitPath = path.join(rootPath, '.git');
    const stat = await fs.stat(gitPath);
    if (stat.isDirectory() || stat.isFile()) {
      repos.push(rootPath);
    }
  } catch (err) {
    // not a git repo
  }

  let entries;
  try {
    entries = await fs.readdir(rootPath, { withFileTypes: true });
  } catch (err) {
    return repos;
  }

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

    if (entry.isDirectory()) {
      const fullPath = path.join(rootPath, entry.name);
      const subRepos = await findRepos(fullPath, depth + 1);
      repos.push(...subRepos);
    }
  }

  return repos;
}

export async function getCommits(repoPath, options = {}) {
  const { maxCount = 100, since = '30 days ago' } = options;

  try {
    const git = simpleGit(repoPath);
    const log = await git.log({ maxCount, '--since': since });

    return log.all.map(commit => ({
      hash: commit.hash.slice(0, 7),
      message: commit.message,
      date: new Date(commit.date),
      author: commit.author_name,
      repo: path.basename(repoPath),
      repoPath: repoPath
    }));
  } catch (err) {
    // Return empty array if repository cannot be read
    return [];
  }
}

export function groupByDate(commits) {
  const groups = {};

  for (const commit of commits) {
    const dateStr = commit.date.toISOString().split('T')[0];
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(commit);
  }

  // Sort dates descending (newest first)
  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  const sortedGroups = {};
  for (const key of sortedKeys) {
    sortedGroups[key] = groups[key];
  }

  return sortedGroups;
}

export function extractKeywords(commitMessages) {
  const STOP_WORDS = new Set([
    'fix', 'add', 'update', 'remove', 'merge', 'branch', 'commit', 
    'the', 'and', 'for', 'to', 'a', 'an'
  ]);
  const wordCounts = {};

  for (const message of commitMessages) {
    // Strip non-alphanumeric (except spaces), lowercase, split by whitespace
    const words = message.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    for (const word of words) {
      if (word.length >= 3 && !STOP_WORDS.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    }
  }

  // Return top 5 most frequent words
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1]) // sort by frequency descending
    .slice(0, 5)
    .map(entry => entry[0]);
}
