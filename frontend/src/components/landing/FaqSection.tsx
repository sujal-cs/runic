const questions = [
  {
    question: "Which languages can I use?",
    answer:
      "The editor includes JavaScript, Python, C, C++, Go, and Rust. JavaScript and Python support submissions; the other languages are available for Run.",
  },
  {
    question: "Do I need an account?",
    answer:
      "You can browse problems without one. Sign in to run or submit code and keep a record of your progress.",
  },
  {
    question: "Where are my results saved?",
    answer:
      "Your submissions and results stay with your account, so you can review them later from your profile.",
  },
];

export default function FaqSection() {
  return (
    <section className="mt-20 pb-8 max-sm:mt-14">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">FAQ</p>
      <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-ink md:text-3xl">
        A few quick answers.
      </h2>
      <div className="mt-6 border-t border-stroke">
        {questions.map((item) => (
          <details className="group border-b border-stroke" key={item.question}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {item.question}
              <span className="font-code text-base font-normal text-ink-subtle group-open:rotate-45">+</span>
            </summary>
            <p className="max-w-[78ch] pb-4 pr-8 text-sm leading-relaxed text-ink-secondary">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
