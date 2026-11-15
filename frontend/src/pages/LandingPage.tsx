import { Link } from "react-router-dom";

const features = [
  {
    title: "Curated Problem Set",
    description: "Explore 30+ hand-picked LeetCode problems with descriptions, examples, and constraints.",
  },
  {
    title: "Multi-Language Editor",
    description: "Write solutions in JavaScript, Python, C++, Go, Rust and more with a Monaco-powered editor.",
  },
  {
    title: "Instant Execution",
    description: "Run and submit code in isolated processes with real-time output and verdicts.",
  },
  {
    title: "Track Progress",
    description: "Keep a personal submission history and revisit your past solutions anytime.",
  },
];

// Polished marketing-style landing page that reuses the platform's design tokens
// and adapts automatically to light/dark themes.
export default function LandingPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 64, paddingBottom: 48 }}>
      <section
        style={{
          padding: "64px 0 32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <span className="badge" style={{ background: "rgba(37,99,235,0.12)", color: "var(--brand)" }}>
          Developer-focused coding platform
        </span>
        <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: 0, maxWidth: 760 }}>
          Master data structures and algorithms with a clean, focused workspace
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 640, margin: 0 }}>
          CodeForge gives you a distraction-free environment to browse problems, write code in your
          favorite language, run test cases, and track your progress — all in one place.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Link to="/problems" className="btn btn-primary" style={{ padding: "12px 22px", fontSize: 15 }}>
            Start Solving
          </Link>
          <Link to="/register" className="btn" style={{ padding: "12px 22px", fontSize: 15 }}>
            Create Account
          </Link>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {features.map((f) => (
          <div key={f.title} className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h3 style={{ margin: 0 }}>{f.title}</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>{f.description}</p>
          </div>
        ))}
      </section>

      <section
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          textAlign: "center",
          padding: 40,
        }}
      >
        <h2 style={{ margin: 0 }}>Ready to sharpen your skills?</h2>
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          Jump into the problem set and start building muscle memory today.
        </p>
        <Link to="/problems" className="btn btn-primary" style={{ padding: "10px 20px" }}>
          Browse Problems
        </Link>
      </section>
    </div>
  );
}