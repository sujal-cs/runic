import { useEffect, useState } from "react";
import ProfileSummary from "../components/profile/ProfileSummary";
import SubmissionHistory from "../components/profile/SubmissionHistory";
import type { SubmissionHistoryItem } from "../components/profile/SubmissionHistory";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<SubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/users/me/submissions")
      .then((d) => setSubs(d.submissions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) {
    return <Card className="my-12 p-5 text-sm text-ink-secondary">Please log in.</Card>;
  }

  const accepted = subs.filter((s) => s.status === "Accepted");
  const solved = new Set(accepted.map((s) => s.title)).size;

  return (
    <div className="pb-10 pt-8">
      <ProfileSummary
        user={user}
        submissionCount={subs.length}
        solvedCount={solved}
        acceptedCount={accepted.length}
      />
      <SubmissionHistory submissions={subs} loading={loading} />
    </div>
  );
}
