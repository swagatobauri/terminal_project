/**
 * parser.test.js
 */

import {
  extractKeywords,
  groupByDay,
  groupByWeek,
  filterByDay,
} from '../src/core/parser.js';

// --- extractKeywords ---

test('extractKeywords strips stop words', () => {
  const kw = extractKeywords('fix the login form and update styles');
  expect(kw).not.toContain('fix');
  expect(kw).not.toContain('the');
  expect(kw).not.toContain('and');
  expect(kw).not.toContain('update');
});

test('extractKeywords keeps meaningful words', () => {
  const kw = extractKeywords('refactor authentication middleware');
  expect(kw).toContain('refactor');
  expect(kw).toContain('authentication');
  expect(kw).toContain('middleware');
});

test('extractKeywords handles empty string', () => {
  expect(extractKeywords('')).toEqual([]);
});

// --- groupByDay ---

const makeCommit = (dateStr, msg = 'test') => ({
  date: new Date(dateStr),
  message: msg,
  repo: '/tmp/repo',
  hash: 'abc1234',
  author: 'dev',
});

test('groupByDay groups correctly', () => {
  const commits = [
    makeCommit('2024-03-01T10:00:00'),
    makeCommit('2024-03-01T15:00:00'),
    makeCommit('2024-03-02T09:00:00'),
  ];
  const groups = groupByDay(commits);
  expect(groups.size).toBe(2);
  expect(groups.get('2024-03-01')).toHaveLength(2);
  expect(groups.get('2024-03-02')).toHaveLength(1);
});

// --- filterByDay ---

test('filterByDay returns only matching commits', () => {
  const commits = [
    makeCommit('2024-03-01T10:00:00'),
    makeCommit('2024-03-02T10:00:00'),
  ];
  const result = filterByDay(commits, new Date('2024-03-01'));
  expect(result).toHaveLength(1);
  expect(result[0].date.toISOString()).toContain('2024-03-01');
});
