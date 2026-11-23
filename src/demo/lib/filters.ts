import type { SchoolCalendar, Student } from "../types";
import { iepClock } from "./iep-rules";
import { hasFlatProgress, hasUpcomingReview } from "./metrics";

export interface FilterContext {
  today: string;
  cal: SchoolCalendar;
}

export const ROSTER_FILTERS = {
  "in-program": { label: "In the program", test: (s: Student) => s.inCohort },
  "tier-3": { label: "Tier 3 (intensive)", test: (s: Student) => s.tier === 3 },
  "tier-2": { label: "Tier 2 (targeted)", test: (s: Student) => s.tier === 2 },
  "tier-1": { label: "Tier 1 (classroom strategies)", test: (s: Student) => s.tier === 1 },
  waitlist: { label: "Waitlist", test: (s: Student) => s.waitlisted },
  "iep-in-development": {
    label: "IEP in development",
    test: (s: Student, ctx: FilterContext) => !!s.iep && iepClock(s.iep, ctx.today, ctx.cal).status !== "complete",
  },
  "review-due": { label: "IEP review due in 30 days", test: (s: Student, ctx: FilterContext) => hasUpcomingReview(s, ctx.today) },
  "flat-progress": { label: "Progress below the aim line", test: (s: Student, ctx: FilterContext) => hasFlatProgress(s, ctx.today, ctx.cal) },
  referral: { label: "Referral in progress", test: (s: Student) => s.referrals.some((r) => r.status !== "complete") },
} satisfies Record<string, { label: string; test: (s: Student, ctx: FilterContext) => boolean }>;

export type RosterFilter = keyof typeof ROSTER_FILTERS;

export function isRosterFilter(value: string | null): value is RosterFilter {
  return !!value && Object.prototype.hasOwnProperty.call(ROSTER_FILTERS, value);
}

export function applyFilter(students: Student[], filter: RosterFilter | null, ctx: FilterContext): Student[] {
  return filter ? students.filter((s) => ROSTER_FILTERS[filter].test(s, ctx)) : students;
}
