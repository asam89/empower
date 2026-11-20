import type { SchoolConfig, Student, Tier } from "../types";

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
