import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/users/me/submissions")
      .then((d) => setSubs(d.submissions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <div className="card state">Please log in.</div>;

  const accepted = subs.filter((s) => s.status === "Accepted");
  const solved = new Set(accepted.map((s) => s.title)).size;

  return (
    <div>
      <header className="profile-head">
        <span className="avatar" aria-hidden="true">{user.username.slice(0, 1)}</span>
        <div>
          <h1 style={{ fontSize: "1.8rem" }}>{user.username}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
        <div className="profile-stats">
          <div className="stat">
            <div className="stat-value">{subs.length}</div>
            <div className="stat-label">Submissions</div>
          </div>
          <div className="stat">
            <div className="stat-value">{solved}</div>
            <div className="stat-label">Solved</div>
          </div>
          <div className="stat">
            <div className="stat-value">{accepted.length}</div>
            <div className="stat-label">Accepted</div>
          </div>
        </div>
      </header>

      <div className="section-head" style={{ marginBottom: 16 }}>
        <h2 className="section-title" style={{ marginTop: 0 }}>Submission history</h2>
        <p className="section-lede">
          Every run and submission is stored against your account. Failed attempts stay here so
          you can review what changed.
        </p>
      </div>

      <div className="table-shell">
        <table className="table">
          <thead>
            <tr>
              <th>Problem</th>
              <th>Language</th>
              <th>Status</th>
              <th>Runtime</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="table-empty">Loading submissions…</td>
              </tr>
            ) : subs.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  No submissions yet.{" "}
                  <Link to="/problems">Solve your first problem</Link>.
                </td>
              </tr>
            ) : (
              subs.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{s.title}</span>{" "}
                    <span style={{ color: "var(--text-subtle)" }}>({s.difficulty})</span>
                  </td>
                  <td>{s.language}</td>
                  <td>
                    <span className={`badge ${s.status === "Accepted" ? "badge-easy" : "badge-hard"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="table-mono">{s.runtime_ms} ms</td>
                  <td>{new Date(s.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
