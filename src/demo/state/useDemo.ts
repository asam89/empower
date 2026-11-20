"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getSchool } from "../config/school";
import { STUDENTS } from "../fixtures/students";
import { applyEdits } from "../lib/edits";
import type { Role } from "../types";
import { getServerSnapshot, getSnapshot, resetDemo, subscribe, updateDemoState } from "./store";

export function useDemo() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const school = getSchool(state.schoolKey);
  const students = useMemo(() => applyEdits(STUDENTS, state.edits), [state.edits]);
  return {
    state,
    school,
    students,
    setRole: (role: Role) => updateDemoState((s) => ({ ...s, role })),
    reset: resetDemo,
  };
}
