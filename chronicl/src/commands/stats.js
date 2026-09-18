import chalk from 'chalk';
import { getLogs } from '../core/store.js';
import { 
  getCurrentStreak, getLongestStreak, getMostActiveHour, getTopRepos 
} from '../core/parser.js';
import { subDays, startOfDay, endOfDay } from 'date-fns';

function generateBar(count, maxCount) {
  const totalBlocks = 16;
  if (maxCount === 0) return chalk.gray('░'.repeat(totalBlocks));
  const filled = Math.round((count / maxCount) * totalBlocks);
  const empty = totalBlocks - filled;
  return chalk.cyan('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

export async function runStats() {
  const allLogs = getLogs();
  
  const currentStreak = getCurrentStreak(allLogs);
  const longestStreak = getLongestStreak(allLogs);
  const mostActiveHour = getMostActiveHour(allLogs);
  
  // Last 30 days calculation
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const commits30d = allLogs.filter(c => {
    const d = new Date(c.date);
    return d >= startOfDay(thirtyDaysAgo) && d <= endOfDay(now);
  });
  
  const totalRepos = new Set(allLogs.map(c => c.repo)).size;
  const totalCommits30d = commits30d.length;

  const longestStreakRange = longestStreak.days > 0 
    ? ` (${longestStreak.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${longestStreak.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
    : '';

  const divider = chalk.gray('══════════════════════════════════════════');
  const thinDivider = chalk.gray('──────────────────────────────────────────');
  
  console.log(divider);
  console.log(`  📊  ${chalk.white.bold('Your Dev Stats')}`);
  console.log(divider + '\n');
  
  console.log(`  🔥 Current Streak      ${chalk.bold(currentStreak.days + ' days')}`);
  console.log(`  🏆 Longest Streak      ${chalk.bold(longestStreak.days + ' days')} ${chalk.gray(longestStreakRange)}`);
  console.log(`  ⚡ Most Active Hour    ${chalk.bold(mostActiveHour)}`);
  console.log(`  📁 Total Repos         ${chalk.bold(totalRepos)}`);
  console.log(`  📝 Total Commits       ${chalk.bold(totalCommits30d)}  ${chalk.gray('(last 30 days)')}\n`);

  console.log(thinDivider);
  console.log(`  🏅 ${chalk.white.bold('Top Repos  (last 30 days)')}`);
  console.log(thinDivider + '\n');

  const topRepos = getTopRepos(commits30d, 5);
  if (topRepos.length === 0) {
    console.log(chalk.gray('  No commits in the last 30 days.\n'));
  } else {
    const maxRepoCommits = Math.max(...topRepos.map(r => r.count));
    topRepos.forEach((repo, i) => {
      const name = repo.repo.padEnd(16, ' ');
      const bar = generateBar(repo.count, maxRepoCommits);
      const count = String(repo.count).padStart(3, ' ');
      console.log(`  ${i + 1}.  ${name}  ${bar}  ${count} commits`);
    });
    console.log('');
  }

  console.log(thinDivider);
  console.log(`  📅 ${chalk.white.bold('Last 7 Days')}`);
  console.log(thinDivider + '\n');

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const commits7dMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = subDays(now, i);
    commits7dMap[d.toISOString().split('T')[0]] = 0;
  }
  
  commits30d.forEach(c => {
    const dateStr = new Date(c.date).toISOString().split('T')[0];
    if (commits7dMap[dateStr] !== undefined) {
      commits7dMap[dateStr]++;
    }
  });

  const maxDaily = Math.max(...Object.values(commits7dMap), 1);
  
  const last7DaysStrings = Object.keys(commits7dMap).sort((a,b) => a.localeCompare(b));
  const todayStr = now.toISOString().split('T')[0];
  
  for (const dateStr of last7DaysStrings) {
    const d = new Date(`${dateStr}T12:00:00Z`);
    const dayName = dayNames[d.getDay()].padEnd(4, ' ');
    const count = commits7dMap[dateStr];
    
    const totalBlocks = 8;
    const filled = Math.round((count / maxDaily) * totalBlocks);
    const empty = totalBlocks - filled;
    const bar = chalk.cyan('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    
    const todayArrow = (dateStr === todayStr) ? chalk.gray('  ← today') : '';
    console.log(`  ${dayName}  ${bar}  ${count}${todayArrow}`);
  }
  
  console.log('\n' + divider + '\n');
}
