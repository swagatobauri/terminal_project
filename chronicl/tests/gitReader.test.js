/**
 * gitReader.test.js
 *
 * Basic sanity checks for readCommits / readAllCommits.
 * Uses a real git repo (the chronicl repo itself) so no mocking needed.
 */

import { readCommits, readAllCommits } from '../src/core/gitReader.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..'); // the chronicl repo itself

test('readCommits returns an array', async () => {
  // Will return [] if no commits exist yet — that's fine
  const commits = await readCommits(REPO_ROOT);
  expect(Array.isArray(commits)).toBe(true);
});

test('each commit has expected fields', async () => {
  const commits = await readCommits(REPO_ROOT);
  for (const c of commits) {
    expect(c).toHaveProperty('hash');
    expect(c).toHaveProperty('message');
    expect(c).toHaveProperty('author');
    expect(c).toHaveProperty('date');
    expect(c).toHaveProperty('repo');
    expect(c.date).toBeInstanceOf(Date);
  }
});

test('readAllCommits handles multiple paths gracefully', async () => {
  const commits = await readAllCommits([REPO_ROOT, '/nonexistent/path']);
  expect(Array.isArray(commits)).toBe(true);
});
