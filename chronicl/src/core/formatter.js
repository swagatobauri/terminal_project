import chalk from 'chalk';
import Table from 'cli-table3';
import figlet from 'figlet';
import { format, isToday, isYesterday } from 'date-fns';
import { extractKeywords } from './gitReader.js';

export function printBanner() {
  const banner = figlet.textSync('chronicl', { font: 'Standard' });
  console.log(chalk.cyan(banner));
  console.log(chalk.gray('  your terminal dev journal\n'));
}

export function formatTime(date) {
  return format(date, 'h:mm a');
}

export function formatRelativeDate(date) {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMMM d');
}

export function printDayLog(date, commits, shellCommands) {
  const line = chalk.gray('─'.repeat(45));
  
  console.log(line);
  console.log(`  📅  ${chalk.white.bold(formatRelativeDate(date))}  `);
  console.log(line + '\n');
  
  console.log(chalk.blue.bold(`  🔀 Git Activity  (${commits.length} commits)\n`));
  
  if (commits.length === 0) {
    console.log(chalk.gray("  No commits recorded\n"));
  } else {
    for (const commit of commits) {
      const timeStr = formatTime(commit.date);
      const paddedTime = timeStr.padStart(8, ' ');
      console.log(`  ${chalk.magenta('◆')} ${chalk.yellow(commit.hash)}  ${chalk.white(commit.message)}  [${chalk.cyan(commit.repo)}]  ${chalk.gray(paddedTime)}`);
    }
    console.log('');
  }
  
  console.log(chalk.blue.bold(`  🐚 Terminal Activity  (${shellCommands.length} commands)\n`));
  
  if (shellCommands.length === 0) {
    console.log(chalk.gray("  No terminal activity recorded\n"));
  } else {
    const cmdCounts = {};
    for (const sc of shellCommands) {
      const base = sc.command.trim().split(/\s+/)[0];
      cmdCounts[base] = (cmdCounts[base] || 0) + 1;
    }
    const sortedCmds = Object.entries(cmdCounts).sort((a, b) => b[1] - a[1]);
    const mostUsed = sortedCmds.slice(0, 4).map(e => e[0]).join(', ');
    
    const notableSet = new Set();
    for (const sc of shellCommands) {
      if (sc.command.split(/\s+/).length >= 2) {
        notableSet.add(sc.command);
        if (notableSet.size >= 3) break;
      }
    }
    const notable = Array.from(notableSet).join(', ') || 'None';
    
    console.log(`  Most used: ${mostUsed}`);
    console.log(`  Notable:   ${notable}\n`);
  }
  
  console.log(line + '\n');
}

export function printWeekSummary(weekData) {
  console.log(chalk.blue.bold('\n  📊 This Week at a Glance\n'));
  
  const table = new Table({
    head: [chalk.bold('Day'), chalk.bold('Commits'), chalk.bold('Top Repos'), chalk.bold('Focus')],
    style: { head: [], border: ['dim'] }
  });
  
  const sortedDates = Object.keys(weekData).sort((a, b) => a.localeCompare(b));
  
  for (const dateStr of sortedDates) {
    const data = weekData[dateStr];
    const commits = data.commits || [];
    
    const dateObj = new Date(`${dateStr}T12:00:00Z`);
    const dayName = formatRelativeDate(dateObj);
    
    const isTdy = isToday(dateObj);
    const dayDisplay = isTdy ? chalk.bold(dayName) : dayName;
    
    const commitCount = commits.length > 0 ? commits.length.toString() : chalk.gray('—');
    
    const repoSet = new Set();
    commits.forEach(c => repoSet.add(c.repo));
    const reposStr = Array.from(repoSet).slice(0, 2).join(', ') || chalk.gray('—');
    
    const keywords = extractKeywords(commits.map(c => c.message));
    const focusStr = keywords.slice(0, 2).join(', ') || chalk.gray('—');
    
    table.push([dayDisplay, commitCount, reposStr, focusStr]);
  }
  
  console.log(table.toString() + '\n');
}

export function printNoData() {
  console.log(chalk.yellow('⚠️  No commits found for this period. Run chronicl scan first.\n'));
}
