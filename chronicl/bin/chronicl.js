#!/usr/bin/env node

import { program } from 'commander'
import chalk from 'chalk'
import figlet from 'figlet'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// commands
import { runConfig } from '../src/commands/config.js'
import { runScan } from '../src/commands/scan.js'
import { runLog } from '../src/commands/log.js'
import { runAsk } from '../src/commands/ask.js'
import { runStats } from '../src/commands/stats.js'
import { runSummary } from '../src/commands/summary.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))

program
  .name('chronicl')
  .description('Your terminal dev journal')
  .version(pkg.version)

program
  .command('config')
  .description('First time setup')
  .action(runConfig)

program
  .command('scan')
  .description('Scan and index your git repos')
  .action(runScan)

program
  .command('log')
  .description('Show your dev journal')
  .option('--week', 'show this week')
  .option('--date <date>', 'show a specific date')
  .action(runLog)

program
  .command('ask <query>')
  .description('Ask about a date or period')
  .action(runAsk)

program
  .command('stats')
  .description('Your dev stats and streaks')
  .action(runStats)

program
  .command('summary')
  .description('Weekly wrap-up')
  .action(runSummary)

// show banner if no command given
if (process.argv.length === 2) {
  console.log(chalk.cyan(figlet.textSync('chronicl', { font: 'Standard' })))
  console.log(chalk.gray('  your terminal dev journal\n'))
  program.help()
}

program.parse()
