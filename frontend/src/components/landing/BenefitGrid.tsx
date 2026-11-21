import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

function ProblemIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4" />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 4-4 3 3 5-6" />
    </svg>
  );
}

const benefits = [
  {
    title: "A clear place to start",
    description: "Curated problems across Easy, Medium, and Hard help you find your next challenge.",
    icon: <ProblemIcon />,
  },
  {
    title: "Code your way",
    description: "Practice in JavaScript, Python, C, C++, Go, or Rust with a real code editor.",
    icon: <CodeIcon />,
  },
  {
    title: "Feedback you can use",
    description: "Run test cases and see a clear verdict, plus the details behind each result.",
    icon: <FeedbackIcon />,
  },
  {
    title: "Progress that stays",
    description: "Revisit your submissions and results whenever you return.",
    icon: <ProgressIcon />,
  },
];

export default function BenefitGrid() {
  return (
    <section className="mt-20 max-sm:mt-14">
      <div className="mb-7 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">What you get</p>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Everything you need to keep practicing.
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {benefits.map((benefit) => (
          <Card className="flex flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5" key={benefit.title}>
            <span className="grid size-9 place-items-center rounded-control bg-brand/10 text-brand">
              <span className="size-4">{benefit.icon}</span>
            </span>
            <h3 className="font-semibold tracking-tight text-ink">{benefit.title}</h3>
            <p className="text-sm leading-relaxed text-ink-secondary">{benefit.description}</p>
          </Card>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>30 curated problems</Badge>
        <Badge>6 languages</Badge>
        <Badge>Saved progress</Badge>
      </div>
    </section>
  );
}
