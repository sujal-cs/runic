import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const REPO_URL = "https://github.com/sujal-cs/runic";

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square">
        <path d="M7 19V5h7l4 4-4 4H7" />
        <path d="M13 13l5 6" />
      </svg>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 4h4v16h-4" />
      <path d="M10 8l-4 4 4 4M6 12h11" />
    </svg>
  );
}

// Shared application shell. `fullWidth` removes the centered container for
// immersive routes (the problem workspace) and hides the marketing footer.
export default function Layout({ children, fullWidth = false }: { children: React.ReactNode; fullWidth?: boolean }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/problems?q=${encodeURIComponent(trimmed)}` : "/problems");
  };

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <BrandMark />
            Runic
          </Link>

          <nav className="nav-links" aria-label="Main">
            <Link to="/problems" className={`nav-link${location.pathname.startsWith("/problems") ? " is-active" : ""}`}>
              Problems
            </Link>
            {user && (
              <Link to="/profile" className={`nav-link${location.pathname === "/profile" ? " is-active" : ""}`}>
                Profile
              </Link>
            )}
          </nav>

          <div className="nav-spacer" />

          <div className="nav-actions">
            <form className="nav-search" onSubmit={search} role="search">
              <SearchIcon />
              <input
                aria-label="Search problems"
                placeholder="Search problems…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </form>

            <button type="button" className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <span className="nav-user">
                <span>{user.username}</span>
                <button
                  type="button"
                  title="Log out"
                  aria-label="Log out"
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                >
                  <LogoutIcon />
                </button>
              </span>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={`main-content${fullWidth ? " is-full" : ""}`}>
        {fullWidth ? children : <div className="container">{children}</div>}
      </main>

      {!fullWidth && (
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <Link to="/" className="brand">
                <BrandMark />
                Runic
              </Link>
              <p>
                A focused place to practice data structures and algorithms, with an isolated
                judge that never runs your code on the application server.
              </p>
            </div>

            <div className="footer-col">
              <h4>Product</h4>
              <Link to="/problems">Problems</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/register">Create account</Link>
            </div>

            <div className="footer-col">
              <h4>Platform</h4>
              <a href={REPO_URL} target="_blank" rel="noreferrer">
                Repository
              </a>
              <a href={`${REPO_URL}/blob/main/docs/judge-architecture.md`} target="_blank" rel="noreferrer">
                Judge architecture
              </a>
              <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
                Issues
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Runic. Open source under the repository license.</span>
            <span>React · Express · PostgreSQL · Redis · Docker</span>
          </div>
        </footer>
      )}
    </div>
  );
}
