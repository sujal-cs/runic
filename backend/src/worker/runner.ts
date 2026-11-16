import { env } from "../config/env.js";
import {
  OUTPUT_DIR,
  resolveLanguage,
  SOURCE_DIR,
  type CommandSpec,
  type LanguageDefinition,
} from "../shared/languages.js";
import type { RunResult, RunStatus } from "../shared/verdicts.js";
import { runContainer, type ContainerFile, type ContainerResult } from "./docker.js";

// Ad-hoc "Run" execution: compile if needed, then feed the user's input to the
// program through a file inside the container. Nothing runs on the host.

const MEMORY_SIGNATURES =
  /JavaScript heap out of memory|MemoryError|std::bad_alloc|bad_alloc|Cannot allocate memory|Out of memory|Killed/i;

function classify(run: ContainerResult): RunStatus {
  if (run.setupError) return "Judge Unavailable";
  if (run.outputLimitExceeded) return "Output Limit Exceeded";
  if (run.timedOut) return "Time Limit Exceeded";
  if (run.oomKilled) return "Memory Limit Exceeded";
  if (MEMORY_SIGNATURES.test(run.stderr)) return "Memory Limit Exceeded";
  if (run.exitCode === 137) return "Memory Limit Exceeded";
  if (run.exitCode !== 0) return "Runtime Error";
  return "OK";
}

function containerOptions(
  definition: LanguageDefinition,
  command: CommandSpec,
  files: Record<string, ContainerFile>,
  jobId: string,
) {
  return {
    image: definition.image,
    command,
    files,
    memoryMb: definition.memoryMb,
    cpuLimit: definition.cpuLimit,
    pidsLimit: definition.pidsLimit,
    timeoutMs: env.judge.timeoutMs,
    maxOutputBytes: env.judge.maxOutputBytes,
    tmpfsMb: env.judge.tmpfsMb,
    jobId,
  };
}

function toRunResult(status: RunStatus, run: ContainerResult): RunResult {
  return {
    status,
    stdout: run.stdout,
    stderr: run.stderr,
    exitCode: run.exitCode,
    runtimeMs: run.runtimeMs,
    ...(run.setupError ? { message: run.setupError } : {}),
  };
}

export async function runCode(
  language: string,
  code: string,
  input: string,
  jobId: string,
): Promise<RunResult> {
  const definition = resolveLanguage(language);
  if (!definition) {
    return {
      status: "Unsupported Language",
      stdout: "",
      stderr: "",
      exitCode: null,
      runtimeMs: 0,
      message: `Unsupported language: ${language}`,
    };
  }

  const sourceName = `main.${definition.extension}`;
  const sourcePath = `${SOURCE_DIR}/${sourceName}`;
  const files: Record<string, ContainerFile> = { [sourceName]: { content: code } };
  if (input) files["input.txt"] = { content: input };

  const stdinFile = input ? `${SOURCE_DIR}/input.txt` : undefined;

  // Compiled languages run in two containers: the build produces a binary in
  // the writable /out mount, which is then handed to a fresh container with no
  // compiler toolchain reachable.
  if (definition.compile) {
    const buildPath = `${OUTPUT_DIR}/main`;
    const build = await runContainer({
      ...containerOptions(definition, definition.compile(sourcePath, buildPath), files, jobId),
      collectFiles: { main: buildPath },
    });

    if (build.setupError) return toRunResult("Judge Unavailable", build);
    if (build.timedOut) return toRunResult("Time Limit Exceeded", build);
    if (build.exitCode !== 0) return toRunResult("Compilation Error", build);

    const binary = build.artifacts.main;
    if (!binary) {
      return {
        status: "Compilation Error",
        stdout: build.stdout,
        stderr: `${build.stderr}\nCompiler produced no output binary`.trim(),
        exitCode: build.exitCode,
        runtimeMs: build.runtimeMs,
        message: "Compiler produced no output binary",
      };
    }

    const run = await runContainer({
      ...containerOptions(
        definition,
        definition.run(sourcePath, `${SOURCE_DIR}/main`),
        { ...(input ? { "input.txt": { content: input } } : {}), main: { content: binary, mode: 0o755 } },
        jobId,
      ),
      stdinFile,
    });

    return { ...toRunResult(classify(run), run), runtimeMs: build.runtimeMs + run.runtimeMs };
  }

  const run = await runContainer({
    ...containerOptions(definition, definition.run(sourcePath, ""), files, jobId),
    stdinFile,
  });
  return toRunResult(classify(run), run);
}
