import test from 'node:test';
import assert from 'node:assert';
import { formatTime, formatRelativeDate, printDayLog, printNoData } from '../src/core/formatter.js';

test('formatTime returns expected format', () => {
  const d = new Date('2025-01-14T10:23:00');
  const res = formatTime(d);
  assert.strictEqual(res, '10:23 AM');
});

test('formatRelativeDate returns Yesterday for yesterday', () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const res = formatRelativeDate(d);
  assert.strictEqual(res, 'Yesterday');
});

test('printDayLog does not throw and output looks right', () => {
  const originalLog = console.log;
  let output = '';
  console.log = (str) => {
    output += (str || '') + '\n';
  };
  
  try {
    const d = new Date('2025-01-14T10:23:00Z');
    const commits = [
      { hash: 'a1b2c3d', message: 'test msg', date: d, repo: 'myrepo' }
    ];
    
    printDayLog(d, commits, []);
    
    assert.ok(output.includes('a1b2c3d'), 'Contains commit hash');
    assert.ok(output.includes('myrepo'), 'Contains repo name');
    assert.ok(output.includes('Git Activity'), 'Contains Git Activity header');
  } finally {
    console.log = originalLog;
  }
});

test('printNoData outputs correct message', () => {
  const originalLog = console.log;
  let output = '';
  console.log = (str) => {
    output += (str || '') + '\n';
  };
  
  try {
    printNoData();
    assert.ok(output.includes('chronicl scan'), 'Contains suggestion to scan');
  } finally {
    console.log = originalLog;
  }
});
