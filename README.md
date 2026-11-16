# Runic

A LeetCode-inspired online coding platform for practicing data structures and algorithms. Built with a React frontend, an Express + TypeScript backend, PostgreSQL, and Redis.

**Author:** [Sujal](https://github.com/sujal-cs/)  
**Repository:** https://github.com/sujal-cs/runic

## Tech Stack

<a href="https://react.dev/" target="_blank">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
</a>
<a href="https://www.typescriptlang.org/" target="_blank">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</a>
<a href="https://nodejs.org/" target="_blank">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
</a>
<a href="https://expressjs.com/" target="_blank">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
</a>
<a href="https://www.postgresql.org/" target="_blank">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</a>
<a href="https://redis.io/" target="_blank">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</a>
<a href="https://www.docker.com/" target="_blank">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</a>
<a href="https://vite.dev/" target="_blank">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</a>

## Features

- Problem browsing with search, filters, sorting, and pagination
- Individual problem pages with descriptions, examples, and constraints
- Integrated Monaco code editor with multi-language support
- Run and Submit against real test cases
- Docker-isolated judge worker with a Redis-backed job queue
- Submission lifecycle tracking (queued, processing, verdict) with polling
- In-house authentication with persistent sessions
- User profiles and submission history
- Dark and light themes

## Project Structure

```text
project/
├── backend/
│   └── src/
│       ├── controllers/   # HTTP request/response mapping
│       ├── services/      # Business logic and database access
│       ├── middleware/    # Auth, validation, errors, rate limiting
│       ├── queue/         # Redis-backed judge queue (producer side)
│       ├── shared/        # Language registry + verdict vocabulary
│       ├── worker/        # Judge worker: Docker execution, judging
│       ├── routes/        # Thin Express routers
│       └── db/            # Drizzle schema and client
├── frontend/
├── specs/
├── docker-compose.yml
└── README.md
```

The `specs/` folder contains the project prompts, practices, and iteration notes used to build and refine the platform.

## Setup

1. Start infrastructure:
   ```bash
   docker compose up -d
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   cp .env.example backend/.env
   ```
4. Apply the database schema:
   ```bash
   npm run db:push -w backend      # dev: sync the Drizzle schema directly
   # or, for a fresh database using generated migrations:
   # npm run db:migrate -w backend
   ```
5. Ingest problems:
   ```bash
   npm run ingest -w backend
   ```
6. Prepare the judge:
   ```bash
   npm run judge:images -w backend   # pull execution images
   docker version                    # the worker needs a reachable daemon
   ```
7. Start development servers (API, frontend, and judge worker):
   ```bash
   npm run dev:judge
   ```
   Or run them separately when you only need part of the stack:
   ```bash
   npm run dev                 # API + frontend only (submissions stay queued)
   npm run worker -w backend   # judge worker
   ```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

### Code execution

Submitted code **never** runs inside the Express process. The API validates the
request, writes a submission row, and pushes a job onto a Redis queue. A
separate judge worker consumes the job and runs the code inside a disposable
Docker container.

```text
React ──► Express API ──► Redis queue ──► Judge worker ──► Docker container
                │                              │
                └──────── PostgreSQL ◄─────────┘
```

Why it is split this way:

- The API has no Docker access and no execution code path, so a bug in a route
  handler cannot become remote code execution.
- The worker may talk to the Docker daemon, but submitted code runs in a
  sibling container that never sees the socket.
- Results are persisted, so a submission survives a page refresh, a dropped
  connection, or a worker restart.

Every execution container is created with:

| Control | Setting |
| --- | --- |
| User | uid/gid `65534` (never root) |
| Network | `--network none` |
| Filesystem | read-only rootfs, sources bind-mounted read-only, `--tmpfs /tmp` |
| Memory | `--memory` + `--memory-swap` (swap disabled) |
| CPU | `--cpus 1`, plus `RLIMIT_CPU` as a crash backstop |
| Processes | `--pids-limit` |
| Capabilities | `--cap-drop ALL`, `no-new-privileges` |
| Output | capped byte count, container killed when exceeded |
| Lifetime | wall-clock timeout, `docker rm -f` in a `finally` block |

See [`docs/judge-architecture.md`](docs/judge-architecture.md) for the full
design, status vocabulary, and operational notes.

If Docker is unavailable the worker refuses to start and jobs stay queued
instead of falling back to executing code on the host.

## License

This project is for educational and personal use.
