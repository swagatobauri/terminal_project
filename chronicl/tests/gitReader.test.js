import test from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import { groupByDate, extractKeywords, findRepos } from '../src/core/gitReader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('groupByDate correctly groups and sorts commits', () => {
  const commits = [
    { date: new Date('2025-01-14T12:00:00Z'), hash: 'a' },
    { date: new Date('2025-01-15T12:00:00Z'), hash: 'b' },
    { date: new Date('2025-01-14T15:00:00Z'), hash: 'c' },
  ];

  const grouped = groupByDate(commits);

  const keys = Object.keys(grouped);
  assert.deepStrictEqual(keys, ['2025-01-15', '2025-01-14']);
  assert.strictEqual(grouped['2025-01-15'].length, 1);
  assert.strictEqual(grouped['2025-01-14'].length, 2);
});

test('extractKeywords filters stop words and ranks by frequency', () => {
  const messages = [
    "fix auth bug",
    "add login feature",
    "fix typo in login"
  ];

  const keywords = extractKeywords(messages);

  assert.ok(keywords.includes('login'));
  assert.ok(keywords.includes('auth'));
  assert.ok(keywords.includes('bug'));
  assert.ok(keywords.includes('feature'));
  assert.ok(keywords.includes('typo'));
  
  // "fix" and "add" are in the stop list and should be filtered out
  assert.ok(!keywords.includes('fix'));
  assert.ok(!keywords.includes('add'));
  
  // "in" should be filtered out for being < 3 chars
  assert.ok(!keywords.includes('in'));
  
  // 'login' appears twice, should be the top keyword
  assert.strictEqual(keywords[0], 'login');
});

test('findRepos finds the current project repo', async () => {
  // Go up one extra level since the .git folder is at Terminal_project root
  const projectRoot = path.resolve(__dirname, '../..');
  const repos = await findRepos(projectRoot);

  assert.ok(repos.length > 0, 'Should find at least one repo');
  assert.ok(repos.some(r => r.endsWith('Terminal_project')), 'Should find Terminal_project repo');
});
