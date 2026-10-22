import type { Goal, ProgressPoint, SchoolCalendar } from "../types";
import { schoolDaysBetween } from "./calendar";

/** Consecutive points below the aim line that trigger a team review. */
export const DECISION_RULE_POINTS = 4;

/** Value of the aim line (baseline at the start date to target at the review date) on a date. */
export function aimValue(goal: Goal, date: string, cal: SchoolCalendar): number {
  const total = schoolDaysBetween(goal.startDate, goal.reviewDate, cal);
  const elapsed = Math.max(0, schoolDaysBetween(goal.startDate, date, cal));
  const fraction = total > 0 ? Math.min(1, elapsed / total) : 1;
  return goal.baseline + (goal.target - goal.baseline) * fraction;
}

function belowAim(goal: Goal, point: ProgressPoint, cal: SchoolCalendar): boolean {
  const aim = aimValue(goal, point.date, cal);
  return goal.target >= goal.baseline ? point.value < aim : point.value > aim;
}

function pointsUpTo(goal: Goal, date: string): ProgressPoint[] {
  return goal.points.filter((p) => p.date <= date);
}

/** On track when the latest point up to `date` is at or above the aim line. */
export function isOnTrack(goal: Goal, date: string, cal: SchoolCalendar): boolean | null {
  const points = pointsUpTo(goal, date);
  if (points.length === 0) return null;
  return !belowAim(goal, points[points.length - 1], cal);
}

/** Decision rule: the last four points (up to `date`) are all below the aim line. */
export function needsTeamReview(goal: Goal, date: string, cal: SchoolCalendar): boolean {
  const points = pointsUpTo(goal, date);
  if (points.length < DECISION_RULE_POINTS) return false;
  return points.slice(-DECISION_RULE_POINTS).every((p) => belowAim(goal, p, cal));
}
