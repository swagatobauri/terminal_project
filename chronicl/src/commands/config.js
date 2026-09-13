/**
 * config.js — chronicl config
 *
 * Interactive first-time setup. Asks a few questions and saves the answers
 * locally so every other command knows where your projects live.
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { homedir } from 'os';
import { saveConfig } from '../core/store.js';

export async function runConfig() {
  console.log(chalk.bold.cyan('\n  chronicl setup\n'));
  console.log(chalk.dim('  Answer a few quick questions to get started.\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectsDir',
      message: 'Where are your projects? Enter a directory path:',
      default: `${homedir()}/Developer`,
    },
    {
      type: 'list',
      name: 'shell',
      message: 'What shell do you use?',
      choices: ['zsh', 'bash', 'fish'],
      default: 'zsh',
    },
    {
      type: 'input',
      name: 'name',
      message: 'Your name for journal entries:',
      default: process.env.USER ?? 'developer',
    },
  ]);

  saveConfig(answers);

  console.log(
    chalk.green('\n  ✓ chronicl is ready. Run chronicl scan to index your repos.\n')
  );
}
