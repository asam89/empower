import type { Band, ProgramMetrics, SchoolCalendar, SchoolConfig, StaffMember, Student, Tier } from "../types";
import { bandForGrade, daysBetween, reportingPeriodFor } from "./calendar";
import { iepClock } from "./iep-rules";
import { isOnTrack, needsTeamReview } from "./progress";

// Every dashboard figure is computed from the fixtures here; nothing is hardcoded.

export const REFERRAL_WAIT_THRESHOLD_DAYS = 30;
export const REVIEW_WINDOW_DAYS = 30;

export function cohort(students: Student[]): Student[] {
  return students.filter((s) => s.inCohort);
}

export function seats(students: Student[], school: SchoolConfig) {
  const filled = cohort(students).length;
  return {
    capacity: school.programCapacity,
    filled,
    available: Math.max(0, school.programCapacity - filled),
    waitlist: students.filter((s) => s.waitlisted).length,
  };
}

export function tierCounts(students: Student[]): Record<Tier, number> {
  const counts: Record<Tier, number> = { 1: 0, 2: 0, 3: 0 };
  for (const s of students) counts[s.tier]++;
  return counts;
}

export function goalsOnTrack(students: Student[], date: string, cal: SchoolCalendar) {
  const results = cohort(students)
    .flatMap((s) => s.goals)
    .map((g) => isOnTrack(g, date, cal))
    .filter((r): r is boolean => r !== null);
  const onTrack = results.filter(Boolean).length;
  return { onTrack, total: results.length, percent: results.length ? Math.round((100 * onTrack) / results.length) : 0 };
}

export function hasUpcomingReview(student: Student, today: string): boolean {
  return student.meetings.some(
    (m) =>
      m.status === "upcoming" &&
      m.withParent &&
      /review/i.test(m.title) &&
      m.date >= today &&
      daysBetween(today, m.date) <= REVIEW_WINDOW_DAYS
  );
}

export function referralsInProgress(students: Student[]) {
  return students.flatMap((s) => s.referrals.filter((r) => r.status !== "complete").map((r) => ({ student: s, referral: r })));
}

export function hasFlatProgress(student: Student, today: string, cal: SchoolCalendar): boolean {
  return student.goals.some((g) => needsTeamReview(g, today, cal));
}

export function parentMeetingsHeld(students: Student[], today: string, cal: SchoolCalendar): number {
  const term = reportingPeriodFor(today, "elementary", cal);
  return students
    .flatMap((s) => s.meetings)
    .filter((m) => m.withParent && m.status === "held" && (!term || (m.date >= term.start && m.date <= today))).length;
}

export type AttentionKind = "iep_overdue" | "iep_due_soon" | "progress_flat" | "referral_waiting";

export interface AttentionItem {
  kind: AttentionKind;
  studentId: string;
  studentName: string;
  text: string;
}

const ATTENTION_ORDER: AttentionKind[] = ["iep_overdue", "iep_due_soon", "progress_flat", "referral_waiting"];

export function needsAttention(students: Student[], today: string, cal: SchoolCalendar): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const s of students) {
    if (s.iep) {
      const clock = iepClock(s.iep, today, cal);
      if (clock.status === "overdue") {
        items.push({ kind: "iep_overdue", studentId: s.id, studentName: s.name, text: `IEP past the 30 school day deadline by ${-clock.remaining} school days` });
      } else if (clock.status === "due_soon") {
        items.push({ kind: "iep_due_soon", studentId: s.id, studentName: s.name, text: `IEP due in ${clock.remaining} school days (${clock.dueDate})` });
      }
    }
    for (const g of s.goals) {
      if (needsTeamReview(g, today, cal)) {
        items.push({ kind: "progress_flat", studentId: s.id, studentName: s.name, text: `${g.measure}: 4 data points below the aim line, team review` });
      }
    }
    for (const r of s.referrals) {
      const waited = daysBetween(r.requestedDate, today);
      if (r.status === "waiting" && waited > REFERRAL_WAIT_THRESHOLD_DAYS) {
        items.push({ kind: "referral_waiting", studentId: s.id, studentName: s.name, text: `${r.to} referral waiting ${waited} days` });
      }
    }
  }
  return items.sort((a, b) => ATTENTION_ORDER.indexOf(a.kind) - ATTENTION_ORDER.indexOf(b.kind));
}

export function screeningCompletion(program: ProgramMetrics) {
  const enrolled = program.screening.reduce((n, g) => n + g.enrolled, 0);
  const fall = program.screening.reduce((n, g) => n + g.fallScreened, 0);
  const winter = program.screening.reduce((n, g) => n + g.winterScreened, 0);
  return { enrolled, fallPercent: Math.round((100 * fall) / enrolled), winterPercent: Math.round((100 * winter) / enrolled) };
}

export function specialistHours(program: ProgramMetrics, staff: StaffMember[]) {
  return staff
    .filter((m) => m.scheduledHoursPerTerm)
    .map((m) => ({ staffId: m.id, name: m.name, role: m.role, used: program.specialistHoursUsed[m.id] ?? 0, scheduled: m.scheduledHoursPerTerm as number }));
}

/** Month-end (or demo date) checkpoints for the on-track trend. */
export function onTrackTrend(students: Student[], checkpoints: { label: string; date: string }[], cal: SchoolCalendar) {
  return checkpoints.map((c) => ({ label: c.label, value: goalsOnTrack(students, c.date, cal).percent }));
}

export function bandSplit(students: Student[], today: string, cal: SchoolCalendar) {
  const bands: Band[] = ["elementary", "secondary"];
  return bands.map((band) => {
    const group = cohort(students).filter((s) => bandForGrade(s.grade) === band);
    return { band, students: group.length, goalsOnTrack: goalsOnTrack(group, today, cal) };
  });
}
