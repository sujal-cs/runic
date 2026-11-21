import { Link } from "react-router-dom";
import BenefitGrid from "../components/landing/BenefitGrid";
import FaqSection from "../components/landing/FaqSection";
import WorkspaceSection from "../components/landing/WorkspaceSection";
import { Card } from "../components/ui/Card";

const HERO_CODE: Array<Array<[string, string]>> = [
  [["text-ink-subtle italic", "// one pass · O(n)"]],
  [["text-[#8ab4ff]", "const"], ["", " seen = "], ["text-[#8ab4ff]", "new"], ["", " "], ["text-[#67d5e8]", "Map"], ["", "();"]],
  [["text-[#8ab4ff]", "for"], ["", " (let i = 0; i < nums.length; i++) {"]],
  [["", "  "], ["text-[#8ab4ff]", "const"], ["", " need = target - nums[i];"]],
  [["", "  "], ["text-[#8ab4ff]", "if"], ["", " (seen."], ["text-[#c9a6ff]", "has"], ["", "(need)) "], ["text-[#8ab4ff]", "return"], ["", " [seen.get(need), i];"]],
  [["", "  seen.set(nums[i], i);"]],
  [["", "}"]],
];

function CodeTokens({ lines }: { lines: Array<Array<[string, string]>> }) {
  return (
    <code>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {line.map(([className, text], tokenIndex) => (
            <span className={className || undefined} key={tokenIndex}>{text}</span>
          ))}
          {lineIndex < lines.length - 1 ? "\n" : null}
        </span>
      ))}
    </code>
  );
}

function ArrowIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function TrustNote() {
  return (
    <Card className="mt-20 flex items-start gap-4 border-brand/20 bg-brand/5 p-5 max-sm:mt-14">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-control bg-brand/10 text-brand">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m4 12 5 5L20 6" />
        </svg>
      </span>
      <p className="text-sm leading-relaxed text-ink-secondary">
        Your code stays with your account and your results persist. Submissions run in an isolated environment.
      </p>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <div className="pb-8">
      <section className="grid items-center gap-8 overflow-hidden rounded-card border border-white/10 bg-gradient-to-br from-[#1b46d8] via-[#2558e9] to-brand p-6 shadow-panel sm:p-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:gap-10 lg:p-12">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85">
            Practice with focus
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Get better at DSA, one problem at a time.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">
            A focused workspace, a real code editor, clear verdicts, and progress that stays with you.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-white px-4 py-2.5 text-sm font-bold text-[#1745c3] shadow-sm transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              to="/problems"
            >
              Start solving <ArrowIcon />
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-control border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              to="/register"
            >
              Create free account
            </Link>
          </div>
        </div>

        <Card className="overflow-hidden border-white/10 bg-[#0b0b0e]/95 p-0 shadow-panel" aria-label="Example code preview">
          <div className="flex h-11 items-center gap-2 border-b border-white/10 px-4">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-code text-xs text-[#b4b4c0]">two-sum.js</span>
            <span className="ml-auto rounded-full bg-success/15 px-2 py-1 text-[10px] font-semibold text-success">Accepted</span>
          </div>
          <pre className="min-h-48 overflow-x-auto px-4 py-4 font-code text-[11px] leading-[1.8] text-[#c9c9d2] sm:px-5 sm:text-xs">
            <CodeTokens lines={HERO_CODE} />
          </pre>
          <div className="flex justify-between border-t border-white/10 px-4 py-3 font-code text-[10px] text-[#82828e] sm:px-5">
            <span>3/3 test cases</span>
            <span>12 ms</span>
          </div>
        </Card>
      </section>

      <BenefitGrid />
      <WorkspaceSection />
      <TrustNote />
      <FaqSection />
    </div>
  );
}
