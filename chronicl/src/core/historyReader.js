import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const NOISE_COMMANDS = new Set(['ls', 'cd', 'clear', 'pwd', 'cat', 'echo', 'man', 'history']);

function isNoise(cmd) {
  const base = cmd.trim().split(/\s+/)[0];
  return NOISE_COMMANDS.has(base);
}

export async function getShellHistory(shellType, options = {}) {
  const home = os.homedir();
  let historyPath = '';
  
  if (shellType === 'zsh') historyPath = path.join(home, '.zsh_history');
  else if (shellType === 'bash') historyPath = path.join(home, '.bash_history');
  else if (shellType === 'fish') historyPath = path.join(home, '.local/share/fish/fish_history');
  else historyPath = path.join(home, '.zsh_history');

  try {
    const content = await fs.readFile(historyPath, 'utf-8');
    const lines = content.split('\n');
    const results = [];
    
    if (shellType === 'zsh') {
      for (const line of lines) {
        if (!line) continue;
        const match = line.match(/^:\s*(\d+):\d+;(.*)$/);
        if (match) {
          const timestamp = parseInt(match[1], 10) * 1000;
          const command = match[2];
          if (!isNoise(command)) {
            results.push({ command, date: new Date(timestamp), shell: 'zsh' });
          }
        }
      }
    } else if (shellType === 'fish') {
      let currentCmd = null;
      for (const line of lines) {
        const cmdMatch = line.match(/^- cmd:\s*(.*)$/);
        const whenMatch = line.match(/^\s*when:\s*(\d+)$/);
        
        if (cmdMatch) {
          currentCmd = cmdMatch[1];
        } else if (whenMatch && currentCmd) {
          if (!isNoise(currentCmd)) {
            const timestamp = parseInt(whenMatch[1], 10) * 1000;
            results.push({ command: currentCmd, date: new Date(timestamp), shell: 'fish' });
          }
          currentCmd = null;
        }
      }
    } else {
      // bash or unknown - no guaranteed timestamps
      for (const line of lines) {
        if (!line) continue;
        if (!isNoise(line)) {
          results.push({ command: line.trim(), date: null, shell: shellType || 'bash' });
        }
      }
      return results.slice(-200);
    }
    
    return results;
  } catch (err) {
    // Return empty array silently if history file isn't found or unreadable
    return [];
  }
}

export function getCommandsForDate(history, targetDate) {
  const targetStr = targetDate.toISOString().split('T')[0];
  return history.filter(item => {
    if (!item.date) return false;
    return item.date.toISOString().split('T')[0] === targetStr;
  });
}
