/**
 * cli.js — commander setup
 *
 * Wires every subcommand to its handler. Kept flat and readable.
 */

import { Command } from 'commander';
import { runConfig }  from './commands/config.js';
import { runLog }     from './commands/log.js';
import { runAsk }     from './commands/ask.js';
import { runScan }    from './commands/scan.js';
import { runSummary } from './commands/summary.js';
import { runStats }   from './commands/stats.js';

export const program = new Command();

program
  .name('chronicl')
  .description('Your terminal dev journal. Auto-tracks what you built.')
  .version('0.1.0');

program
  .command('config')
  .description('First-time setup — configure your projects directory, shell, and name')
  .action(runConfig);

program
  .command('scan')
  .description('Walk your projects directory and index all git repos')
  .action(runScan);

program
  .command('log')
  .description('Show your journal for today (or pass --week for this week)')
  .option('-w, --week', 'Show the full week instead of just today')
  .action(runLog);

program
  .command('ask <query>')
  .description('Ask what you worked on — e.g. chronicl ask "last tuesday"')
  .action(runAsk);

program
  .command('summary')
  .description('Weekly wrap-up across all indexed repos')
  .action(runSummary);

program
  .command('stats')
  .description('Commit streaks, most active hours, top repos')
  .action(runStats);
