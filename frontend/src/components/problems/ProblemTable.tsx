import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import type { BadgeVariant } from "../ui/Badge";
import { TableCell, TableHead, TableHeaderCell, TableShell } from "../ui/Table";

export interface ProblemListItem {
  id: number;
  frontend_id: string;
  title: string;
  slug: string;
  difficulty: string;
  tags: string[];
  acceptance_rate: number;
}

function difficultyVariant(difficulty: string): BadgeVariant {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "easy";
    case "medium":
      return "medium";
    case "hard":
      return "hard";
    default:
      return "neutral";
  }
}

export default function ProblemTable({ problems }: { problems: ProblemListItem[] }) {
  return (
    <TableShell>
      <TableHead>
        <tr>
          <TableHeaderCell>#</TableHeaderCell>
          <TableHeaderCell>Title</TableHeaderCell>
          <TableHeaderCell>Difficulty</TableHeaderCell>
          <TableHeaderCell>Tags</TableHeaderCell>
          <TableHeaderCell>Acceptance</TableHeaderCell>
        </tr>
      </TableHead>
      <tbody className="divide-y divide-stroke">
        {problems.map((problem) => (
          <tr className="transition-colors hover:bg-surface-muted" key={problem.id}>
            <TableCell className="w-14 font-code text-xs text-ink-subtle">
              {problem.frontend_id}
            </TableCell>
            <TableCell className="min-w-52">
              <Link className="font-semibold text-ink hover:text-brand" to={`/problems/${problem.slug}`}>
                {problem.title}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={difficultyVariant(problem.difficulty)}>
                {problem.difficulty}
              </Badge>
            </TableCell>
            <TableCell className="min-w-40">
              <div className="flex flex-wrap gap-1">
                {(problem.tags || []).slice(0, 3).map((tag) => (
                  <Badge key={tag} className="px-2 py-0.5 text-[10px]">{tag}</Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap font-code text-xs">
              {problem.acceptance_rate ? `${Number(problem.acceptance_rate).toFixed(1)}%` : "—"}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
