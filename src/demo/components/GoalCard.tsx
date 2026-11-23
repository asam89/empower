"use client";

import { useState } from "react";
import { DEMO_TODAY } from "../config/school";
import { CALENDAR } from "../fixtures/calendar";
import { STAFF } from "../fixtures/staff";
import { formatDate } from "../lib/calendar";
import { goalStatus, nextPointDate, STATUS_LABELS, type GoalStatusKind } from "../lib/goal-status";
import { DECISION_RULE_POINTS } from "../lib/progress";
import type { Goal, Intervention, ProgressPoint } from "../types";
import { ProgressChart } from "./ProgressChart";

const TONE: Record<GoalStatusKind, string> = {
  review: "bg-[#FEF3F2] text-[#912018] border-[#FDA29B]",
  below: "bg-[#FFF7E6] text-[#8A4B00] border-[#FCD38A]",
  on_track: "bg-[#E6F6F4] text-[#0B7A72] border-[#B3E3DF]",
  no_data: "bg-cloud text-slate border-border",
};

export function StatusBadge({ kind, audience = "staff" }: { kind: GoalStatusKind; audience?: "staff" | "family" }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[0.75rem] font-semibold ${TONE[kind]}`}>
      {STATUS_LABELS[kind][audience]}
    </span>
  );
}

export function GoalCard({
  goal,
  interventions,
  onAddPoint,
}: {
  goal: Goal;
  interventions: Intervention[];
  onAddPoint: (point: ProgressPoint) => void;
}) {
  const status = goalStatus(goal, DEMO_TODAY, CALENDAR);
  const nextDate = nextPointDate(goal, DEMO_TODAY);
  const [value, setValue] = useState("");
  const staffName = (id: string) => STAFF.find((m) => m.id === id)?.name ?? "Staff";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(value);
    if (!Number.isFinite(n) || value.trim() === "") return;
    onAddPoint({ date: nextDate, value: n });
    setValue("");
  }

  return (
    <article className="bg-surface border border-border rounded-xl p-5" aria-labelledby={`goal-${goal.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-slate">{goal.subject}</p>
          <h4 id={`goal-${goal.id}`} className="font-semibold text-ink leading-snug">{goal.description}</h4>
        </div>
        <StatusBadge kind={status.kind} />
      </div>

      <dl className="grid grid-cols-3 gap-2 mt-3 text-center">
        {[
          ["Baseline", goal.baseline],
          ["Latest", status.latest ?? "—"],
          ["Goal", goal.target],
        ].map(([label, v]) => (
          <div key={label as string} className="bg-cloud rounded-lg py-2">
            <dt className="text-[0.7rem] text-slate">{label}</dt>
            <dd className="font-bold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <ProgressChart goal={goal} cal={CALENDAR} asOf={status.asOf} />

      {status.kind === "review" && (
        <p role="note" className="mt-3 text-[0.82rem] rounded-lg px-3 py-2 bg-[#FEF3F2] text-[#912018] border border-[#FDA29B]">
          The last {DECISION_RULE_POINTS} results are below the aim line. Decision rule: the team meets to change the
          support plan.
        </p>
      )}

      {interventions.length > 0 && (
        <div className="mt-3 text-[0.82rem]">
          <p className="font-semibold text-ink">Current support</p>
          <ul className="text-slate">
            {interventions.map((iv) => (
              <li key={iv.id}>
                {iv.what}: {iv.frequency}, {iv.minutes} min, with {staffName(iv.staffId)} (since {formatDate(iv.startDate)})
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <label className="text-[0.8rem] text-slate">
          <span className="block font-semibold text-ink">Add result for week of {formatDate(nextDate)}</span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 w-32 px-3 py-1.5 border border-border rounded-lg bg-cloud text-ink"
            aria-label={`Result in ${goal.unit}`}
          />
        </label>
        <button type="submit" className="px-4 py-1.5 rounded-lg bg-brand-primary text-white text-[0.85rem] font-semibold">
          Add point
        </button>
        <span className="text-[0.72rem] text-slate">Demo only: saved in this browser session.</span>
      </form>
    </article>
  );
}
