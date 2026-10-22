"use client";

import { useSearchParams } from "next/navigation";
import { useDemo } from "../state/useDemo";
import { ROLE_LABELS, VIEW_LABELS, VIEWS_BY_ROLE, resolveView, visibleStudents, type View } from "../lib/views";
import type { Role } from "../types";
import { Overview } from "./views/Overview";
import { Roster } from "./views/Roster";
import { StudentSummary } from "./views/StudentSummary";
import { ParentPreview } from "./views/ParentPreview";
import { Placeholder } from "./views/Placeholder";

const ROLES: Role[] = ["principal", "sert", "teacher", "parent"];

// Client-side views switched with history.pushState, so navigating never needs
// the network once the page has loaded.
function navigate(view: View, id?: string) {
  const query = new URLSearchParams({ view });
  if (id) query.set("id", id);
  window.history.pushState(null, "", `/demo?${query.toString()}`);
}

export function DemoApp() {
  const params = useSearchParams();
  const { state, school, students, setRole, reset } = useDemo();
  const visible = visibleStudents(state.role, students);
  const { view, studentId } = resolveView(state.role, params.get("view"), params.get("id"), visible);
  const student = studentId ? visible.find((s) => s.id === studentId) : undefined;

  function switchRole(role: Role) {
    setRole(role);
    navigate(VIEWS_BY_ROLE[role][0]);
  }

  function handleReset() {
    if (!window.confirm("Reset the demo? All changes made in this session will be cleared.")) return;
    reset();
    navigate("dashboard");
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-[0.85rem]"
            style={{ backgroundColor: school.accentColor }}
          >
            {school.crestInitials}
          </span>
          <div>
            <p className="font-bold text-[1.15rem] leading-tight" data-testid="school-name">{school.name}</p>
            <p className="text-slate text-[0.85rem]">
              {school.locationLabel} · {school.gradeRangeLabel} · Empower special education program
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="View the demo as" className="inline-flex rounded-lg border border-border bg-surface p-1">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                aria-pressed={state.role === role}
                onClick={() => switchRole(role)}
                className={`px-3 py-1.5 rounded-md text-[0.85rem] font-semibold ${state.role === role ? "bg-brand-primary text-white" : "text-slate hover:text-ink"}`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleReset} className="px-3 py-1.5 rounded-lg border border-border bg-surface text-[0.85rem] font-semibold text-slate hover:text-ink">
            Reset demo
          </button>
        </div>
      </div>

      <nav aria-label="Demo sections" className="mb-6">
        <ul className="flex flex-wrap gap-2">
          {VIEWS_BY_ROLE[state.role].map((v) => (
            <li key={v}>
              <button
                type="button"
                aria-current={view === v ? "page" : undefined}
                onClick={() => navigate(v)}
                className={`px-4 py-2 rounded-full text-[0.9rem] font-medium border ${view === v ? "bg-brand-primary text-white border-brand-primary" : "bg-surface border-border text-ink hover:border-brand-primary"}`}
              >
                {VIEW_LABELS[v]}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {view === "dashboard" && <Overview school={school} students={students} />}
      {view === "roster" && <Roster school={school} students={visible} onOpen={(id) => navigate("student", id)} />}
      {view === "student" && student && <StudentSummary school={school} student={student} />}
      {view === "parent" && student && <ParentPreview student={student} />}
      {view === "pipeline" && <Placeholder title={VIEW_LABELS.pipeline} workstream={4} />}
      {view === "notify" && <Placeholder title={VIEW_LABELS.notify} workstream={5} />}
      {view === "value" && <Placeholder title={VIEW_LABELS.value} workstream={6} />}
    </div>
  );
}
