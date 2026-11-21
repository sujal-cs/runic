import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

function CheckIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

const highlights = [
  {
    title: "Read and code side by side",
    description: "Keep the prompt in view while you work on your solution.",
  },
  {
    title: "Check each test case",
    description: "Move between examples and review your output in one place.",
  },
  {
    title: "Know what to try next",
    description: "Clear results make it easy to understand a pass or fix a failure.",
  },
];

export default function WorkspaceSection() {
  return (
    <section className="mt-24 grid items-center gap-8 max-lg:mt-16 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">Your workspace</p>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Stay with the problem, from prompt to verdict.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          No juggling tabs. Read, write, run, and review in one calm, focused space.
        </p>
        <ul className="mt-6 flex flex-col gap-4">
          {highlights.map((item) => (
            <li className="flex gap-3" key={item.title}>
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-control bg-brand/10 text-brand">
                <CheckIcon />
              </span>
              <span>
                <strong className="block text-sm font-semibold text-ink">{item.title}</strong>
                <span className="mt-0.5 block text-sm leading-relaxed text-ink-secondary">
                  {item.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Card className="overflow-hidden p-0 shadow-panel">
        <div className="flex h-11 items-center gap-2 border-b border-stroke bg-surface-muted px-4">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-code text-xs text-ink-subtle">Two Sum</span>
          <Badge className="ml-auto" variant="easy">Accepted</Badge>
        </div>
        <div className="grid min-h-[310px] sm:grid-cols-2">
          <div className="border-b border-stroke bg-canvas-soft p-5 sm:border-b-0 sm:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">Problem</p>
            <h3 className="mt-3 font-heading text-base font-bold text-ink">Two Sum</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
              Find two numbers that add up to the target and return their indices.
            </p>
            <p className="mt-5 text-xs font-semibold text-ink-secondary">Example</p>
            <pre className="mt-2 overflow-x-auto rounded-control border border-stroke bg-surface p-3 font-code text-[11px] leading-relaxed text-ink-secondary">
              nums = [2, 7, 11, 15]{"\n"}target = 9
            </pre>
          </div>
          <div className="min-w-0 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <strong className="font-code text-xs text-ink">solution.js</strong>
              <Badge variant="easy">Easy</Badge>
            </div>
            <div className="overflow-hidden rounded-control border border-stroke bg-[#0b0b0e] p-3 text-xs leading-[1.8] text-[#c9c9d2]">
              <div><span className="text-[#8ab4ff]">const</span> seen = <span className="text-[#8ab4ff]">new</span> Map();</div>
              <div><span className="text-[#8ab4ff]">for</span> (let i = 0; i &lt; nums.length; i++) {"{"}</div>
              <div className="pl-4">const need = target - nums[i];</div>
              <div className="pl-4"><span className="text-[#8ab4ff]">if</span> (seen.has(need)) <span className="text-[#8ab4ff]">return</span> [seen.get(need), i];</div>
              <div>{"}"}</div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-control border border-success/30 bg-success/10 px-3 py-2 text-xs font-semibold text-success">
              <CheckIcon /> Accepted · 3/3 test cases
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
