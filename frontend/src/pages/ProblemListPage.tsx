import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import ProblemFilters from "../components/problems/ProblemFilters";
import ProblemTable, { type ProblemListItem } from "../components/problems/ProblemTable";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { api } from "../lib/api";

interface ProblemsResponse {
  problems: ProblemListItem[];
  total: number;
  page: number;
  limit: number;
}

// Dashboard + problem browser: search, filter by difficulty/tag, sort, paginate.
export default function ProblemListPage() {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [problems, setProblems] = useState<ProblemListItem[]>([]);
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
    <div className="pb-6">
      <PageHeader
        eyebrow="Problem set"
        title="Pick a problem and start writing."
        description="30 curated problems across Easy, Medium, and Hard. Filter by difficulty or topic, then run and submit in six languages."
      />

      <ProblemFilters
        query={q}
        difficulty={difficulty}
        tag={tag}
        sort={sort}
        tags={tags}
        onQueryChange={(value) => {
          setQ(value);
          setPage(1);
        }}
        onDifficultyChange={(value) => {
          setDifficulty(value);
          setPage(1);
        }}
        onTagChange={(value) => {
          setTag(value);
          setPage(1);
        }}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
        }}
      />

      {error ? (
        <Card className="flex flex-wrap items-center gap-3 border-danger/30 p-5 text-danger" role="alert">
          <strong>Could not load problems.</strong>
          <span className="text-sm">{error}</span>
          <Button type="button" onClick={() => setReloadToken((n) => n + 1)}>
            Retry
          </Button>
        </Card>
      ) : loading ? (
        <Card className="p-5 text-sm text-ink-secondary" role="status">Loading problems…</Card>
      ) : problems.length === 0 ? (
        <Card className="flex flex-wrap items-center gap-4 p-5 text-sm text-ink-secondary">
          <span>No problems match your filters.</span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setQ("");
              setDifficulty("");
              setTag("");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </Card>
      ) : (
        <>
          <ProblemTable problems={problems} />
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
        <div className="mt-4 text-xs text-ink-subtle">
          Showing all problems. Use the filters above or the search box in the header to narrow
          the list.
        </div>
      )}
    </div>
  );
}
