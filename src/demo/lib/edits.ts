import type { Goal, ProgressPoint, Student } from "../types";

// In-session edits made during a demo. They live in sessionStorage only and
// "Reset demo" clears them.
export interface DemoEdits {
  studentPatches: Record<string, Partial<Pick<Student, "stage" | "tier">>>;
  goalPatches: Record<string, Partial<Pick<Goal, "target" | "description">>>;
  addedPoints: Record<string, ProgressPoint[]>;
}

export function emptyEdits(): DemoEdits {
  return { studentPatches: {}, goalPatches: {}, addedPoints: {} };
}

export function applyEdits(students: Student[], edits: DemoEdits): Student[] {
  return students.map((s) => {
    const patch = edits.studentPatches[s.id];
    const goals = s.goals.map((g) => {
      const gp = edits.goalPatches[g.id];
      const added = edits.addedPoints[g.id];
      if (!gp && !added) return g;
      return { ...g, ...gp, points: added ? [...g.points, ...added] : g.points };
    });
    return { ...s, ...patch, goals };
  });
}
