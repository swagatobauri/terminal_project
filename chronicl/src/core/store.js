/**
 * store.js — local persistence via conf
 *
 * All data lives on the user's machine. No cloud, no API.
 * Keys are namespaced to avoid collisions with other tools.
 */

import Conf from 'conf';

// One Conf instance for the entire app
const store = new Conf({ projectName: 'chronicl' });

const KEYS = {
  config: 'chronicl-config',
  logs:   'chronicl-logs',
  repos:  'chronicl-repos',
};

// --- Config ---

export function getConfig() {
  return store.get(KEYS.config) ?? {};
}

export function saveConfig(data) {
  const current = getConfig();
  store.set(KEYS.config, { ...current, ...data });
}

// --- Logs (indexed commit + shell entries) ---

export function getLogs() {
  return store.get(KEYS.logs) ?? [];
}

export function saveLogs(logs) {
  store.set(KEYS.logs, logs);
}

// --- Repos (list of discovered repo paths) ---

export function getRepos() {
  return store.get(KEYS.repos) ?? [];
}

export function saveRepos(repos) {
  store.set(KEYS.repos, repos);
}
