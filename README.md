```
████████  ████████ ██     ██      ██████     ███    ████  ███████  ██    ██ ████████
██     ██ ██       ██     ██     ██    ██   ██ ██    ██  ██     ██ ██   ██  ██
██     ██ ██       ██     ██     ██        ██   ██   ██  ██     ██ ██  ██   ██
██     ██ ██████   ██     ██     ██       ██     ██  ██  ██     ██ █████    ██████
██     ██ ██        ██   ██      ██       █████████  ██  ██     ██ ██  ██   ██
██     ██ ██         ██ ██   ███ ██    ██ ██     ██  ██  ██     ██ ██   ██  ██
████████  ████████    ███    ███  ██████  ██     ██ ████  ███████  ██    ██ ██

dev.caiokf.com
```

# dev.caiokf.com

Developer profile and portfolio featuring an interactive tech radar, devlog and experience timeline

[![Homepage Screenshot](https://api.microlink.io/?url=https://dev.caiokf.com&screenshot=true&meta=false&embed=screenshot.url)](https://dev.caiokf.com)

## Features

- **About** - Bio and skills overview
- **Tech Radar** - Interactive D3.js visualization of technology opinions with desktop SVG and mobile list views
- **Devlog** - Markdown-based development log with tag filtering, week grouping, and contribution matrix
- **Experience** - Career timeline with company logos and tech stacks
- **Theming** - Light/dark mode with system preference detection

## Development

Developed mostly with [Claude Code](https://anthropic.com/claude), demonstrating practical AI-assisted development through.

## Project Structure

```
├── apps/web/                         # Vue 3 frontend application
├── services/
│   ├── devlog-slack-workflow/        # Trigger.dev tasks for Slack → devlog automation
│   └── devlog-slack-webhook-worker/  # Cloudflare worker for webhook handling
├── packages/shared/                  # Shared utilities
└── .claude/                          # AI assistant configuration
```

## Tech Stack

**Frontend:**

- Vue 3 + TypeScript + Composition API
- D3.js for tech radar visualization
- Vite for build tooling
- Vitest for testing

**Backend/Automation:**

- Trigger.dev v4 for serverless task orchestration
- Cloudflare Workers for webhook handling
- Anthropic SDK + Octokit for content automation

## Attribution

This project's tech radar visualization was inspired by [Thoughtworks' Build Your Own Radar](https://github.com/thoughtworks/build-your-own-radar) (AGPL-3.0), though implemented independently using Vue 3 and D3.js.

## License

MIT
