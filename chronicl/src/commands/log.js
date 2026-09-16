import { getConfig, getLogs } from '../core/store.js';
import { getShellHistory, getCommandsForDate } from '../core/historyReader.js';
import { printBanner, printDayLog, printWeekSummary, printNoData } from '../core/formatter.js';
import { groupByDate } from '../core/gitReader.js';
import chalk from 'chalk';

function parseDateString(dateStr) {
  const lower = dateStr.toLowerCase();
  if (lower === 'today') return new Date();
  if (lower === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  return new Date(); // fallback to today for unknown strings like "last tuesday"
}

export async function runLog(options) {
  const config = getConfig();
  const allCommits = getLogs();
  
  const commits = allCommits.map(c => ({
    ...c,
    date: new Date(c.date)
  }));
  
  if (commits.length === 0) {
    printNoData();
    return;
  }
  
  const history = await getShellHistory(config.shell || 'zsh');
  
  if (options.week) {
    printBanner();
    
    const groupedCommits = groupByDate(commits);
    const weekData = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weekData[dateStr] = { commits: [], shell: [] };
    }
    
    for (const [dateStr, dayCommits] of Object.entries(groupedCommits)) {
      if (weekData[dateStr]) {
        weekData[dateStr].commits = dayCommits;
      }
    }
    
    printWeekSummary(weekData);
    return;
  }
  
  let targetDate = new Date();
  if (options.date) {
    targetDate = parseDateString(options.date);
  }
  
  const targetDateStr = targetDate.toISOString().split('T')[0];
  const groupedCommits = groupByDate(commits);
  
  const dayCommits = groupedCommits[targetDateStr] || [];
  const dayShell = getCommandsForDate(history, targetDate);
  
  printBanner();
  printDayLog(targetDate, dayCommits, dayShell);
  
  if (!options.week && !options.date) {
    console.log(chalk.gray('  Tip: run chronicl log --week for your weekly summary\n'));
  }
}
