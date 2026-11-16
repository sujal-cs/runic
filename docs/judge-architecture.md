# Judge architecture

The platform separates *request handling* from *code execution*. The Express API
has no ability to run submitted code; a dedicated worker does. This document
describes that boundary, the container policy, and how jobs behave when things
go wrong.

## Components

| Component | Can run user code? | Can reach Docker? | Started by |
| --- | --- | --- | --- |
| Express API (`src/index.ts`) | No | No | `npm run dev` |
| Judge worker (`src/worker/index.ts`) | Only via Docker | Yes | `npm run worker -w backend` |
| Execution container | Yes | No | created per job by the worker |
| PostgreSQL | — | — | `docker compose up -d` |
| Redis | — | — | `docker compose up -d` |

The API imports `src/shared/languages.ts` and `src/shared/verdicts.ts`, which
are pure data. It never imports `src/worker/*`.

## Request flow

```text
POST /api/submissions
  │
  ├─ validate body (zod)
  ├─ insert row with status = "Pending"
  ├─ enqueue job { kind: "judge", submissionId }
  ├─ poll the job (bounded) for a verdict
  └─ respond 201 with the submission

GET /api/submissions/:id   ← frontend polls while status is Pending/Processing
```

Three job kinds share one queue:

| Job | Persists? | Returns |
| --- | --- | --- |
| `judge` | yes, updates the submission row | `{ submissionId, status }` |
| `run-all` | no | `JudgeResult` (all test cases) |
| `run` | no | `RunResult` (single custom input) |

`judge` carries only the submission id; the worker loads the code and problem
from the database, so request bodies never sit in Redis twice.

## Container policy

Created by `src/worker/docker.ts` — the only module in the repository that
spawns a process able to execute untrusted code.

```text
docker create
  --network none
  --user 65534:65534
  --read-only
  --tmpfs /tmp:rw,exec,nosuid,nodev,size=64m,mode=1777
  --mount type=bind,source=<job>/src,target=/workspace,readonly
  --mount type=bind,source=<job>/out,target=/out        # only when collecting artifacts
  --memory 512m --memory-swap 512m
  --cpus 1
  --pids-limit 64
  --cap-drop ALL
  --security-opt no-new-privileges
  --ulimit nofile=64:64 --ulimit core=0:0 --ulimit cpu=<timeout+3>:<timeout+6>
  --env HOME=/tmp --env TMPDIR=/tmp
  --entrypoint /bin/sh <image> -c '<script>'
```

Notes:

- **No host mount.** Only the job's own directory is bound, and read-only.
  `/out` is writable only for compiled languages and is deleted with the job.
- **No inherited environment.** The worker's own environment (`DATABASE_URL`,
  `SESSION_SECRET`, registry credentials) is never forwarded; the container gets
  a fixed minimal env.
- **No Docker socket.** The socket belongs to the worker only.
- **Base64/tar tricks avoided.** Sources are files on disk, so the command line
  never contains user code.
- **Garbage collection.** `docker rm -f` runs in a `finally` block, so containers
  disappear on success, failure, timeout, and output-limit overrun.

## Verdicts

```text
Pending → Processing → Accepted
                     → Wrong Answer
                     → Compilation Error
                     → Runtime Error
                     → Time Limit Exceeded
                     → Memory Limit Exceeded
                     → Output Limit Exceeded
                     → Judge Unavailable
                     → Judge Error
```

Detection rules:

| Verdict | Signal |
| --- | --- |
| Time Limit Exceeded | wall-clock timer fired, container killed |
| Memory Limit Exceeded | `State.OOMKilled`, exit 137, or allocation-failure signatures |
| Compilation Error | non-zero exit plus `SyntaxError`/`IndentationError` in stderr |
| Output Limit Exceeded | stdout+stderr exceeded `JUDGE_MAX_OUTPUT_BYTES` |
| Judge Unavailable | daemon unreachable or image missing |
| Judge Error | platform failure, stale job, or missing test data |

`Compilation Error`, `Time Limit Exceeded`, `Memory Limit Exceeded`,
`Output Limit Exceeded`, and `Judge Unavailable` stop the loop early: repeating
them for the remaining test cases would only burn the same compiler run or
timeout again.

## Failure handling

| Failure | Behaviour |
| --- | --- |
| Worker crashes mid-job | BullMQ lock expires, job is retried (`maxStalledCount: 2`) |
| Job throws | retried once, then the row is marked `Judge Error` |
| Submission stuck in `Processing` | reaped on worker start after 10 minutes |
| Container left behind (SIGKILL) | swept on worker start once older than 2 minutes |
| Job directory left behind (SIGKILL) | swept on worker start once older than 2 minutes |
| Redis unavailable | requests fail with a clear 5xx; no execution fallback |
| Docker unavailable | worker exits at startup with an actionable message |

The API waits `JUDGE_SUBMIT_WAIT_MS` for a verdict. If the worker is busy the
response is `Pending`, the row is already durable, and the frontend polls
`GET /api/submissions/:id` until a final status appears.

## Adding a language

1. Add an entry to `LANGUAGES` in `src/shared/languages.ts` (image, limits,
   compile/run commands).
2. If the judge should call a function, set `judgeable: true` and make sure the
   snippet in the problem's `code_snippets` matches the extraction pattern in
   `src/worker/judge.ts`.
3. `npm run judge:images -w backend` to pull the image.

No other file needs to change: the registry drives the API, the worker, and the
image puller.
