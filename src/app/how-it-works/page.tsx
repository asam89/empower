import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Empower",
  description:
    "Learn how Empower designs and implements special education programs for Ontario schools: assess, design, implement, support.",
};

const phases = [
  {
    title: "Assess",
    subtitle: "Weeks 1\u20132",
    icon: "\uD83D\uDD0D",
    items: [
      "On-site review of current special education practices",
      "Staffing and resource audit",
      "Student population analysis (aggregate, non-identifying data)",
      "Gap analysis against Ontario special education standards",
      "Stakeholder interviews (administrators, educators, parents)",
    ],
  },
  {
    title: "Design",
    subtitle: "Weeks 3\u20136",
    icon: "\uD83D\uDCDD",
    items: [
      "Structured program framework aligned to Ontario framework",
      "IPRC and IEP process design",
      "Tiered support model (universal, targeted, intensive)",
      "Staffing and roles recommendation",
      "Professional development plan",
      "Parent/guardian engagement strategy",
    ],
  },
  {
    title: "Implement",
    subtitle: "Weeks 7\u201316",
    icon: "\uD83D\uDE80",
    items: [
      "On-site specialist deployment",
      "Staff training and coaching",
      "Process rollout (identification, IEP development, reviews)",
      "Resource setup and space recommendations",
      "Phased implementation with milestone checkpoints",
    ],
  },
  {
    title: "Support",
    subtitle: "Ongoing",
    icon: "\uD83E\uDD1D",
    items: [
      "Quarterly program reviews and adjustments",
      "Continued professional development sessions",
      "Compliance monitoring and reporting",
      "Data-driven success metrics tracking",
      "Direct line to Empower specialists for ad-hoc support",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-brand-primary text-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-[2.2rem] md:text-[2.8rem] font-bold mb-4">
            How it works
          </h1>
          <p className="text-white/80 max-w-xl text-[1.05rem]">
            From initial assessment to ongoing support, Empower takes your school
            through a proven four-phase engagement to build a compliant, effective
            special education program.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="space-y-12">
            {phases.map((phase, i) => (
              <div
                key={phase.title}
                className="bg-surface rounded-2xl border border-border p-8 md:p-10 shadow-sm"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span
                    className="text-[2rem]"
                    role="img"
                    aria-hidden="true"
                  >
                    {phase.icon}
                  </span>
                  <div>
                    <h2 className="text-[1.4rem] font-bold text-brand-primary">
                      Phase {i + 1}: {phase.title}
                    </h2>
                    <p className="text-slate text-[0.9rem]">{phase.subtitle}</p>
                  </div>
                </div>
                <ul className="grid sm:grid-cols-2 gap-3 ml-1">
                  {phase.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[0.9rem] text-ink"
                    >
                      <span className="text-brand-care mt-0.5" aria-hidden="true">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.5rem] font-bold text-brand-primary mb-4">
            See what your program could look like
          </h2>
          <p className="text-slate mb-8 max-w-lg mx-auto">
            Use our AI Program Builder to get a free draft framework based on your
            school&apos;s profile — in minutes.
          </p>
          <Link
            href="/program-builder"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-accent text-white font-semibold rounded-xl text-[0.95rem] hover:bg-brand-accent/90 transition-colors"
          >
            Try the Program Builder
          </Link>
        </div>
      </section>
    </>
  );
}
