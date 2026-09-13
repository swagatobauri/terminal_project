/**
 * parser.js — keyword extraction and time-based grouping
 *
 * Keeps things simple: no NLP, just regex and date-fns.
 */

import { format, startOfDay, startOfWeek, isSameDay } from 'date-fns';

// Words that don't tell us anything useful
const STOP_WORDS = new Set([
  'fix', 'fixes', 'fixed', 'add', 'adds', 'added', 'update', 'updates',
  'updated', 'remove', 'removes', 'removed', 'change', 'changes', 'changed',
  'merge', 'merged', 'revert', 'reverted', 'bump', 'init', 'initial',
  'commit', 'wip', 'the', 'and', 'for', 'with', 'a', 'an', 'to', 'of',
  'in', 'on', 'at', 'by', 'from', 'up', 'minor', 'major', 'misc',
]);

/**
 * Pull meaningful keywords out of a commit message.
 * @param {string} message
 * @returns {string[]}
 */
export function extractKeywords(message) {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Group commits by calendar day.
 * @param {Array} commits  Array of commit objects (must have a `date` field)
 * @returns {Map<string, Array>}  Map of "YYYY-MM-dd" → commits[]
 */
export function groupByDay(commits) {
  const groups = new Map();
  for (const commit of commits) {
    const key = format(commit.date, 'yyyy-MM-dd');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(commit);
  }
  return groups;
}

/**
 * Group commits by ISO week start (Monday).
 * @param {Array} commits
 * @returns {Map<string, Array>}  Map of "YYYY-MM-dd (week start)" → commits[]
 */
export function groupByWeek(commits) {
  const groups = new Map();
  for (const commit of commits) {
    const weekStart = startOfWeek(commit.date, { weekStartsOn: 1 });
    const key = format(weekStart, 'yyyy-MM-dd');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(commit);
  }
  return groups;
}

/**
 * Filter commits to only those on a specific date.
 * @param {Array}  commits
 * @param {Date}   date
 */
export function filterByDay(commits, date) {
  return commits.filter((c) => isSameDay(c.date, date));
}
