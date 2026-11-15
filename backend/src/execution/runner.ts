import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type RunResult = {
  status: "OK" | "Compile Error" | "Runtime Error" | "Time Limit Exceeded";
  stdout: string;
  stderr: string;
  exitCode: number | null;
  runtimeMs: number;
};

type LanguageConfig = {
  extension: string;
  compile?: (dir: string, file: string) => { cmd: string; args: string[] };
  run: (dir: string, file: string) => { cmd: string; args: string[] };
};

const configs: Record<string, LanguageConfig> = {
  javascript: {
    extension: "js",
    run: (_dir, file) => ({ cmd: "node", args: [file] }),
  },
  python: {
    extension: "py",
    run: (_dir, file) => ({ cmd: "python3", args: [file] }),
  },
  cpp: {
    extension: "cpp",
    compile: (dir, file) => ({ cmd: "g++", args: ["-O2", "-o", path.join(dir, "main"), file] }),
    run: (dir) => ({ cmd: path.join(dir, "main"), args: [] }),
  },
  c: {
    extension: "c",
    compile: (dir, file) => ({ cmd: "gcc", args: ["-O2", "-o", path.join(dir, "main"), file] }),
    run: (dir) => ({ cmd: path.join(dir, "main"), args: [] }),
  },
  go: {
    extension: "go",
    compile: (dir, file) => ({ cmd: "go", args: ["build", "-o", path.join(dir, "main"), file] }),
    run: (dir) => ({ cmd: path.join(dir, "main"), args: [] }),
  },
  rust: {
    extension: "rs",
    compile: (dir, file) => ({ cmd: "rustc", args: ["-O", "-o", path.join(dir, "main"), file] }),
    run: (dir) => ({ cmd: path.join(dir, "main"), args: [] }),
  },
};

function execOnce(
  cmd: string,
  args: string[],
  cwd: string,
  input: string,
  timeoutMs: number,
): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean; ms: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(cmd, args, { cwd });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timedOut, ms: Date.now() - start });
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: stderr + err.message, exitCode: -1, timedOut, ms: Date.now() - start });
    });
    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

// Executes untrusted user code in a separate child process with a timeout.
// This keeps arbitrary code out of the Express server process and gives a
// single place to later swap in a dedicated sandbox/judge service.
export async function runCode(language: string, code: string, input: string): Promise<RunResult> {
  const config = configs[language];
  if (!config) {
    return { status: "Runtime Error", stdout: "", stderr: `Unsupported language: ${language}`, exitCode: -1, runtimeMs: 0 };
  }

  const dir = path.join(os.tmpdir(), "opencode-judge", randomUUID());
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `main.${config.extension}`);
  fs.writeFileSync(file, code);

  const TIMEOUT = 10000;

  try {
    if (config.compile) {
      const c = config.compile(dir, file);
      const compileRes = await execOnce(c.cmd, c.args, dir, "", TIMEOUT);
      // For go build, args already include file
      if (compileRes.timedOut || compileRes.exitCode !== 0) {
        return {
          status: "Compile Error",
          stdout: compileRes.stdout,
          stderr: compileRes.stderr,
          exitCode: compileRes.exitCode,
          runtimeMs: compileRes.ms,
        };
      }
    }

    const r = config.run(dir, file);
    const runRes = await execOnce(r.cmd, r.args, dir, input, TIMEOUT);
    if (runRes.timedOut) {
      return { status: "Time Limit Exceeded", stdout: runRes.stdout, stderr: runRes.stderr, exitCode: runRes.exitCode, runtimeMs: runRes.ms };
    }
    if (runRes.exitCode !== 0) {
      return { status: "Runtime Error", stdout: runRes.stdout, stderr: runRes.stderr, exitCode: runRes.exitCode, runtimeMs: runRes.ms };
    }
    return { status: "OK", stdout: runRes.stdout, stderr: runRes.stderr, exitCode: runRes.exitCode, runtimeMs: runRes.ms };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
