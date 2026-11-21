import type { FamilyRequest, Goal, Message, ProgressPoint, RequestStatus, Student } from "../types";

// In-session edits made during a demo. They live in sessionStorage only and
// "Reset demo" clears them.
export interface DemoEdits {
  studentPatches: Record<string, Partial<Pick<Student, "stage" | "tier">>>;
  goalPatches: Record<string, Partial<Pick<Goal, "target" | "description">>>;
  addedPoints: Record<string, ProgressPoint[]>;
  /** Messages typed in the parent hub or by staff, keyed by student id. */
  addedMessages: Record<string, Message[]>;
  /** Requests a parent submitted this session. */
  addedRequests: FamilyRequest[];
  /** Status changes and notes staff made to any request, keyed by request id. */
  requestPatches: Record<string, { status?: RequestStatus; staffNote?: string }>;
}

export function emptyEdits(): DemoEdits {
  return { studentPatches: {}, goalPatches: {}, addedPoints: {}, addedMessages: {}, addedRequests: [], requestPatches: {} };
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
    const added = edits.addedMessages[s.id];
    return { ...s, ...patch, goals, messages: added ? [...s.messages, ...added] : s.messages };
  });
}
