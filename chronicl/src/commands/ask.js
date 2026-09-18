import chalk from 'chalk';
import { parseNaturalDate, getCommitsInRange } from '../core/parser.js';
import { getLogs, getConfig } from '../core/store.js';
import { getShellHistory } from '../core/historyReader.js';
import { printDayLog, printNoData } from '../core/formatter.js';
import { groupByDate } from '../core/gitReader.js';

export async function runAsk(query) {
  const range = parseNaturalDate(query);
  if (!range) {
    console.log(chalk.yellow('Sorry, I didn\'t understand that date. Try: last tuesday, jan 14, 2 days ago'));
    return;
  }
  
  const now = new Date();
  if (range.from > now) {
    console.log(chalk.yellow('That date is in the future.'));
    return;
  }
  
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (range.from < oneYearAgo) {
    console.log(chalk.yellow('⚠️  Warning: That date is more than a year ago. Showing available data anyway.\n'));
  }

  const allLogs = getLogs();
  const commits = getCommitsInRange(allLogs, range.from, range.to);
  
  if (commits.length === 0) {
    printNoData();
    return;
  }

  const config = getConfig();
  const allHistory = await getShellHistory(config.shell || 'zsh');
  const history = allHistory.filter(item => {
    if (!item.date) return false;
    const d = new Date(item.date);
    return d >= range.from && d <= range.to;
  });

  const groupedCommits = groupByDate(commits.map(c => ({...c, date: new Date(c.date)})));
  const sortedDates = Object.keys(groupedCommits).sort((a, b) => b.localeCompare(a));
  
  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = sortedDates[i];
    const dayCommits = groupedCommits[dateStr];
    
    // get shell history for this specific day
    const dayHistory = history.filter(item => item.date.toISOString().split('T')[0] === dateStr);
    
    const d = new Date(`${dateStr}T12:00:00Z`);
    
    if (i > 0) {
      console.log(chalk.gray('  · · ·\n'));
    }
    printDayLog(d, dayCommits, dayHistory);
  }
  
  const rangeFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fromStr = rangeFormat.format(range.from);
  const toStr = rangeFormat.format(range.to);
  let rangeDisplay = fromStr;
  if (fromStr !== toStr) {
    rangeDisplay = `${fromStr} – ${toStr}`;
  }
  
  console.log(chalk.gray(`  Showing ${commits.length} commits from ${rangeDisplay}\n`));
}
