import { spawn } from "node:child_process";
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { OUTPUT_DIR, SOURCE_DIR, type CommandSpec } from "../shared/languages.js";

// The Docker daemon is the only execution surface in the system. Submitted code
// runs inside a throwaway container created here; nothing in this file ever
// executes user code on the host.
//
// The worker talks to the daemon through the Docker CLI. That keeps the
// dependency surface small and makes every flag applied to an execution
// container auditable in one place.

const DOCKER = process.env.DOCKER_PATH || "docker";
const MANAGED_LABEL = "codeforge.managed";
const JOB_LABEL = "codeforge.job";
const CREATED_LABEL = "codeforge.created";
const DEFAULT_DOCKER_TIMEOUT_MS = 60_000;
const IMAGE_PULL_TIMEOUT_MS = 10 * 60_000;

// Per-job scratch directory on the worker host. Sources are bind-mounted
// read-only into the execution container; compiled output goes to a writable
// directory that is thrown away with the job.
const WORK_ROOT = process.env.JUDGE_WORK_DIR || path.join(os.tmpdir(), "codeforge-jobs");

interface DockerResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

function runDocker(args: string[], timeoutMs = DEFAULT_DOCKER_TIMEOUT_MS): Promise<DockerResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(DOCKER, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const cap = 1_000_000;

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      if (stdout.length < cap) stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      if (stderr.length < cap) stderr += chunk.toString();
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

// --- Daemon availability ----------------------------------------------------

let availability: { ok: boolean; checkedAt: number } | null = null;
const AVAILABILITY_TTL_MS = 15_000;

export async function dockerAvailable(): Promise<boolean> {
  if (availability && Date.now() - availability.checkedAt < AVAILABILITY_TTL_MS) {
    return availability.ok;
  }
  try {
    const res = await runDocker(["version", "--format", "{{.Server.Version}}"], 15_000);
    availability = { ok: res.code === 0, checkedAt: Date.now() };
  } catch {
    availability = { ok: false, checkedAt: Date.now() };
  }
  return availability.ok;
}

// --- Images -----------------------------------------------------------------

const imageChecks = new Map<string, Promise<boolean>>();

async function imageExists(image: string): Promise<boolean> {
  const res = await runDocker(["image", "inspect", image], 30_000);
  return res.code === 0;
}

/**
 * Make sure an execution image is present, pulling it once if needed. Results
 * are cached per image so concurrent jobs do not stampede the registry.
 */
export function ensureImage(image: string): Promise<boolean> {
  const existing = imageChecks.get(image);
  if (existing) return existing;

  const pending = (async () => {
    if (await imageExists(image)) return true;
    console.log(`[worker] pulling image ${image}`);
    const res = await runDocker(["pull", image], IMAGE_PULL_TIMEOUT_MS);
    if (res.code !== 0) {
      console.error(`[worker] failed to pull ${image}: ${res.stderr.trim()}`);
      imageChecks.delete(image);
      return false;
    }
    console.log(`[worker] image ready ${image}`);
    return true;
  })();

  imageChecks.set(image, pending);
  return pending;
}

// --- Container execution ----------------------------------------------------

export interface ContainerFile {
  content: string | Buffer;
  mode?: number;
}

export interface ContainerOptions {
  image: string;
  command: CommandSpec;
  /** Files written to the read-only /workspace mount before the container starts. */
  files: Record<string, ContainerFile>;
  /** Container path used as `< stdin` for the command. */
  stdinFile?: string;
  /**
   * Artifacts to read back from the writable /out mount after the run, keyed by
   * artifact name. Enables /out only when non-empty.
   */
  collectFiles?: Record<string, string>;
  memoryMb: number;
  cpuLimit: number;
  pidsLimit: number;
  timeoutMs: number;
  maxOutputBytes: number;
  tmpfsMb: number;
  jobId: string;
  env?: Record<string, string>;
}

export interface ContainerResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  oomKilled: boolean;
  outputLimitExceeded: boolean;
  runtimeMs: number;
  artifacts: Record<string, Buffer>;
  /** Set when the container could not be created/started at all. */
  setupError?: string;
}

// Quote a single argument for `sh -c`. All values passed here are generated by
// the platform (binary paths, file names); user code is never interpolated into
// the command line.
function quote(value: string): string {
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function buildScript(options: ContainerOptions): string {
  const command = [options.command.cmd, ...options.command.args].map(quote).join(" ");
  const stdin = options.stdinFile ? ` < ${quote(options.stdinFile)}` : "";
  return [
    "set -eu",
    "cd /tmp",
    `exec ${command}${stdin}`,
  ].join("\n");
}

function createArgs(
  name: string,
  options: ContainerOptions,
  inputDir: string,
  outputDir: string | null,
): string[] {
  // V8 sizes its heap against the container limit, so pin it explicitly to
  // turn an out-of-memory kill into a catchable "heap out of memory" error.
  const nodeHeapMb = Math.max(64, options.memoryMb - 128);

  const args = [
    "create",
    "--name", name,
    "--label", `${MANAGED_LABEL}=true`,
    "--label", `${JOB_LABEL}=${options.jobId}`,
    "--label", `${CREATED_LABEL}=${Date.now()}`,

    // Isolation
    "--network", "none",
    "--user", "65534:65534",
    "--workdir", "/tmp",
    "--read-only",
    "--tmpfs", `/tmp:rw,exec,nosuid,nodev,size=${options.tmpfsMb}m,mode=1777`,
    "--cap-drop", "ALL",
    "--security-opt", "no-new-privileges",
    "--pids-limit", String(options.pidsLimit),

    // Only the job's own directory is visible, and only read-only. There is no
    // mount of the host filesystem, the Docker socket, or application secrets.
    "--mount", `type=bind,source=${inputDir},target=${SOURCE_DIR},readonly`,

    // Resource limits
    "--memory", `${options.memoryMb}m`,
    "--memory-swap", `${options.memoryMb}m`,
    "--cpus", String(options.cpuLimit),
    "--ulimit", "nofile=64:64",
    "--ulimit", "core=0:0",
    // Backstop for a runaway CPU loop if the worker dies and can no longer
    // enforce the wall-clock timeout: the kernel sends SIGXCPU, then SIGKILL.
    "--ulimit", `cpu=${Math.ceil(options.timeoutMs / 1000) + 3}:${Math.ceil(options.timeoutMs / 1000) + 6}`,

    // Minimal, non-secret environment. Nothing from the worker's own process
    // (DATABASE_URL, session secrets, Docker credentials) is forwarded.
    "--env", "HOME=/tmp",
    "--env", "TMPDIR=/tmp",
    "--env", "PATH=/usr/local/bin:/usr/local/sbin:/usr/sbin:/usr/bin:/sbin:/bin",
    "--env", "LANG=C.UTF-8",
    "--env", "LC_ALL=C.UTF-8",
    "--env", "PYTHONDONTWRITEBYTECODE=1",
    "--env", "GOCACHE=/tmp/go-cache",
    "--env", `NODE_OPTIONS=--max-old-space-size=${nodeHeapMb}`,
  ];

  if (outputDir) {
    args.push("--mount", `type=bind,source=${outputDir},target=${OUTPUT_DIR}`);
  }

  for (const [key, value] of Object.entries(options.env ?? {})) {
    args.push("--env", `${key}=${value}`);
  }

  args.push("--entrypoint", "/bin/sh", options.image, "-c", buildScript(options));
  return args;
}

interface AttachResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  outputLimitExceeded: boolean;
  runtimeMs: number;
}

async function killContainer(name: string): Promise<void> {
  await runDocker(["kill", "--signal", "KILL", name], 15_000).catch(() => undefined);
}

async function attach(name: string, timeoutMs: number, maxOutputBytes: number): Promise<AttachResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(DOCKER, ["start", "-a", name], { stdio: ["ignore", "pipe", "pipe"] });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let bytes = 0;
    let timedOut = false;
    let outputLimitExceeded = false;
    let settled = false;

    const finish = (exitCode: number | null): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout: Buffer.concat(stdoutChunks).toString(),
        stderr: Buffer.concat(stderrChunks).toString(),
        exitCode,
        timedOut,
        outputLimitExceeded,
        runtimeMs: Date.now() - start,
      });
    };

    const enforceOutputLimit = (): void => {
      if (bytes <= maxOutputBytes || outputLimitExceeded) return;
      outputLimitExceeded = true;
      // Stop the container instead of letting it flood the worker's memory.
      void killContainer(name);
    };

    const timer = setTimeout(() => {
      timedOut = true;
      void killContainer(name);
      // Do not wait forever for the CLI to notice; the container is already
      // being killed and `docker rm -f` runs afterwards regardless.
      setTimeout(() => {
        child.kill("SIGKILL");
        finish(null);
      }, 5_000).unref();
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes <= maxOutputBytes) stdoutChunks.push(chunk);
      enforceOutputLimit();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes <= maxOutputBytes) stderrChunks.push(chunk);
      enforceOutputLimit();
    });
    child.on("error", (err) => {
      stderrChunks.push(Buffer.from(`docker attach failed: ${err.message}`));
      finish(null);
    });
    // `docker start -a` exits with the container's exit code.
    child.on("close", (code) => finish(code));
  });
}

async function inspectOom(name: string): Promise<boolean> {
  const res = await runDocker(
    ["inspect", "--format", "{{.State.OOMKilled}}", name],
    15_000,
  );
  return res.code === 0 && res.stdout.trim() === "true";
}

async function writeInputs(dir: string, files: Record<string, ContainerFile>): Promise<void> {
  for (const [name, file] of Object.entries(files)) {
    const target = path.join(dir, name);
    await fs.writeFile(target, file.content);
    await fs.chmod(target, file.mode ?? 0o644);
  }
}

/**
 * Run a single command inside a disposable, locked-down container.
 *
 * Sources are bind-mounted read-only at /workspace; the container's root
 * filesystem is read-only except for a size-limited tmpfs at /tmp. Cleanup is
 * unconditional: the container is force-removed and the job directory deleted
 * even when creation, start, or the run itself fails.
 */
export async function runContainer(options: ContainerOptions): Promise<ContainerResult> {
  const base: ContainerResult = {
    stdout: "",
    stderr: "",
    exitCode: null,
    timedOut: false,
    oomKilled: false,
    outputLimitExceeded: false,
    runtimeMs: 0,
    artifacts: {},
  };

  if (!(await dockerAvailable())) {
    return { ...base, setupError: "Docker daemon is not reachable from the judge worker" };
  }
  if (!(await ensureImage(options.image))) {
    return { ...base, setupError: `Execution image unavailable: ${options.image}` };
  }

  const name = `${env.judge.containerPrefix}-${randomUUID()}`;
  const jobDir = path.join(WORK_ROOT, randomUUID());
  const inputDir = path.join(jobDir, "src");
  const outputDir = path.join(jobDir, "out");
  const needsOutput = Object.keys(options.collectFiles ?? {}).length > 0;
  let created = false;

  try {
    await fs.mkdir(inputDir, { recursive: true, mode: 0o755 });
    await fs.chmod(inputDir, 0o755);
    await writeInputs(inputDir, options.files);

    if (needsOutput) {
      await fs.mkdir(outputDir, { recursive: true, mode: 0o777 });
      // The container runs as uid 65534, which must be able to write here.
      await fs.chmod(outputDir, 0o777);
    }

    const create = await runDocker(createArgs(name, options, inputDir, needsOutput ? outputDir : null));
    if (create.code !== 0) {
      return { ...base, setupError: `Container creation failed: ${create.stderr.trim()}` };
    }
    created = true;

    const attached = await attach(name, options.timeoutMs, options.maxOutputBytes);
    const oomKilled = attached.timedOut ? false : await inspectOom(name);

    const artifacts: Record<string, Buffer> = {};
    for (const [artifact, containerPath] of Object.entries(options.collectFiles ?? {})) {
      const localPath = path.join(outputDir, path.basename(containerPath));
      try {
        artifacts[artifact] = await fs.readFile(localPath);
      } catch {
        // No artifact means compilation produced nothing; the caller reports it.
      }
    }

    return { ...base, ...attached, oomKilled, artifacts };
  } catch (err: any) {
    return {
      ...base,
      setupError: err?.message ? `Container execution failed: ${err.message}` : String(err),
    };
  } finally {
    if (created) {
      await runDocker(["rm", "-f", name], 30_000).catch(() => undefined);
    }
    await fs.rm(jobDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

/**
 * Remove execution containers left behind by a crashed worker. Only containers
 * carrying our managed label and older than `minAgeMs` are touched, so a
 * concurrently running worker keeps its own jobs.
 */export async function sweepOrphanContainers(minAgeMs = 10 * 60_000): Promise<number> {
  const list = await runDocker(
    ["ps", "-aq", "--filter", `label=${MANAGED_LABEL}=true`],
    30_000,
  );
  if (list.code !== 0) return 0;

  const ids = list.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  if (ids.length === 0) return 0;

  const inspect = await runDocker(
    ["inspect", "--format", `{{.Id}} {{index .Config.Labels "${CREATED_LABEL}"}}`, ...ids],
    30_000,
  );
  if (inspect.code !== 0) return 0;

  const cutoff = Date.now() - minAgeMs;
  const stale: string[] = [];
  for (const line of inspect.stdout.split("\n")) {
    const [id, created] = line.trim().split(/\s+/);
    const createdAt = Number(created);
    if (id && (!Number.isFinite(createdAt) || createdAt < cutoff)) stale.push(id);
  }

  if (stale.length === 0) return 0;
  await runDocker(["rm", "-f", ...stale], 60_000).catch(() => undefined);
  console.warn(`[worker] removed ${stale.length} orphaned execution container(s)`);
  return stale.length;
}

/**
 * Remove job directories left behind by a crashed worker. Same age rule as the
 * container sweep so a live worker's in-flight jobs are never touched.
 */
export async function sweepOrphanWorkDirs(minAgeMs = 10 * 60_000): Promise<number> {
  let entries: Dirent[];
  try {
    entries = await fs.readdir(WORK_ROOT, { withFileTypes: true });
  } catch {
    return 0;
  }

  const cutoff = Date.now() - minAgeMs;
  let removed = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const target = path.join(WORK_ROOT, entry.name);
    try {
      const stats = await fs.stat(target);
      if (stats.mtimeMs >= cutoff) continue;
      await fs.rm(target, { recursive: true, force: true });
      removed += 1;
    } catch {
      // Directory vanished or is not ours; nothing to reclaim.
    }
  }

  if (removed > 0) {
    console.warn(`[worker] removed ${removed} orphaned job director(ies)`);
  }
  return removed;
}
