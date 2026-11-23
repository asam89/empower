import type { Goal, SchoolCalendar } from "../types";
import { isOnTrack, needsTeamReview } from "./progress";

export type GoalStatusKind = "review" | "below" | "on_track" | "no_data";

export interface GoalStatus {
  kind: GoalStatusKind;
  /** Date the status is judged at: the demo date, or the newest point if later (points added in the demo). */
  asOf: string;
  latest: number | null;
  /** Share of the way from baseline to target, 0 to 100. */
  percent: number;
}

export const STATUS_LABELS: Record<GoalStatusKind, { staff: string; family: string }> = {
  review: { staff: "Needs team review", family: "Adjusting support" },
  below: { staff: "Below the aim line", family: "Working on it" },
  on_track: { staff: "On track", family: "On track" },
  no_data: { staff: "No data yet", family: "Just getting started" },
};

export function goalStatus(goal: Goal, today: string, cal: SchoolCalendar): GoalStatus {
  const last = goal.points[goal.points.length - 1];
  const asOf = last && last.date > today ? last.date : today;
  const latest = last ? last.value : null;
  const span = goal.target - goal.baseline;
  const percent = latest === null || span === 0 ? 0 : Math.round(Math.min(1, Math.max(0, (latest - goal.baseline) / span)) * 100);
  if (latest === null) return { kind: "no_data", asOf, latest, percent };
  if (needsTeamReview(goal, asOf, cal)) return { kind: "review", asOf, latest, percent };
  return { kind: isOnTrack(goal, asOf, cal) ? "on_track" : "below", asOf, latest, percent };
}

/** Date for the next weekly data point: a week after the newest point. */
export function nextPointDate(goal: Goal, today: string): string {
  const last = goal.points[goal.points.length - 1]?.date ?? today;
  const d = new Date(`${last}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}
