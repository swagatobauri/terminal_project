# chronicl 📓

> Your terminal dev journal. Automatically tracks what you built — across every repo, every day.

---

## What is chronicl?

Developers are terrible at remembering what they actually worked on. You finish a big week, your manager asks for a status update, and you're staring at a blank document trying to reconstruct five days of work from memory. Sound familiar?

chronicl solves this by doing the archaeology for you. It quietly reads your git commit history across all of your local repositories and your shell command history, then stitches it together into a clear, beautiful timeline — organized by day, by week, or by repo. No forms to fill out, no tags to remember, no habits to build. You just code, and chronicl tracks.

Everything runs entirely on your machine. There's no cloud sync, no AI model making things up, no API keys to manage, and no subscription. Your journal is yours — a local index of what you actually built, when you built it, rendered beautifully right in your terminal.

---

## Features

- 📁 **Scans all your local git repos automatically** — point it at your projects folder once, it finds everything
- 📅 **Daily and weekly summaries** of your commits, grouped and formatted cleanly
- 🔍 **Ask what you worked on** any given day or week in plain language
- 📊 **Stats** — commit streaks, most active hours, your top repos
- 🐚 **Reads your shell history** for extra context beyond commits
- 💾 **Everything stored locally** — no cloud, no AI, no API keys, no subscriptions
- 🎨 **Beautiful terminal output** with colors, ASCII art, and clean tables

---

## Install

```bash
npm install -g chronicl
```

Requires Node.js 18 or later.

---

## Quick Start

```bash
# 1. First-time setup — takes 30 seconds
chronicl config

# 2. Index your repos (walks your projects directory)
chronicl scan

# 3. See what you did today
chronicl log

# 4. See your whole week
chronicl log --week

# 5. Ask about a specific day
chronicl ask "last tuesday"

# 6. Get a weekly wrap-up summary
chronicl summary

# 7. View streaks and patterns
chronicl stats
```

---

## Commands

| Command | Description | Example |
|---|---|---|
| `config` | Interactive first-time setup | `chronicl config` |
| `scan` | Index all git repos in your projects directory | `chronicl scan` |
| `log` | Show today's journal entries | `chronicl log` |
| `log --week` | Show this week's journal | `chronicl log --week` |
| `ask <query>` | Ask what you worked on in plain language | `chronicl ask "last monday"` |
| `summary` | Weekly wrap-up across all repos | `chronicl summary` |
| `stats` | Commit streaks, active hours, top repos | `chronicl stats` |

---

## How It Works

1. **`chronicl config`** saves your projects directory path, shell type, and name locally using [`conf`](https://github.com/sindresorhus/conf).

2. **`chronicl scan`** walks your configured projects directory, finds every folder with a `.git` subdirectory, and stores the list of repo paths locally. It uses [`simple-git`](https://github.com/steveukx/git-js) under the hood.

3. **`chronicl log`** reads commit history from all indexed repos using `simple-git`, groups them by date using [`date-fns`](https://date-fns.org/), and renders a clean timeline using [`chalk`](https://github.com/chalk/chalk) and [`cli-table3`](https://github.com/cli-table/cli-table3).

4. **`chronicl ask`** parses your natural-language query (e.g. `"last tuesday"`) into a date range, then filters the indexed commit history to that window.

5. **Shell history** is read directly from `~/.zsh_history`, `~/.bash_history`, or the fish history file — depending on what you configured. Commands are stripped of timestamps and presented alongside your commits for fuller context.

6. **All data** is persisted locally in a JSON file managed by `conf`. Nothing ever leaves your machine.

---

## Philosophy

No AI. No cloud. No subscriptions. Just your data, on your machine, beautifully presented.

chronicl believes your development history is yours. It shouldn't require an account, an API key, or a monthly fee to access a clean view of what you've already done. The best developer tool is one that gets out of the way — so chronicl does its work silently and shows you results instantly.

---

## Contributing

Contributions are welcome! Here's how to get started:

```bash
# Fork and clone the repo
git clone https://github.com/your-username/chronicl.git
cd chronicl

# Install dependencies
npm install

# Run the CLI locally
node bin/chronicl.js config

# Run tests
npm test
```

Please keep PRs focused — one feature or fix per PR. Code should be readable and lightly commented. Avoid adding dependencies unless there's a strong reason.

Open an issue first if you're planning a larger change, so we can discuss the approach before you invest time in it.

---

## License

MIT — do whatever you want with it.

---

*Built with Node.js, chalk, commander, simple-git, date-fns, figlet, cli-table3, conf, ora, and inquirer.*
