import { TextInput, SelectField } from "../ui/Field";
import { Card } from "../ui/Card";

interface ProblemFiltersProps {
  query: string;
  difficulty: string;
  tag: string;
  sort: string;
  tags: string[];
  onQueryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function ProblemFilters({
  query,
  difficulty,
  tag,
  sort,
  tags,
  onQueryChange,
  onDifficultyChange,
  onTagChange,
  onSortChange,
}: ProblemFiltersProps) {
  return (
    <Card className="mb-4 grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-4">
      <TextInput
        aria-label="Search problems"
        placeholder="Search by title…"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        className="sm:col-span-2 lg:col-span-1"
      />
      <SelectField
        aria-label="Difficulty"
        value={difficulty}
        onChange={(event) => onDifficultyChange(event.target.value)}
      >
        <option value="">All difficulties</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </SelectField>
      <SelectField aria-label="Tag" value={tag} onChange={(event) => onTagChange(event.target.value)}>
        <option value="">All tags</option>
        {tags.map((value) => <option key={value} value={value}>{value}</option>)}
      </SelectField>
      <SelectField aria-label="Sort order" value={sort} onChange={(event) => onSortChange(event.target.value)}>
        <option value="id">Sort by #</option>
        <option value="title">Sort by title</option>
        <option value="difficulty">Sort by difficulty</option>
      </SelectField>
    </Card>
  );
}
