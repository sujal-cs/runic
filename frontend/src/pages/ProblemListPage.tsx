import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../components/Pagination";
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

interface ProblemsResponse {
  problems: Problem[];
  total: number;
  page: number;
  limit: number;
}

// Dashboard + problem browser: search, filter by difficulty/tag, sort, paginate.
export default function ProblemListPage() {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [problems, setProblems] = useState<Problem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState(urlQuery);
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("id");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  // The navbar search navigates to /problems?q=…; mirror that into the filter
  // box so the URL and the visible state never disagree.
  useEffect(() => {
    setQ(urlQuery);
    setPage(1);
  }, [urlQuery]);

  useEffect(() => {
    api("/api/problems/tags")
      .then((d) => setTags(d.tags))
      .catch((err: Error) => console.error("[problems] failed to load tags", err));
  }, []);

  useEffect(() => {
    // Ignore responses from an outdated filter/page combination so fast typing
    // or quick page clicks cannot leave stale rows on screen.
    let active = true;

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (difficulty) params.set("difficulty", difficulty);
    if (tag) params.set("tag", tag);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(pageSize));

    setLoading(true);
    setError("");

    api(`/api/problems?${params.toString()}`)
      .then((d: ProblemsResponse) => {
        if (!active) return;
        setProblems(d.problems);
        setTotal(d.total);
        // A filter change can invalidate the current page (for example going
        // from page 3 of all problems to 1 page of Easy ones). Clamp so the
        // user never sits on an empty page they cannot navigate away from.
        const lastPage = Math.max(1, Math.ceil(d.total / pageSize));
        if (d.page > lastPage) setPage(lastPage);
      })
      .catch((err: Error) => {
        if (!active) return;
        console.error("[problems] failed to load problems", err);
        setProblems([]);
        setTotal(0);
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [q, difficulty, tag, sort, page, pageSize, reloadToken]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilters = Boolean(q || difficulty || tag);

  return (
    <div>
      <header className="page-head">
        <span className="page-eyebrow">Problem set</span>
        <h1 className="page-title">Pick a problem and start writing.</h1>
        <p className="page-lede">
          30 curated problems across Easy, Medium, and Hard. Filter by difficulty or topic,
          then run and submit in six languages.
        </p>
      </header>

      <div className="filter-bar">
        <input
          className="input"
          aria-label="Search problems"
          placeholder="Search by title…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="input"
          aria-label="Difficulty"
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
          aria-label="Tag"
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
          aria-label="Sort order"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="id">Sort by #</option>
          <option value="title">Sort by title</option>
          <option value="difficulty">Sort by difficulty</option>
        </select>
      </div>

      {error ? (
        <div className="card state state-error" role="alert">
          <strong>Could not load problems.</strong>
          <span>{error}</span>
          <button type="button" className="btn" onClick={() => setReloadToken((n) => n + 1)}>
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="card state">Loading problems…</div>
      ) : problems.length === 0 ? (
        <div className="card state">
          No problems match your filters.
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setQ("");
              setDifficulty("");
              setTag("");
              setPage(1);
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="table-shell">
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
                    <td className="table-index">{p.frontend_id}</td>
                    <td>
                      <Link to={`/problems/${p.slug}`}>{p.title}</Link>
                    </td>
                    <td>
                      <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                    </td>
                    <td className="table-tags">
                      {(p.tags || []).slice(0, 3).map((t) => (
                        <span className="tag" key={t}>{t}</span>
                      ))}
                    </td>
                    <td className="table-mono">
                      {p.acceptance_rate ? `${Number(p.acceptance_rate).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={Math.min(page, totalPages)}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
          />
        </>
      )}

      {!hasFilters && !loading && !error && problems.length > 0 && (
        <div className="list-note">
          Showing all problems. Use the filters above or the search box in the header to narrow
          the list.
        </div>
      )}
    </div>
  );
}
