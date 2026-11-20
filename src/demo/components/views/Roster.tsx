import { Avatar } from "../Avatar";
import { homeroomLabel } from "../../lib/school";
import type { SchoolConfig, Student } from "../../types";

export function Roster({ school, students, onOpen }: { school: SchoolConfig; students: Student[]; onOpen: (id: string) => void }) {
  return (
    <section aria-labelledby="roster-heading">
      <h2 id="roster-heading" className="text-[1.4rem] font-bold text-brand-primary mb-4">
        Students
      </h2>
      <div className="overflow-x-auto bg-surface border border-border rounded-xl">
        <table className="w-full text-left text-[0.9rem]">
          <thead className="bg-cloud text-slate">
            <tr>
              <th scope="col" className="p-3">Student</th>
              <th scope="col" className="p-3">Class</th>
              <th scope="col" className="p-3">Tier</th>
              <th scope="col" className="p-3">Exceptionality</th>
              <th scope="col" className="p-3">Program</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3">
                  <button type="button" onClick={() => onOpen(s.id)} className="flex items-center gap-3 font-semibold text-brand-primary hover:underline">
                    <Avatar name={s.name} color={school.accentColor} size={32} />
                    {s.name}
                  </button>
                </td>
                <td className="p-3">{homeroomLabel(s, school)}</td>
                <td className="p-3">Tier {s.tier}</td>
                <td className="p-3">{s.exceptionality ? `${s.exceptionality.category}${s.exceptionality.definition ? ` (${s.exceptionality.definition})` : ""}` : "Not identified"}</td>
                <td className="p-3">{s.inCohort ? "In program" : s.waitlisted ? "Waitlist" : "Monitoring"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[0.85rem] text-slate mt-4">Search, filters and the full student profile are built in Workstream 3.</p>
    </section>
  );
}
