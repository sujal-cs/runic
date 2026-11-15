import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

// Shared application shell. When `fullWidth` is set, children are not constrained
// by the centered container, which is used by immersive routes such as the
// problem workspace.
export default function Layout({ children, fullWidth = false }: { children: React.ReactNode; fullWidth?: boolean }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <header className="navbar">
        <Link to="/" className="navbar-brand">
          Runic
        </Link>
        <nav className="navbar-links">
          <Link to="/problems">Problems</Link>
          {user && <Link to="/profile">Profile</Link>}
          <button className="btn btn-ghost" onClick={toggle}>
            {theme === "light" ? "Dark" : "Light"}
          </button>
          {user ? (
            <>
              <span className="text-subtle">{user.username}</span>
              <button
                className="btn"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className="main-content" style={fullWidth ? { padding: 0 } : undefined}>
        {fullWidth ? children : <div className="container">{children}</div>}
      </main>
    </div>
  );
}
