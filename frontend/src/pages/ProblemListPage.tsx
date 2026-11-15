import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

interface Problem {
  id: number;
  frontend_id: string;
  title: string;
  slug: string;
  difficulty: string;
  tags: string[];
  acceptance_rate: number;
}

// Dashboard + problem browser: search, filter by difficulty/tag, sort, paginate.
export default function ProblemListPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("id");
  const [tags, setTags] = useState<string[]>([]);
  const limit = 20;

  useEffect(() => {
    api("/api/problems/tags").then((d) => setTags(d.tags)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (difficulty) params.set("difficulty", difficulty);
    if (tag) params.set("tag", tag);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(limit));
    api(`/api/problems?${params.toString()}`)
      .then((d) => {
        setProblems(d.problems);
        setTotal(d.total);
      })
      .catch(() => {});
  }, [q, difficulty, tag, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Problems</h1>
      <div className="card" style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          className="input"
          style={{ flex: 2, minWidth: 200 }}
          placeholder="Search problems..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="input"
          style={{ flex: 1, minWidth: 120 }}
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          className="input"
          style={{ flex: 1, minWidth: 120 }}
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="input"
          style={{ flex: 1, minWidth: 120 }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="id">Sort by #</option>
          <option value="title">Sort by title</option>
          <option value="difficulty">Sort by difficulty</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Tags</th>
              <th>Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p) => (
              <tr key={p.id}>
                <td>{p.frontend_id}</td>
                <td>
                  <Link to={`/problems/${p.slug}`}>{p.title}</Link>
                </td>
                <td>
                  <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                </td>
                <td>{(p.tags || []).slice(0, 3).join(", ")}</td>
                <td>{p.acceptance_rate ? `${Number(p.acceptance_rate).toFixed(1)}%` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ color: "var(--text-subtle)", fontSize: 14 }}>
          {total} problems
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span style={{ alignSelf: "center", fontSize: 14 }}>
            {page} / {totalPages}
          </span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
