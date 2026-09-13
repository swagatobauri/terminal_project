/**
 * formatter.js — all the pretty-printing logic
 *
 * Everything that touches chalk or cli-table3 lives here.
 * Other modules pass data in; this module handles how it looks.
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import { format } from 'date-fns';
import path from 'path';

/**
 * Print a section header (date line).
 */
export function printDayHeader(dateStr) {
  const line = '─'.repeat(50);
  console.log('\n' + chalk.bold.yellow(`  ${dateStr}`));
  console.log(chalk.dim('  ' + line));
}

/**
 * Print a single commit entry.
 */
export function printCommit(commit) {
  const repoName = path.basename(commit.repo);
  const time = format(commit.date, 'HH:mm');
  console.log(
    `  ${chalk.dim(time)}  ${chalk.cyan.bold(repoName)}  ${chalk.white(commit.message)}`
  );
}

/**
 * Print a table of commits grouped by repo.
 * @param {Array} commits
 */
export function printCommitTable(commits) {
  const table = new Table({
    head: [
      chalk.bold('Time'),
      chalk.bold('Repo'),
      chalk.bold('Commit'),
      chalk.bold('Hash'),
    ],
    style: { head: [], border: ['dim'] },
    colWidths: [8, 20, 52, 9],
    wordWrap: true,
  });

  for (const c of commits) {
    table.push([
      chalk.dim(format(c.date, 'HH:mm')),
      chalk.cyan(path.basename(c.repo)),
      c.message,
      chalk.dim(c.hash),
    ]);
  }

  console.log(table.toString());
}

/**
 * Print a stats summary table (key-value pairs).
 * @param {Array<[string, string]>} rows  e.g. [['Total commits', '42']]
 */
export function printStatsTable(rows) {
  const table = new Table({
    style: { head: [], border: ['dim'] },
  });

  for (const [label, value] of rows) {
    table.push({ [chalk.dim(label)]: chalk.bold(value) });
  }

  console.log(table.toString());
}

/**
 * Print an error in red.
 */
export function printError(msg) {
  console.error(chalk.red(`  ✗ ${msg}`));
}

/**
 * Print a success message in green.
 */
export function printSuccess(msg) {
  console.log(chalk.green(`  ✓ ${msg}`));
}
