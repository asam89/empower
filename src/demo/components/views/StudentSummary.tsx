import { Avatar } from "../Avatar";
import { CHARACTER_STRENGTHS } from "../../content/character";
import { homeroomLabel } from "../../lib/school";
import type { ProgressPoint, SchoolConfig, Student } from "../../types";
import { GoalCard } from "../GoalCard";

export function StudentSummary({
  school,
  student,
  onAddPoint,
}: {
  school: SchoolConfig;
  student: Student;
  onAddPoint: (goalId: string, point: ProgressPoint) => void;
}) {
  return (
    <section aria-labelledby="student-heading" className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <Avatar name={student.name} color={school.accentColor} size={56} />
        <div>
          <h2 id="student-heading" className="text-[1.4rem] font-bold text-ink">{student.name}</h2>
          <p className="text-slate text-[0.9rem]">
            {homeroomLabel(student, school)} · Tier {student.tier}
            {student.tierChange ? ` (moving to Tier ${student.tierChange})` : ""}
          </p>
        </div>
      </div>
      <h3 className="font-semibold mb-2">Character and leadership strengths</h3>
      <ul className="list-disc pl-6 mb-4 text-[0.9rem]">
        {student.characterStrengths.map((c) => (
          <li key={c}>
            <span className="capitalize font-medium">{c}</span>: {CHARACTER_STRENGTHS[c]}
          </li>
        ))}
      </ul>
      {student.goals.length > 0 && (
        <>
          <h3 className="font-semibold mb-1">Progress monitoring</h3>
          <p className="text-[0.82rem] text-slate mb-3">
            Weekly results against the aim line from baseline to goal. Try adding this week&apos;s result to see the
            status update.
          </p>
          <div className="grid lg:grid-cols-2 gap-4">
            {student.goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                interventions={student.interventions.filter((iv) => iv.goalId === g.id)}
                onAddPoint={(p) => onAddPoint(g.id, p)}
              />
            ))}
          </div>
        </>
      )}
      <p className="text-[0.85rem] text-slate mt-4">The full IEP and the other profile tabs are built in Workstream 3.</p>
    </section>
  );
}
