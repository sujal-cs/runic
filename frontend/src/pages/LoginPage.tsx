import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const n = sessionStorage.getItem("notice");
    if (n) {
      setNotice(n);
      sessionStorage.removeItem("notice");
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <span className="auth-eyebrow">Welcome back</span>
        <h1 className="auth-title">Sign in to Runic</h1>
        <p className="auth-sub">
          Pick up where you left off. Your submissions and verdicts are waiting.
        </p>

        {notice && <div className="form-notice" style={{ marginTop: 18 }}>{notice}</div>}

        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <button className="btn btn-primary btn-block" type="submit">
            Sign in
          </button>
        </form>

        <p className="form-note">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
