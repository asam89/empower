import type { Band, Closure, Grade, ReportingPeriod, SchoolCalendar } from "../types";

// Date maths on ISO "YYYY-MM-DD" strings, in UTC so results never depend on the
// viewer's time zone.

const DAY_MS = 24 * 60 * 60 * 1000;

function toMs(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return fromMs(toMs(date) + days * DAY_MS);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toMs(to) - toMs(from)) / DAY_MS);
}

export function isWeekend(date: string): boolean {
  const day = new Date(toMs(date)).getUTCDay();
  return day === 0 || day === 6;
}

export function closureOn(date: string, cal: SchoolCalendar): Closure | undefined {
  return cal.closures.find((c) => date >= c.start && date <= (c.end ?? c.start));
}

export function isSchoolDay(date: string, cal: SchoolCalendar): boolean {
  if (date < cal.firstDay || date > cal.lastDay) return false;
  if (isWeekend(date)) return false;
  return !closureOn(date, cal);
}

/** The date of the nth school day after `start` (start itself is day 0). */
export function addSchoolDays(start: string, n: number, cal: SchoolCalendar): string {
  let date = start;
  let counted = 0;
  while (counted < n) {
    date = addDays(date, 1);
    if (date > cal.lastDay) {
      throw new Error(`${n} school days after ${start} falls outside the ${cal.schoolYear} calendar`);
    }
    if (isSchoolDay(date, cal)) counted++;
  }
  return date;
}

/** School days in (from, to]. Negative when `to` is before `from`. */
export function schoolDaysBetween(from: string, to: string, cal: SchoolCalendar): number {
  if (to < from) return -schoolDaysBetween(to, from, cal);
  let count = 0;
  for (let d = addDays(from, 1); d <= to; d = addDays(d, 1)) {
    if (isSchoolDay(d, cal)) count++;
  }
  return count;
}

export function bandForGrade(grade: Grade): Band {
  return grade >= 9 ? "secondary" : "elementary";
}

export function reportingPeriods(band: Band, cal: SchoolCalendar): ReportingPeriod[] {
  return cal.reportingPeriods.filter((p) => p.band === band);
}

export function reportingPeriodFor(date: string, band: Band, cal: SchoolCalendar): ReportingPeriod | undefined {
  return reportingPeriods(band, cal).find((p) => date >= p.start && date <= p.end);
}

export function isInRamadan(date: string, cal: SchoolCalendar): boolean {
  return date >= cal.ramadan.start && date <= cal.ramadan.end;
}

export function formatDate(date: string): string {
  return new Date(toMs(date)).toLocaleDateString("en-CA", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
