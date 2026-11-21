import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Button, LinkButton } from "./ui/Button";
import { TextInput } from "./ui/Field";
import Brand from "./Brand";

function SearchIcon() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "dark" ? (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  ) : (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export default function Navbar() {
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

  const navClass = (active: boolean) =>
    `rounded-control px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-surface-muted text-ink" : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center gap-4 px-6 max-sm:px-4">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <Link to="/problems" className={navClass(location.pathname.startsWith("/problems"))}>
            Problems
          </Link>
          {user && (
            <Link to="/profile" className={navClass(location.pathname === "/profile")}>
              Profile
            </Link>
          )}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <form className="relative hidden items-center lg:flex" onSubmit={search} role="search">
            <TextInput
              aria-label="Search problems"
              placeholder="Search problems…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-[34px] w-[196px] pl-8 text-[13px]"
            />
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle">
              <SearchIcon />
            </span>
          </form>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="size-[34px] rounded-control p-0"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <ThemeIcon theme={theme} />
          </Button>

          {user ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-stroke bg-surface-muted py-1 pl-3 pr-1 text-xs font-medium text-ink-secondary">
              <span className="max-w-28 truncate max-sm:hidden">{user.username}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-7 rounded-full p-0"
                title="Log out"
                aria-label="Log out"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 4h4v16h-4" />
                  <path d="M10 8l-4 4 4 4M6 12h11" />
                </svg>
              </Button>
            </div>
          ) : (
            <>
              <LinkButton to="/login" variant="ghost" size="sm">Sign in</LinkButton>
              <LinkButton to="/register" variant="primary" size="sm">Get started</LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
