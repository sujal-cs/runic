interface Problem {
  description: string;
  constraints: string[];
}

export default function DescriptionPanel({ problem }: { problem: Problem }) {
  return (
    <div className="card" style={{ height: "100%", overflow: "auto" }}>
      <div dangerouslySetInnerHTML={{ __html: problem.description }} />
      {problem.constraints && problem.constraints.length > 0 && (
        <>
          <h3>Constraints</h3>
          <ul>
            {problem.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
