#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';
import { program } from '../src/cli.js';

// When invoked with no subcommand, show the banner then the help text.
if (process.argv.length === 2) {
  const banner = figlet.textSync('chronicl', { font: 'Slant' });
  console.log(chalk.cyan(banner));
  console.log(chalk.dim('  Your terminal dev journal.\n'));
  program.help(); // prints help and exits 0
}

program.parseAsync(process.argv);
