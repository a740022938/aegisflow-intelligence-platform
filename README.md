# AegisFlow Intelligence Platform (AIP)

天枢智治平台 — 面向数据-训练-评估-发布全流程的本地化智能治理平台。

**AIP v7.2.0 Stable** | Build 2026.04.29 | Community Edition

---

## Overview

AIP is a local-first AI governance platform that covers the full ML lifecycle: data management, training, evaluation, deployment, and audit. It runs entirely on your machine with SQLite and Node.js — no cloud required.

- **Workflow Composer**: Visual pipeline editor with step-level tracing
- **Governance Hub**: Central dashboard for incidents, approvals, and audit
- **Self-Learning Flywheel**: Dataset → train → evaluate → archive → feedback loop (YOLO, classification, vision pipelines)
- **Plugin System**: 8 builtin plugins (rule engine, report pack, SAM vision, badcase miner, etc.)
- **OpenClaw Integration**: Bidirectional command bridge, heartbeat, circuit breaker
- **Official CLI**: `aip start / status / health / doctor / logs / open / stop`

---

## Quick Start

### Prerequisites

- Node.js >= 22
- pnpm 9.x
- Git

### Install

```bash
git clone https://github.com/a740022938/aegisflow-intelligence-platform.git
cd aegisflow-intelligence-platform
pnpm install
```

### Configure

```bash
cp .env.example .env.local
# Edit .env.local as needed
```

### Initialize Database

```bash
pnpm run db:init
```

### Start

```bash
pnpm run dev
```

Or use the CLI:

```bash
aip start
```

### Access

| Service | URL |
|---------|-----|
| Web UI | http://127.0.0.1:5173 |
| Local API | http://127.0.0.1:8787 |
| API Docs (Swagger) | http://127.0.0.1:8787/docs |
| Health | http://127.0.0.1:8787/api/health |

---

## CLI Commands

```bash
aip start          # Start API + Web services
aip stop           # Stop all services
aip restart        # Restart all services
aip status         # Show service status
aip health         # Check API health
aip logs           # Tail API + Web logs
aip logs api       # Tail API log only
aip logs web       # Tail Web log only
aip open           # Open Web UI in browser
aip version        # Show CLI and Core versions
aip doctor         # Run 11-point system diagnostics
aip config init    # Initialize config (~/.aip/config.json)
aip config set home <path>   # Set project path
aip gateway status # Show gateway status
```

---

## Build & Quality

```bash
pnpm run build       # Production build (Web UI)
pnpm run lint        # ESLint check (--max-warnings 0)
pnpm run typecheck   # TypeScript type checking
pnpm run db:doctor   # Database diagnostics
pnpm run test:smoke  # Smoke tests (requires API running)
pnpm run preview     # Preview production build
```

---

## Project Structure

```
aegisflow-intelligence-platform/
├── apps/
│   ├── local-api/          # Backend API (Fastify + TypeScript)
│   ├── web-ui/             # Frontend (React + Vite + TypeScript)
│   └── aip-cli/            # Official CLI tool
├── packages/
│   ├── db/                 # Database (SQLite, migrations)
│   ├── logger/             # Logging utilities
│   ├── plugin-runtime/     # Plugin lifecycle manager
│   ├── plugin-sdk/         # Plugin development SDK
│   ├── shared-types/       # Shared TypeScript types
│   ├── storage/            # File storage utilities
│   ├── task-engine/        # Task execution engine
│   └── template-engine/    # Template rendering engine
├── plugins/
│   └── builtin/            # 8 builtin plugins
├── workers/
│   └── python-worker/      # Python scripts (training, eval, vision)
├── scripts/                # Maintenance and upgrade scripts
├── templates/              # Workflow templates
├── docs/                   # Architecture and release documentation
├── tests/                  # Smoke tests
├── docker/                 # Docker configuration
├── api-tests/              # HTTP API tests
├── .env.example            # Configuration template
├── Makefile                # Build commands
├── package.json            # Root package manifest
└── README.md
```

---

## Configuration

All configuration is managed through environment variables (via `.env.local`). Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LOCAL_API_PORT` | 8787 | API server port |
| `WEB_UI_PORT` | 5173 | Web UI dev server port |
| `OPENCLAW_BASE_URL` | http://127.0.0.1:18789 | OpenClaw gateway address |
| `OPENCLAW_HEARTBEAT_TOKEN` | (required) | Heartbeat authentication token |
| `OPENCLAW_ADMIN_TOKEN` | (required) | Admin operations token |
| `JWT_SECRET` | (required) | JWT signing secret |
| `WORKER_POOL_MIN` | 2 | Python worker pool min size |
| `WORKER_POOL_MAX` | 8 | Python worker pool max size |
| `QUEUE_CONCURRENCY` | 4 | Task queue concurrency |

See `.env.example` for the full list.

---

## OpenClaw Integration

AIP integrates with [OpenClaw](https://github.com/anomalyco/opencode) for bidirectional AI agent orchestration:

- **Master Switch**: Enable/disable OpenClaw execution layer
- **Heartbeat**: Health monitoring with configurable timeout
- **Circuit Breaker**: Automatic fail-safe (3 failures → triggered)
- **Command Bridge**: Pause/resume/cancel/retry workflow jobs from OpenClaw
- **Intent Engine**: Natural language → workflow template resolution
- **Capability Discovery**: `GET /api/openclaw/capabilities`

Configure `OPENCLAW_HEARTBEAT_TOKEN` and `OPENCLAW_ADMIN_TOKEN` in `.env.local`.

---

## Development

```bash
pnpm run dev        # Start API + Web UI concurrently
pnpm run dev:api    # Start API only
pnpm run dev:web    # Start Web UI only
pnpm run setup      # Run setup script
```

### Database Operations

```bash
pnpm run db:init              # Initialize database
pnpm run db:doctor            # Run diagnostics
pnpm run db:migrate:status    # Check migration state
pnpm run db:migrate:new <name> # Create new migration
```

---

## Release Policy

- Sealed stable releases are tagged as `vX.Y.Z-stable`
- Each release passes: lint, typecheck, build (zero CSS warnings), db:doctor
- No secrets, model weights, datasets, logs, or database files are committed
- See `docs/release/RELEASE_PROCESS.md` for full process

---

## Community

- **GitHub**: https://github.com/a740022938/aegisflow-intelligence-platform
- **Issues**: https://github.com/a740022938/aegisflow-intelligence-platform/issues
- **Contributing**: See `CONTRIBUTING.md`

---

## License

MIT
