import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getConfig, saveRepos, saveLogs } from '../core/store.js';
import { findRepos, getCommits } from '../core/gitReader.js';

export async function runScan() {
  const config = getConfig();

  if (!config.projectsDir) {
    console.log(chalk.red('✗ No config found. Please run "chronicl config" first.'));
    process.exit(1);
  }

  const spinner = ora('Scanning for git repos...').start();

  const repos = await findRepos(config.projectsDir);

  if (repos.length === 0) {
    spinner.fail(`No git repositories found in ${config.projectsDir}`);
    return;
  }

  spinner.text = `Found ${repos.length} repos, reading commit history...`;

  let totalCommits = 0;
  const allCommits = [];
  const repoStats = [];

  for (const repoPath of repos) {
    const commits = await getCommits(repoPath);
    allCommits.push(...commits);
    totalCommits += commits.length;

    // Use ISO string formatted date for the table, or "N/A" if no commits in range
    const lastCommit = commits.length > 0 
      ? commits[0].date.toISOString().split('T')[0] 
      : 'N/A';

    repoStats.push([
      commits.length > 0 ? commits[0].repo : repoPath.split('/').pop(),
      commits.length,
      lastCommit
    ]);
  }

  spinner.text = 'Building your journal...';

  saveRepos(repos);
  saveLogs(allCommits);

  spinner.stop();

  const table = new Table({
    head: [chalk.bold('Repo'), chalk.bold('Commits (30d)'), chalk.bold('Last Commit')],
    style: { head: [], border: ['dim'] }
  });

  // Sort repoStats by number of commits descending
  repoStats.sort((a, b) => b[1] - a[1]);
  for (const row of repoStats) {
    table.push(row);
  }

  console.log('\n' + table.toString() + '\n');
  console.log(chalk.green(`✓ Indexed ${repos.length} repos, ${totalCommits} total commits`));
  console.log(chalk.dim('Run chronicl log to see your journal\n'));
}
