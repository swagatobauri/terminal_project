import test from 'node:test';
import assert from 'node:assert';
import { parseNaturalDate, getLongestStreak, getTopRepos } from '../src/core/parser.js';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from 'date-fns';

test('parseNaturalDate handles yesterday', () => {
  const range = parseNaturalDate("yesterday");
  const yesterday = subDays(new Date(), 1);
  
  assert.ok(range, 'range should not be null');
  assert.strictEqual(range.from.toISOString(), startOfDay(yesterday).toISOString());
  assert.strictEqual(range.to.toISOString(), endOfDay(yesterday).toISOString());
});

test('parseNaturalDate handles last week', () => {
  const range = parseNaturalDate("last week");
  const lastWeek = subDays(new Date(), 7);
  
  assert.ok(range, 'range should not be null');
  assert.strictEqual(range.from.toISOString(), startOfWeek(lastWeek, { weekStartsOn: 1 }).toISOString());
  assert.strictEqual(range.to.toISOString(), endOfWeek(lastWeek, { weekStartsOn: 1 }).toISOString());
});

test('parseNaturalDate handles 2 days ago', () => {
  const range = parseNaturalDate("2 days ago");
  const expected = subDays(new Date(), 2);
  
  assert.ok(range, 'range should not be null');
  assert.strictEqual(range.from.toISOString(), startOfDay(expected).toISOString());
  assert.strictEqual(range.to.toISOString(), endOfDay(expected).toISOString());
});

test('parseNaturalDate returns null for nonsense', () => {
  const range = parseNaturalDate("nonsense gibberish");
  assert.strictEqual(range, null);
});

test('getLongestStreak counts consecutive days', () => {
  const logs = [
    { date: new Date('2025-01-14T10:00:00Z').toISOString() },
    { date: new Date('2025-01-13T10:00:00Z').toISOString() },
    { date: new Date('2025-01-12T10:00:00Z').toISOString() },
    // gap
    { date: new Date('2025-01-09T10:00:00Z').toISOString() },
    { date: new Date('2025-01-08T10:00:00Z').toISOString() },
  ];
  
  const streak = getLongestStreak(logs);
  assert.strictEqual(streak.days, 3);
  assert.strictEqual(streak.to.toISOString(), new Date('2025-01-14T12:00:00Z').toISOString());
  assert.strictEqual(streak.from.toISOString(), new Date('2025-01-12T12:00:00Z').toISOString());
});

test('getTopRepos sorts and limits correctly', () => {
  const commits = [
    { repo: 'a' }, { repo: 'b' }, { repo: 'a' }, { repo: 'c' },
    { repo: 'a' }, { repo: 'b' }, { repo: 'd' }
  ];
  
  const top = getTopRepos(commits, 2);
  assert.strictEqual(top.length, 2);
  assert.strictEqual(top[0].repo, 'a');
  assert.strictEqual(top[0].count, 3);
  assert.strictEqual(top[1].repo, 'b');
  assert.strictEqual(top[1].count, 2);
});
