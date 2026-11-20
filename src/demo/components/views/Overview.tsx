import { seats, tierCounts, cohort } from "../../lib/metrics";
import type { SchoolConfig, Student } from "../../types";

export function Overview({ school, students }: { school: SchoolConfig; students: Student[] }) {
  const s = seats(students, school);
  const tiers = tierCounts(cohort(students));
  const tiles = [
    { label: "Program seats filled", value: `${s.filled} of ${s.capacity}` },
    { label: "Waitlist", value: String(s.waitlist) },
    { label: "Tier 3 (intensive)", value: String(tiers[3]) },
    { label: "Tier 2 (targeted)", value: String(tiers[2]) },
    { label: "Tier 1, monitored outside the program", value: String(students.filter((x) => !x.inCohort).length) },
  ];
  return (
    <section aria-labelledby="overview-heading">
      <h2 id="overview-heading" className="text-[1.4rem] font-bold text-brand-primary mb-4">
        Program at a glance
      </h2>
      <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {tiles.map((t) => (
          <li key={t.label} className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[1.6rem] font-bold text-ink">{t.value}</p>
            <p className="text-[0.85rem] text-slate">{t.label}</p>
          </li>
        ))}
      </ul>
      <p className="text-[0.85rem] text-slate mt-4">The full principal dashboard is built in Workstream 2.</p>
    </section>
  );
}
