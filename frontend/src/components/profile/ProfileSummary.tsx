import type { User } from "../../context/AuthContext";

interface ProfileSummaryProps {
  user: User;
  submissionCount: number;
  solvedCount: number;
  acceptedCount: number;
}

export default function ProfileSummary({
  user,
  submissionCount,
  solvedCount,
  acceptedCount,
}: ProfileSummaryProps) {
  const stats = [
    ["Submissions", submissionCount],
    ["Solved", solvedCount],
    ["Accepted", acceptedCount],
  ] as const;

  return (
    <header className="mb-10 flex flex-wrap items-center gap-4 border-b border-stroke pb-6">
      <span className="grid size-12 place-items-center rounded-full bg-brand/15 font-heading text-lg font-bold text-brand" aria-hidden="true">
        {user.username.slice(0, 1)}
      </span>
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink">{user.username}</h1>
        {user.email && <p className="mt-1 text-sm text-ink-subtle">{user.email}</p>}
      </div>
      <div className="ml-auto flex flex-wrap gap-6 max-sm:ml-0">
        {stats.map(([label, value]) => (
          <div className="min-w-16" key={label}>
            <div className="font-heading text-xl font-bold text-ink">{value}</div>
            <div className="text-xs text-ink-subtle">{label}</div>
          </div>
        ))}
      </div>
    </header>
  );
}
