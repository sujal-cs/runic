import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    api("/api/users/me/submissions").then((d) => setSubs(d.submissions)).catch(() => {});
  }, []);

  if (!user) return <div>Please log in.</div>;

  return (
    <div>
      <h1>{user.username}</h1>
      <p style={{ color: "var(--text-subtle)" }}>{user.email}</p>
      <h2>Submission History</h2>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
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
            {subs.map((s) => (
              <tr key={s.id}>
                <td>
                  {s.title} <span style={{ color: "var(--text-subtle)" }}>({s.difficulty})</span>
                </td>
                <td>{s.language}</td>
                <td className={s.status === "Accepted" ? "result-ok" : "result-fail"}>{s.status}</td>
                <td>{s.runtime_ms} ms</td>
                <td>{new Date(s.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
