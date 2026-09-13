/**
 * historyReader.js — reads the user's shell history file
 *
 * Supports zsh, bash, and fish. Returns lines as plain strings
 * (with timestamps stripped for zsh extended history format).
 */

import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { existsSync } from 'fs';

const HISTORY_FILES = {
  zsh:  `${homedir()}/.zsh_history`,
  bash: `${homedir()}/.bash_history`,
  fish: `${homedir()}/.local/share/fish/fish_history`,
};

/**
 * Read and parse the history file for the given shell.
 * @param {string} shell  One of: zsh | bash | fish
 * @param {number} [limit=500]  Max number of lines to return (most recent)
 * @returns {Promise<string[]>} Command lines
 */
export async function readHistory(shell = 'zsh', limit = 500) {
  const filePath = HISTORY_FILES[shell] ?? HISTORY_FILES.zsh;

  if (!existsSync(filePath)) return [];

  const raw = await readFile(filePath, 'utf8');
  const lines = raw.split('\n').filter(Boolean);

  const commands = lines
    .map((line) => {
      // zsh extended history format: ": <timestamp>:<elapsed>;<command>"
      if (shell === 'zsh' && line.startsWith(': ')) {
        return line.replace(/^: \d+:\d+;/, '').trim();
      }
      // fish history is YAML-ish — grab the "cmd:" lines
      if (shell === 'fish' && line.startsWith('- cmd:')) {
        return line.replace('- cmd:', '').trim();
      }
      return line.trim();
    })
    .filter(Boolean);

  // Return the most recent N commands
  return commands.slice(-limit);
}
