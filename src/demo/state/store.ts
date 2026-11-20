import { DEFAULT_SCHOOL_KEY, isSchoolKey } from "../config/school";
import { emptyEdits, type DemoEdits } from "../lib/edits";
import { isRole } from "../lib/views";
import type { Role } from "../types";

// Session-only demo state, shared through useSyncExternalStore. Nothing here
// leaves the browser.

export interface DemoState {
  role: Role;
  schoolKey: string;
  edits: DemoEdits;
}

const STORAGE_KEY = "empower-demo-v1";

export const SEED_STATE: DemoState = { role: "principal", schoolKey: DEFAULT_SCHOOL_KEY, edits: emptyEdits() };

let state: DemoState | null = null;
const listeners = new Set<() => void>();

function load(): DemoState {
  let loaded: DemoState = SEED_STATE;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoState>;
      loaded = {
        role: isRole(parsed.role) ? parsed.role : SEED_STATE.role,
        schoolKey: isSchoolKey(parsed.schoolKey) ? parsed.schoolKey : SEED_STATE.schoolKey,
        edits: { ...emptyEdits(), ...parsed.edits },
      };
    }
  } catch {
    loaded = SEED_STATE;
  }
  const requested = new URLSearchParams(window.location.search).get("school");
  if (isSchoolKey(requested) && requested !== loaded.schoolKey) {
    loaded = { ...loaded, schoolKey: requested };
    save(loaded);
  }
  return loaded;
}

function save(next: DemoState) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private mode); the demo still works in memory.
  }
}

export function getSnapshot(): DemoState {
  if (!state) state = load();
  return state;
}

export function getServerSnapshot(): DemoState {
  return SEED_STATE;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateDemoState(updater: (current: DemoState) => DemoState) {
  state = updater(getSnapshot());
  save(state);
  listeners.forEach((l) => l());
}

/** Restore the seed data and role; keeps the school chosen for this session. */
export function resetDemo() {
  updateDemoState((current) => ({ ...SEED_STATE, schoolKey: current.schoolKey, edits: emptyEdits() }));
}
