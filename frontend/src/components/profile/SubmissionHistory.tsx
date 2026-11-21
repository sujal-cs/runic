import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { TableCell, TableHead, TableHeaderCell, TableShell } from "../ui/Table";

export interface SubmissionHistoryItem {
  id: string;
  title: string;
  difficulty: string;
  language: string;
  status: string;
  runtime_ms: number | null;
  created_at: string;
}

interface SubmissionHistoryProps {
  submissions: SubmissionHistoryItem[];
  loading: boolean;
}

export default function SubmissionHistory({ submissions, loading }: SubmissionHistoryProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-heading text-xl font-bold tracking-tight text-ink">Submission history</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Review your past attempts and see how your solutions changed.
        </p>
      </div>
      <TableShell>
        <TableHead>
          <tr>
            <TableHeaderCell>Problem</TableHeaderCell>
            <TableHeaderCell>Language</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Runtime</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
          </tr>
        </TableHead>
        <tbody>
          {loading ? (
            <tr><TableCell className="py-8 text-center" colSpan={5}>Loading submissions…</TableCell></tr>
          ) : submissions.length === 0 ? (
            <tr>
              <TableCell className="py-8 text-center" colSpan={5}>
                No submissions yet. <Link className="font-semibold text-brand hover:text-brand-hover" to="/problems">Solve your first problem</Link>.
              </TableCell>
            </tr>
          ) : (
            submissions.map((submission) => (
              <tr className="hover:bg-surface-muted" key={submission.id}>
                <TableCell>
                  <span className="font-semibold text-ink">{submission.title}</span>
                  <span className="ml-1 text-ink-subtle">({submission.difficulty})</span>
                </TableCell>
                <TableCell>{submission.language}</TableCell>
                <TableCell>
                  <Badge variant={submission.status === "Accepted" ? "easy" : "hard"}>
                    {submission.status}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap font-code text-xs">
                  {submission.runtime_ms ?? "—"}{submission.runtime_ms == null ? "" : " ms"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(submission.created_at).toLocaleString()}
                </TableCell>
              </tr>
            ))
          )}
        </tbody>
      </TableShell>
    </section>
  );
}
