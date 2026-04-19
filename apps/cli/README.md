# @iprep/cli

Command-line interface for iPrep. Built with Commander.js and Chalk.

## Installation

```bash
npm install -g iprep
```

Or run without installing:

```bash
npx iprep <command>
```

## Commands

### onboard

First-time setup — creates `~/.iprep/` directory structure and copies default tutor configs.

```bash
iprep onboard
```

### start

Start the iPrep server and open the web UI in your browser.

```bash
iprep start
```

### status

Check if the iPrep server is currently running.

```bash
iprep status
```

### chat

Send a single message to a tutor directly from the terminal.

```bash
iprep chat "What is a dangling modifier?" --tutor english-coach
iprep chat "Tell me about yourself" --tutor interview-prep
```

## Development

```bash
pnpm run dev
```

## Notes

- All commands require Claude Code CLI to be installed and authenticated (`claude` login).
- Run `iprep onboard` once before first use to set up `~/.iprep/`.
- Tutor configs live at `~/.iprep/aitutors/{tutorId}/`.
