import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(username, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <span className="auth-eyebrow">Get started</span>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">
          Free to use. Browse all 30 problems, run and submit in six languages, and keep your
          verdict history.
        </p>

        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              className="input"
              autoComplete="username"
              placeholder="ada"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <button className="btn btn-primary btn-block" type="submit">
            Create account
          </button>
        </form>

        <p className="form-note">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
