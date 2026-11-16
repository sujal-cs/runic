import { env } from "../config/env.js";

// Single source of truth for languages the platform can execute. Both the API
// (for validation) and the judge worker (for execution) import this module, so
// aliases such as `python` and `python3` behave identically everywhere.
//
// This file is intentionally pure data: it must never gain access to
// child_process, Docker, or anything else that could execute user code. The
// API imports it, and the API must stay free of execution capabilities.

export type LanguageRuntime = "node" | "python" | "native";

export interface CommandSpec {
  cmd: string;
  args: string[];
}

export interface LanguageDefinition {
  id: string;
  aliases: string[];
  extension: string;
  /** Container image used for every execution of this language. */
  image: string;
  /** Hard memory cap for the container, in MiB. */
  memoryMb: number;
  /** CPU quota expressed in cores. */
  cpuLimit: number;
  /** Non-zero process count cap. */
  pidsLimit: number;
  runtime: LanguageRuntime;
  /**
   * Whether the judge can call a named function for test-case evaluation.
   * Native languages are runnable end-to-end (stdin/stdout) but have no
   * function-calling driver yet.
   */
  judgeable: boolean;
  compile?: (source: string, output: string) => CommandSpec;
  run: (source: string, output: string) => CommandSpec;
}

// Mount layout inside every execution container.
//   /workspace -> read-only bind of the generated source files
//   /tmp       -> writable tmpfs, the only writable location
export const SOURCE_DIR = "/workspace";
export const OUTPUT_DIR = "/out";

export const LANGUAGES: LanguageDefinition[] = [
  {
    id: "javascript",
    aliases: [],
    extension: "js",
    image: env.judge.images.javascript,
    // Node's RSS for a typical solution is well under 128 MiB, but V8 keeps
    // roughly twice the live set, so 512 MiB leaves room without letting a
    // runaway allocation take down the worker.
    memoryMb: 512,
    cpuLimit: 1,
    pidsLimit: 64,
    runtime: "node",
    judgeable: true,
    run: (source) => ({ cmd: "node", args: [source] }),
  },
  {
    id: "python3",
    aliases: ["python"],
    extension: "py",
    image: env.judge.images.python3,
    memoryMb: 256,
    cpuLimit: 1,
    pidsLimit: 64,
    runtime: "python",
    judgeable: true,
    run: (source) => ({ cmd: "python3", args: [source] }),
  },
  {
    id: "cpp",
    aliases: ["c++"],
    extension: "cpp",
    image: env.judge.images.cpp,
    memoryMb: 512,
    cpuLimit: 1,
    pidsLimit: 64,
    runtime: "native",
    judgeable: false,
    compile: (source, output) => ({ cmd: "g++", args: ["-O2", "-o", output, source] }),
    run: (_source, output) => ({ cmd: output, args: [] }),
  },
  {
    id: "c",
    aliases: [],
    extension: "c",
    image: env.judge.images.c,
    memoryMb: 512,
    cpuLimit: 1,
    pidsLimit: 64,
    runtime: "native",
    judgeable: false,
    compile: (source, output) => ({ cmd: "gcc", args: ["-O2", "-o", output, source] }),
    run: (_source, output) => ({ cmd: output, args: [] }),
  },
  {
    id: "go",
    aliases: ["golang"],
    extension: "go",
    image: env.judge.images.go,
    memoryMb: 512,
    cpuLimit: 1,
    pidsLimit: 64,
    runtime: "native",
    judgeable: false,
    compile: (source, output) => ({ cmd: "go", args: ["build", "-o", output, source] }),
    run: (_source, output) => ({ cmd: output, args: [] }),
  },
  {
    id: "rust",
    aliases: [],
    extension: "rs",
    image: env.judge.images.rust,
    memoryMb: 512,
    cpuLimit: 1,
    pidsLimit: 64,
    runtime: "native",
    judgeable: false,
    compile: (source, output) => ({ cmd: "rustc", args: ["-O", "-o", output, source] }),
    run: (_source, output) => ({ cmd: output, args: [] }),
  },
];

export function resolveLanguage(language: string): LanguageDefinition | null {
  const normalized = language.trim().toLowerCase();
  return (
    LANGUAGES.find(
      (definition) =>
        definition.id === normalized || definition.aliases.includes(normalized),
    ) ?? null
  );
}

export function supportedLanguages(): string[] {
  return LANGUAGES.flatMap((definition) => [definition.id, ...definition.aliases]);
}
