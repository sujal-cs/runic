import { Link } from "react-router-dom";
import Brand from "./Brand";

const REPO_URL = "https://github.com/sujal-cs/runic";

export default function Footer() {
  return (
    <footer className="mt-18 border-t border-stroke bg-canvas-soft">
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-[1.5fr_1fr] gap-10 px-6 py-12 max-sm:grid-cols-1 max-sm:gap-7 max-sm:px-4">
        <div>
          <Brand />
          <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-ink-subtle">
            A focused place to practice algorithms and build confidence one problem at a time.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            Explore
          </h2>
          <div className="flex flex-col items-start gap-2 text-sm text-ink-secondary">
            <Link className="hover:text-ink" to="/problems">Problems</Link>
            <Link className="hover:text-ink" to="/profile">Profile</Link>
            <Link className="hover:text-ink" to="/register">Create account</Link>
            <a className="hover:text-ink" href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1120px] border-t border-stroke px-6 py-4 text-xs text-ink-subtle max-sm:px-4">
        © {new Date().getFullYear()} Runic.
      </div>
    </footer>
  );
}
