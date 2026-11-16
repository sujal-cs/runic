import { Link } from "react-router-dom";

const REPO_URL = "https://github.com/sujal-cs/runic";

// Hero code sample. Tokens are pre-split so the sample renders with the same
// palette as the real editor without pulling Monaco into the landing page.
const HERO_CODE: Array<Array<[string, string]>> = [
  [["tok-com", "// one pass, hash map · O(n)"]] as Array<[string, string]>,
  [["tok-key", "var"], ["", " "], ["tok-fn", "twoSum"], ["", " = function (nums, target) {"]] as Array<[string, string]>,
  [["", "  "], ["tok-key", "const"], ["", " seen = "], ["tok-key", "new"], ["", " "], ["tok-type", "Map"], ["", "();"]] as Array<[string, string]>,
  [["", "  "], ["tok-key", "for"], ["", " ("], ["tok-key", "let"], ["", " i = "], ["tok-num", "0"], ["", "; i "], ["tok-key", "<"], ["", " nums.length; i++) {"]] as Array<[string, string]>,
  [["", "    "], ["tok-key", "const"], ["", " need = target - nums[i];"]] as Array<[string, string]>,
  [["", "    "], ["tok-key", "if"], ["", " (seen."], ["tok-fn", "has"], ["", "(need)) "], ["tok-key", "return"], ["", " [seen."], ["tok-fn", "get"], ["", "(need), i];"]] as Array<[string, string]>,
  [["", "    seen."], ["tok-fn", "set"], ["", "(nums[i], i);"]] as Array<[string, string]>,
  [["", "  }"]] as Array<[string, string]>,
  [["", "};"]] as Array<[string, string]>,
];

function CodeTokens({ lines }: { lines: Array<Array<[string, string]>> }) {
  return (
    <code>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {line.map(([className, text], tokenIndex) =>
            className ? (
              <span key={tokenIndex} className={className}>
                {text}
              </span>
            ) : (
              <span key={tokenIndex}>{text}</span>
            ),
          )}
          {lineIndex < lines.length - 1 ? "\n" : null}
        </span>
      ))}
    </code>
  );
}

function IconLayers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 4-4 3 3 5-6" />
    </svg>
  );
}

function IconTerminal() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const FEATURES = [
  {
    title: "A curated problem set",
    description:
      "30 hand-picked problems across Easy, Medium, and Hard, each with worked examples, constraints, and real test cases.",
    icon: <IconLayers />,
    preview: (
      <div className="mock-stack">
        {[
          ["1", "Two Sum", "Easy"],
          ["2", "Add Two Numbers", "Medium"],
          ["3", "Longest Substring", "Medium"],
          ["4", "Median of Two Arrays", "Hard"],
        ].map(([index, title, difficulty]) => (
          <div className="mock-row" key={index}>
            <span className="mock-index">#{index}</span>
            <span className="mock-title">{title}</span>
            <span className={`badge badge-${difficulty.toLowerCase()}`}>{difficulty}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Six runtimes, one editor",
    description:
      "Write in JavaScript, Python, C, C++, Go, or Rust with a Monaco editor, syntax highlighting, and per-language snippets.",
    icon: <IconCode />,
    preview: (
      <div className="mock-editor">
        <div className="mock-tabs">
          <span className="mock-tab is-active">solution.py</span>
          <span className="mock-tab">python3</span>
        </div>
        <pre className="mock-code">
          <code>
            <span className="tok-key">class</span> <span className="tok-type">Solution</span>:{"\n"}
            {"    "}<span className="tok-key">def</span> <span className="tok-fn">twoSum</span>(self, nums, target):{"\n"}
            {"        "}seen = {"{}"}{"\n"}
            {"        "}<span className="tok-key">for</span> i, n <span className="tok-key">in</span> <span className="tok-fn">enumerate</span>(nums):{"\n"}
            {"            "}<span className="tok-key">if</span> target - n <span className="tok-key">in</span> seen:{"\n"}
            {"                "}<span className="tok-key">return</span> [seen[target - n], i]
          </code>
        </pre>
      </div>
    ),
  },
  {
    title: "Verdicts you can act on",
    description:
      "Every submission reports the exact failing case, expected and actual output, runtime, and a clear verdict.",
    icon: <IconShield />,
    preview: (
      <div>
        <div className="mock-verdict">
          <IconCheck /> Accepted · 3/3 test cases
        </div>
        <div className="mock-case">
          <span>Case 1 · [2,7,11,15] → 9</span>
          <span className="is-pass">12 ms ✓</span>
        </div>
        <div className="mock-case">
          <span>Case 2 · [3,2,4] → 6</span>
          <span className="is-pass">9 ms ✓</span>
        </div>
        <div className="mock-case">
          <span>Case 3 · [3,3] → 6</span>
          <span className="is-pass">8 ms ✓</span>
        </div>
      </div>
    ),
  },
  {
    title: "Progress that stays visible",
    description:
      "Results persist after refresh or a dropped connection, and your submission history is scoped to your account.",
    icon: <IconTrend />,
    preview: (
      <div>
        <div className="chart">
          {[38, 54, 44, 72, 60, 88, 76].map((height, index) => (
            <div className="chart-bar" key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="chart-caption">
          <span>Last 7 sessions</span>
          <span>Growing steadily</span>
        </div>
      </div>
    ),
  },
];

const WORKSPACE_FEATURES = [
  {
    icon: <IconTerminal />,
    title: "Prompt and editor side by side",
    desc: "Read the description while you type, with a draggable split you can resize.",
  },
  {
    icon: <IconLayers />,
    title: "Real test cases, not samples",
    desc: "Switch between cases and inspect the exact input, expected output, and your result.",
  },
  {
    icon: <IconBolt />,
    title: "Run before you submit",
    desc: "Try one input or the full suite without creating a submission record.",
  },
  {
    icon: <IconTrend />,
    title: "History you can revisit",
    desc: "Accepted and failed attempts stay attached to your profile and problem.",
  },
];

const FLOW = [
  {
    kicker: "01 · api",
    title: "Validate",
    desc: "The request is checked and a submission row is written as Pending.",
    meta: "zod + Postgres",
  },
  {
    kicker: "02 · redis",
    title: "Enqueue",
    desc: "A job joins the codeforge-judge queue and waits for a worker.",
    meta: "BullMQ",
  },
  {
    kicker: "03 · worker",
    title: "Execute",
    desc: "A separate process compiles and runs the code, then records the verdict.",
    meta: "its own service",
  },
  {
    kicker: "04 · docker",
    title: "Isolate",
    desc: "Each run gets a disposable container with no network and a read-only root.",
    meta: "rm -f in finally",
  },
];

const FAQ = [
  {
    question: "Which languages can I submit?",
    answer:
      "JavaScript and Python use the function-calling judge today. C, C++, Go, and Rust are available for ad-hoc Run while their judge drivers are added. The language registry drives the editor, worker, and image pulls from one place.",
  },
  {
    question: "How is my code executed?",
    answer:
      "Never inside the API process. The API writes a submission and enqueues a job; a dedicated worker creates a short-lived Docker container that runs as uid 65534, with no network, a read-only root filesystem, dropped capabilities, and CPU, memory, PID, and output limits.",
  },
  {
    question: "What happens if the judge worker is offline?",
    answer:
      "The submission stays Pending instead of failing silently. The API reports the missing worker through its health endpoint, and the request returns quickly so the frontend can keep polling for a verdict.",
  },
  {
    question: "Do I need an account to run code?",
    answer:
      "You can browse every problem without signing in. Run and Submit require an account so results can be tied to your history.",
  },
  {
    question: "Where are my submissions stored?",
    answer:
      "In PostgreSQL, scoped to your account. Verdicts and per-case output persist after a refresh or disconnect, and deleting an account removes its submissions.",
  },
  {
    question: "What verdicts can I get?",
    answer:
      "Accepted, Wrong Answer, Compilation Error, Runtime Error, Time Limit Exceeded, Memory Limit Exceeded, Output Limit Exceeded, Unsupported Language, Judge Unavailable, and Judge Error.",
  },
];

const HIGHLIGHTS = [
  {
    title: "Yours by default",
    description:
      "Your code and verdicts belong to your account, not to a third-party execution service.",
    items: [
      "Submissions are scoped to the signed-in user.",
      "Runs and verdicts are stored in your own PostgreSQL database.",
      "Deleting an account cascades to its submissions.",
      "No submitted code is sent to an external API.",
    ],
  },
  {
    title: "Feedback you can trust",
    description:
      "The judge is built to be boring: same limits, same rules, every time.",
    items: [
      "A fresh container per run, removed even on timeout or crash.",
      "Network access disabled at the container level.",
      "Memory, CPU, PID, and output caps enforced by the daemon.",
      "Verdicts keep per-case output so failures are debuggable.",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-panel">
          <div className="hero-content">
            <span className="hero-eyebrow">Open-source coding platform</span>
            <h1 className="hero-title">Practice algorithms in a workspace that gets out of your way.</h1>
            <p className="hero-lede">
              Browse curated problems, write in six languages, and submit to a Docker-isolated
              judge. Verdicts land in seconds and stay attached to your account.
            </p>
            <div className="hero-actions">
              <Link to="/problems" className="btn btn-on-blue">
                Start solving
                <IconArrow />
              </Link>
              <Link to="/register" className="btn btn-on-blue-ghost">
                Create free account
              </Link>
            </div>
          </div>

          <div className="hero-window" aria-hidden="true">
            <div className="window-bar">
              <span className="window-dot is-red" />
              <span className="window-dot is-yellow" />
              <span className="window-dot is-green" />
              <span className="window-title">two-sum.js</span>
              <span className="window-badge">Accepted</span>
            </div>
            <pre className="hero-code">
              <CodeTokens lines={HERO_CODE} />
            </pre>
            <div className="window-foot">
              <span>3/3 test cases</span>
              <span>runtime 12 ms</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head">
          <span className="section-eyebrow">Most open</span>
          <h2 className="section-title">A judge you can read end to end.</h2>
          <p className="section-lede">
            The API, queue, worker, schema, and container policy live in one repository, so every
            verdict can be traced back to the code that produced it.
          </p>
        </div>

        <div className="showcase">
          <div className="showcase-window">
            <div className="window-bar">
              <span className="window-dot is-red" />
              <span className="window-dot is-yellow" />
              <span className="window-dot is-green" />
              <span className="window-title">runic — problems</span>
              <span className="window-badge">30 problems</span>
            </div>
            <div className="showcase-art">
              <div className="showcase-copy">
                <div className="showcase-wordmark">RUNIC</div>
                <div className="showcase-tagline">Write it. Run it. Understand the verdict.</div>
              </div>
            </div>
            <div className="showcase-strip">
              <span className="badge">6 languages</span>
              <span className="badge">Docker isolated</span>
              <span className="badge">Redis queued</span>
              <span className="badge">Results persisted</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head">
          <span className="section-eyebrow">The essentials</span>
          <h2 className="section-title">Read, write, run, and review in one place.</h2>
          <p className="section-lede">
            Everything needed to turn practice into progress, without a second tab or a local
            toolchain.
          </p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-icon">{feature.icon}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
              <div className="feature-preview">{feature.preview}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="split-feature">
          <div>
            <span className="section-eyebrow">Built for how you actually work</span>
            <h2 className="section-title">One workspace from prompt to verdict.</h2>
            <p className="section-lede">
              Pick a language, edit with a real Monaco editor, and see exactly which test case
              failed — without leaving the page.
            </p>

            <div className="feature-list">
              {WORKSPACE_FEATURES.map((item) => (
                <div className="feature-list-item" key={item.title}>
                  <span className="feature-list-icon">{item.icon}</span>
                  <div>
                    <div className="feature-list-title">{item.title}</div>
                    <div className="feature-list-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="workspace-mock">
            <div className="window-bar">
              <span className="window-dot is-red" />
              <span className="window-dot is-yellow" />
              <span className="window-dot is-green" />
              <span className="window-title">runic — two-sum</span>
              <span className="window-badge">Accepted</span>
            </div>
            <div className="workspace-mock-body">
              <div className="workspace-mock-side">
                <div className="workspace-mock-side-title">Problems</div>
                <div className="workspace-mock-item is-active">
                  <span>#1</span> Two Sum
                </div>
                <div className="workspace-mock-item">
                  <span>#2</span> Add Two Numbers
                </div>
                <div className="workspace-mock-item">
                  <span>#3</span> Longest Substring
                </div>
                <div className="workspace-mock-side-title" style={{ marginTop: 12 }}>
                  Account
                </div>
                <div className="workspace-mock-item">Profile</div>
                <div className="workspace-mock-item">Submissions</div>
              </div>
              <div className="workspace-mock-main">
                <div className="workspace-mock-head">
                  <strong>Two Sum</strong>
                  <span className="badge badge-easy">Easy</span>
                  <span className="badge">Explanation</span>
                </div>
                <div className="mock-editor">
                  <div className="mock-tabs">
                    <span className="mock-tab is-active">main.js</span>
                    <span className="mock-tab">JavaScript</span>
                  </div>
                  <pre className="mock-code">
                    <code>
                      <span className="tok-key">var</span> <span className="tok-fn">twoSum</span> = (nums, target) =&gt; {"{"}{"\n"}
                      {"  "}<span className="tok-key">const</span> seen = <span className="tok-key">new</span> <span className="tok-type">Map</span>();{"\n"}
                      {"  "}<span className="tok-key">for</span> (<span className="tok-key">let</span> i = <span className="tok-num">0</span>; i &lt; nums.length; i++) {"{"}{"\n"}
                      {"    "}<span className="tok-key">const</span> need = target - nums[i];{"\n"}
                      {"    "}<span className="tok-key">if</span> (seen.<span className="tok-fn">has</span>(need)) <span className="tok-key">return</span> [seen.<span className="tok-fn">get</span>(need), i];{"\n"}
                      {"  }"}{"\n"}
                      {"}"};
                    </code>
                  </pre>
                </div>
                <div className="mock-verdict" style={{ marginTop: 10 }}>
                  <IconCheck /> Accepted · 3/3 test cases · 12 ms
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head">
          <span className="section-eyebrow">Privacy and trust</span>
          <h2 className="section-title">Your code stays yours.</h2>
          <p className="section-lede">
            Execution is isolated, results are durable, and nothing about a submission leaves the
            system you run.
          </p>
        </div>

        <div className="check-grid">
          {HIGHLIGHTS.map((card) => (
            <article className="check-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <ul className="check-list">
                {card.items.map((item) => (
                  <li key={item}>
                    <IconCheck />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" id="how-it-works">
        <div className="section-head">
          <span className="section-eyebrow">How judging works</span>
          <h2 className="section-title">Queued in, verdict out.</h2>
          <p className="section-lede">
            Submissions are handed to a dedicated worker, so the API never executes untrusted code.
            Every run gets a fresh container.
          </p>
        </div>

        <div className="flow">
          {FLOW.map((step, index) => [
            <div className="flow-step" key={step.kicker}>
              <div className="flow-kicker">{step.kicker}</div>
              <div className="flow-title">{step.title}</div>
              <div className="flow-desc">{step.desc}</div>
              <span className="flow-meta">{step.meta}</span>
            </div>,
            index < FLOW.length - 1 ? (
              <span className="flow-arrow" key={`${step.kicker}-arrow`} aria-hidden="true">
                <IconArrow />
              </span>
            ) : null,
          ])}
        </div>

        <div className="flow-note">
          <IconLock />
          <span>
            Containers run with no network, a read-only root filesystem, uid 65534, dropped
            capabilities, and CPU, memory, PID, and output limits. The container is removed on
            success, failure, timeout, and crash.
          </span>
        </div>
      </section>

      <section className="landing-section">
        <div className="split-feature">
          <div>
            <span className="section-eyebrow">Open source</span>
            <h2 className="section-title">Read the judge, not just the docs.</h2>
            <p className="section-lede">
              The API, the worker, the database schema, and the container policy are all in the
              same repository. Fork it, run it locally, or check exactly what happens to your code.
            </p>
            <div className="hero-actions" style={{ marginTop: 24 }}>
              <a className="btn btn-primary" href={REPO_URL} target="_blank" rel="noreferrer">
                View repository
                <IconArrow />
              </a>
              <a
                className="btn"
                href={`${REPO_URL}/blob/main/docs/judge-architecture.md`}
                target="_blank"
                rel="noreferrer"
              >
                Judge architecture
              </a>
            </div>
          </div>

          <div className="check-card">
            <div className="feature-list" style={{ marginTop: 0 }}>
              <div className="feature-list-item">
                <span className="feature-list-icon">
                  <IconLayers />
                </span>
                <div>
                  <div className="feature-list-title">30 problems</div>
                  <div className="feature-list-desc">Easy, Medium, and Hard, with full test data.</div>
                </div>
              </div>
              <div className="feature-list-item">
                <span className="feature-list-icon">
                  <IconCode />
                </span>
                <div>
                  <div className="feature-list-title">6 runtimes</div>
                  <div className="feature-list-desc">JavaScript, Python, C, C++, Go, and Rust.</div>
                </div>
              </div>
              <div className="feature-list-item">
                <span className="feature-list-icon">
                  <IconShield />
                </span>
                <div>
                  <div className="feature-list-title">10 verdicts</div>
                  <div className="feature-list-desc">From Accepted through Judge Error, all explicit.</div>
                </div>
              </div>
              <div className="feature-list-item">
                <span className="feature-list-icon">
                  <IconLock />
                </span>
                <div>
                  <div className="feature-list-title">0 host mounts</div>
                  <div className="feature-list-desc">Only the job's own directory, read-only.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head">
          <span className="section-eyebrow">Simple plans</span>
          <h2 className="section-title">Free to use, free to host.</h2>
          <p className="section-lede">
            No tiers hidden behind a credit card. Use the hosted instance or run the whole stack
            yourself.
          </p>
        </div>

        <div className="plan-grid">
          <article className="plan plan--featured">
            <div className="plan-name">Hosted</div>
            <div className="plan-price">
              $0 <span>/ forever</span>
            </div>
            <p className="plan-note">For practicing with an account on this instance.</p>
            <ul className="plan-list">
              <li>
                <IconCheck /> All 30 problems and test cases
              </li>
              <li>
                <IconCheck /> Run and submit in 6 languages
              </li>
              <li>
                <IconCheck /> Persistent verdict history
              </li>
              <li>
                <IconCheck /> Isolated Docker judge
              </li>
            </ul>
            <Link to="/register" className="btn btn-primary btn-block">
              Create free account
            </Link>
          </article>

          <article className="plan">
            <div className="plan-name">Self-hosted</div>
            <div className="plan-price">
              $0 <span>/ your infrastructure</span>
            </div>
            <p className="plan-note">For running the same stack on your own machine or server.</p>
            <ul className="plan-list">
              <li>
                <IconCheck /> PostgreSQL, Redis, and Docker Compose
              </li>
              <li>
                <IconCheck /> API and judge worker as separate services
              </li>
              <li>
                <IconCheck /> Same schema and migrations
              </li>
              <li>
                <IconCheck /> No vendor lock-in
              </li>
            </ul>
            <a className="btn btn-block" href={REPO_URL} target="_blank" rel="noreferrer">
              View repository
            </a>
          </article>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head">
          <span className="section-eyebrow">FAQ</span>
          <h2 className="section-title">Everything you need to know before you run.</h2>
        </div>

        <div className="faq">
          {FAQ.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
