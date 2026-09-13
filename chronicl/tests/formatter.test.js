/**
 * formatter.test.js
 *
 * Light smoke tests — we just verify the functions don't throw.
 * Visual correctness is checked by running the CLI manually.
 */

import {
  printDayHeader,
  printCommit,
  printCommitTable,
  printStatsTable,
  printError,
  printSuccess,
} from '../src/core/formatter.js';

const sampleCommit = {
  hash: 'abc1234',
  message: 'add login feature',
  author: 'Alice',
  date: new Date('2024-03-01T10:30:00'),
  repo: '/Users/dev/projects/my-app',
};

test('printDayHeader does not throw', () => {
  expect(() => printDayHeader('Friday, March 1 2024')).not.toThrow();
});

test('printCommit does not throw', () => {
  expect(() => printCommit(sampleCommit)).not.toThrow();
});

test('printCommitTable does not throw with empty array', () => {
  expect(() => printCommitTable([])).not.toThrow();
});

test('printCommitTable does not throw with commits', () => {
  expect(() => printCommitTable([sampleCommit])).not.toThrow();
});

test('printStatsTable does not throw', () => {
  expect(() => printStatsTable([['Total commits', '42'], ['Streak', '7 days']])).not.toThrow();
});

test('printError does not throw', () => {
  expect(() => printError('something went wrong')).not.toThrow();
});

test('printSuccess does not throw', () => {
  expect(() => printSuccess('all good')).not.toThrow();
});
