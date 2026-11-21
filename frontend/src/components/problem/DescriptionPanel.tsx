interface Problem {
  description: string;
  constraints: string[];
}

export default function DescriptionPanel({ problem }: { problem: Problem }) {
  return (
    <div className="problem-description h-full overflow-y-auto rounded-card border border-stroke bg-surface p-5">
      <div dangerouslySetInnerHTML={{ __html: problem.description }} />
      {problem.constraints && problem.constraints.length > 0 && (
        <section className="mt-6 border-t border-stroke pt-4">
          <h3 className="mb-2 font-heading text-base font-bold text-ink">Constraints</h3>
          <ul className="list-disc space-y-1 pl-5 text-ink-secondary">
            {problem.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
