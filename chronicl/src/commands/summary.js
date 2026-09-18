import chalk from 'chalk';
import Table from 'cli-table3';
import { getLogs } from '../core/store.js';
import { getCommitsInRange, getTopRepos, getMostActiveHour } from '../core/parser.js';
import { extractKeywords } from '../core/gitReader.js';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export async function runSummary() {
  const allLogs = getLogs();
  
  const now = new Date();
  const from = startOfWeek(now, { weekStartsOn: 1 });
  const to = endOfWeek(now, { weekStartsOn: 1 });
  
  const commits = getCommitsInRange(allLogs, from, to);
  
  const divider = chalk.gray('══════════════════════════════════════════');
  
  const fromStr = format(from, 'MMM d');
  const toStr = format(to, 'MMM d, yyyy');
  
  console.log(divider);
  console.log(`  📋  ${chalk.white.bold('Weekly Summary')}`);
  console.log(chalk.gray(`  Week of ${fromStr} – ${toStr}`));
  console.log(divider + '\n');

  if (commits.length === 0) {
    console.log(chalk.gray('  No commits found for this week.\n'));
    console.log(divider + '\n');
    return;
  }
  
  const topRepos = getTopRepos(commits, 5);
  const totalRepos = topRepos.length;
  
  const dayCounts = {};
  commits.forEach(c => {
    const day = format(new Date(c.date), 'EEEE');
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const mostProductiveDay = Object.entries(dayCounts).sort((a,b) => b[1] - a[1])[0];
  
  const peakHour = getMostActiveHour(commits);
  
  const allKeywords = extractKeywords(commits.map(c => c.message));
  const mainFocus = allKeywords.slice(0, 3).join(', ') || 'None';

  console.log(`  You made ${chalk.bold(commits.length)} commits across ${chalk.bold(totalRepos)} repos this week.`);
  console.log(`  Most productive day: ${chalk.bold(mostProductiveDay[0])} (${mostProductiveDay[1]} commits)`);
  console.log(`  Peak hour: ${chalk.bold(peakHour)}`);
  console.log(`  Main focus areas: ${chalk.bold(mainFocus)}\n`);
  
  console.log(`  📁 By Repo:`);
  
  const table = new Table({
    head: [chalk.bold('Repo'), chalk.bold('Commits'), chalk.bold('What you worked on')],
    style: { head: [], border: ['dim'] }
  });
  
  for (const r of topRepos) {
    const repoCommits = commits.filter(c => c.repo === r.repo);
    const kw = extractKeywords(repoCommits.map(c => c.message));
    const focusStr = kw.slice(0, 3).join(', ') || chalk.gray('—');
    
    table.push([r.repo, r.count, focusStr]);
  }
  
  console.log(table.toString().split('\n').map(l => '  ' + l).join('\n'));
  
  console.log(chalk.gray('\n  💡 "What you worked on" = top 3 keywords from commit messages'));
  console.log(chalk.gray('     extracted per repo using extractKeywords from gitReader.js\n'));
  
  console.log(divider + '\n');
}
