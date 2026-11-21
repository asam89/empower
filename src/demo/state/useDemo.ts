"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getSchool } from "../config/school";
import { STUDENTS } from "../fixtures/students";
import { applyEdits } from "../lib/edits";
import { allRequests } from "../lib/requests";
import type { FamilyRequest, Message, ProgressPoint, RequestStatus, Role } from "../types";
import { getServerSnapshot, getSnapshot, resetDemo, subscribe, updateDemoState } from "./store";

// Every change below lives in sessionStorage only (INVARIANTS.md #2).
export function useDemo() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const school = getSchool(state.schoolKey);
  const students = useMemo(() => applyEdits(STUDENTS, state.edits), [state.edits]);
  const requests = useMemo(() => allRequests(state.edits), [state.edits]);
  return {
    state,
    school,
    students,
    requests,
    setRole: (role: Role) => updateDemoState((s) => ({ ...s, role })),
    reset: resetDemo,
    addPoint: (goalId: string, point: ProgressPoint) =>
      updateDemoState((s) => ({
        ...s,
        edits: { ...s.edits, addedPoints: { ...s.edits.addedPoints, [goalId]: [...(s.edits.addedPoints[goalId] ?? []), point] } },
      })),
    addMessage: (studentId: string, message: Message) =>
      updateDemoState((s) => ({
        ...s,
        edits: {
          ...s.edits,
          addedMessages: { ...s.edits.addedMessages, [studentId]: [...(s.edits.addedMessages[studentId] ?? []), message] },
        },
      })),
    addRequest: (request: FamilyRequest) =>
      updateDemoState((s) => ({ ...s, edits: { ...s.edits, addedRequests: [...s.edits.addedRequests, request] } })),
    updateRequest: (id: string, patch: { status?: RequestStatus; staffNote?: string }) =>
      updateDemoState((s) => ({
        ...s,
        edits: { ...s.edits, requestPatches: { ...s.edits.requestPatches, [id]: { ...s.edits.requestPatches[id], ...patch } } },
      })),
  };
}

export type DemoApi = ReturnType<typeof useDemo>;
