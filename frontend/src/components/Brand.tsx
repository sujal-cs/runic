import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2.5 font-heading text-[17px] font-bold tracking-tight text-ink"
    >
      <span className="grid size-7 place-items-center rounded-lg bg-brand text-white shadow-soft">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="square"
          aria-hidden="true"
        >
          <path d="M7 19V5h7l4 4-4 4H7" />
          <path d="M13 13l5 6" />
        </svg>
      </span>
      Runic
    </Link>
  );
}
