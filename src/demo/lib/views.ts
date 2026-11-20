import { PARENT_CHILD_ID } from "../config/school";
import type { Role, Student } from "../types";

export type View = "dashboard" | "roster" | "student" | "pipeline" | "notify" | "value" | "parent";

export const VIEW_LABELS: Record<View, string> = {
  dashboard: "Program at a glance",
  roster: "Students",
  student: "Student",
  pipeline: "Identification pipeline",
  notify: "Notifications",
  value: "Value",
  parent: "My child",
};

/** Navigation for each role. The student view is opened from the roster. */
export const VIEWS_BY_ROLE: Record<Role, View[]> = {
  principal: ["dashboard", "roster", "pipeline", "notify", "value"],
  sert: ["dashboard", "roster", "pipeline", "notify"],
  teacher: ["dashboard", "roster"],
  parent: ["parent"],
};

export const ROLE_LABELS: Record<Role, string> = {
  principal: "Principal",
  sert: "SERT",
  teacher: "Teacher",
  parent: "Parent",
};

export function isRole(value: unknown): value is Role {
  return value === "principal" || value === "sert" || value === "teacher" || value === "parent";
}

/**
 * Resolve the requested view for a role. The Parent role always resolves to
 * their own child, whatever the URL asks for.
 */
export function resolveView(
  role: Role,
  view: string | null,
  studentId: string | null,
  students: Student[]
): { view: View; studentId: string | null } {
  if (role === "parent") return { view: "parent", studentId: PARENT_CHILD_ID };
  if (view === "student") {
    return studentId && students.some((s) => s.id === studentId)
      ? { view: "student", studentId }
      : { view: "roster", studentId: null };
  }
  const allowed = VIEWS_BY_ROLE[role];
  if (view && (allowed as string[]).includes(view)) return { view: view as View, studentId: null };
  return { view: allowed[0], studentId: null };
}

/** Students a role may see. Parents see only their own child. */
export function visibleStudents(role: Role, students: Student[]): Student[] {
  return role === "parent" ? students.filter((s) => s.id === PARENT_CHILD_ID) : students;
}
