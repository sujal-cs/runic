import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface ProblemWorkspaceHeaderProps {
  frontendId: string;
  title: string;
  difficulty: string;
  tags: string[];
}

function difficultyVariant(difficulty: string) {
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

export default function ProblemWorkspaceHeader({
  frontendId,
  title,
  difficulty,
  tags,
}: ProblemWorkspaceHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex min-h-14 flex-wrap items-center gap-3 border-b border-stroke bg-canvas px-4 py-2.5 lg:px-6">
      <Button
        className="gap-2 px-3"
        size="sm"
        type="button"
        onClick={() => navigate("/problems")}
      >
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Problems
      </Button>
      <h1 className="min-w-0 flex-1 truncate font-heading text-base font-semibold tracking-tight text-ink">
        {frontendId}. {title}
      </h1>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <Badge variant={difficultyVariant(difficulty)}>{difficulty}</Badge>
        {tags.slice(0, 2).map((tag) => <Badge key={tag}>{tag}</Badge>)}
      </div>
    </header>
  );
}
