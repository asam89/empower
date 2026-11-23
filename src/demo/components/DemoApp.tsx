"use client";

import { useSearchParams } from "next/navigation";
import { useDemo } from "../state/useDemo";
import { VIEW_LABELS, VIEWS_BY_ROLE, resolveView, visibleStudents, type View } from "../lib/views";
import type { Role } from "../types";
import { Dashboard } from "./views/Dashboard";
import { DEMO_TODAY } from "../config/school";
import { CALENDAR } from "../fixtures/calendar";
import { ROSTER_FILTERS, applyFilter, isRosterFilter } from "../lib/filters";
import { Roster } from "./views/Roster";
import { StudentSummary } from "./views/StudentSummary";
import { ParentHub } from "./views/ParentHub";
import { FamilyRequests } from "./views/FamilyRequests";
import { openRequestCount } from "../lib/requests";
import { PERSONAS } from "../lib/personas";
import { RoleChooser } from "./RoleChooser";
import { Avatar } from "./Avatar";
import { Placeholder } from "./views/Placeholder";

// Client-side views switched with history.pushState, so navigating never needs
// the network once the page has loaded.
function navigate(view: View, opts: { id?: string; filter?: string } = {}) {
  const query = new URLSearchParams({ view });
  if (opts.id) query.set("id", opts.id);
  if (opts.filter) query.set("filter", opts.filter);
  window.history.pushState(null, "", `/demo?${query.toString()}`);
}

export function DemoApp() {
  const params = useSearchParams();
  const { state, school, students, requests, setRole, signOut, reset, addPoint, addMessage, addRequest, updateRequest } = useDemo();
  const persona = PERSONAS[state.role];
  const openRequests = openRequestCount(requests);
  const visible = visibleStudents(state.role, students);
  const { view, studentId } = resolveView(state.role, params.get("view"), params.get("id"), visible);
  const student = studentId ? visible.find((s) => s.id === studentId) : undefined;
  const rawFilter = params.get("filter");
  const filter = view === "roster" && isRosterFilter(rawFilter) ? rawFilter : null;

  function switchRole(role: Role) {
    setRole(role);
    navigate(VIEWS_BY_ROLE[role][0]);
  }

  function handleReset() {
    if (!window.confirm("Reset the demo? All changes made in this session will be cleared.")) return;
    reset();
    window.history.pushState(null, "", "/demo");
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-12 h-12 shrink-0 rounded-full text-white font-bold text-[0.85rem]"
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
          {state.roleChosen && (
            <div data-testid="signed-in-as" className="flex items-center gap-3 bg-surface border border-border rounded-xl pl-2 pr-1 py-1">
              <Avatar name={persona.name} color={persona.group === "family" ? "#FF8A3D" : school.accentColor} size={34} />
              <div className="leading-tight">
                <p className="text-[0.72rem] text-slate">Signed in as</p>
                <p className="text-[0.88rem] font-semibold text-ink">
                  {persona.name} · {persona.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  window.history.pushState(null, "", "/demo");
                }}
                className="ml-2 px-3 py-1.5 rounded-lg bg-cloud border border-border text-[0.82rem] font-semibold text-brand-primary hover:border-brand-primary"
              >
                Switch role
              </button>
            </div>
          )}
          {state.roleChosen && (
            <button type="button" onClick={handleReset} className="px-3 py-1.5 rounded-lg border border-border bg-surface text-[0.85rem] font-semibold text-slate hover:text-ink">
              Reset demo
            </button>
          )}
        </div>
      </div>

      {!state.roleChosen ? (
        <RoleChooser school={school} onChoose={switchRole} />
      ) : (
      <>
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
                {v === "notify" && openRequests > 0 && (
                  <span aria-label={`${openRequests} open`} className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-brand-accent text-white text-[0.72rem] font-bold">
                    {openRequests}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {view === "dashboard" && (
        <Dashboard
          school={school}
          students={students}
          onFilter={(f) => navigate("roster", { filter: f })}
          onOpenStudent={(id) => navigate("student", { id })}
        />
      )}
      {view === "roster" && (
        <Roster
          school={school}
          students={applyFilter(visible, filter, { today: DEMO_TODAY, cal: CALENDAR })}
          filterLabel={filter ? ROSTER_FILTERS[filter].label : null}
          onClearFilter={() => navigate("roster")}
          onOpen={(id) => navigate("student", { id })}
        />
      )}
      {view === "student" && student && <StudentSummary school={school} student={student} onAddPoint={addPoint} />}
      {view === "parent" && student && (
        <ParentHub
          school={school}
          student={student}
          requests={requests}
          onMessage={(m) => addMessage(student.id, m)}
          onRequest={addRequest}
        />
      )}
      {view === "pipeline" && <Placeholder title={VIEW_LABELS.pipeline} workstream={4} />}
      {view === "notify" && (
        <FamilyRequests requests={requests} students={students} onOpenStudent={(id) => navigate("student", { id })} onUpdate={updateRequest} />
      )}
      {view === "value" && <Placeholder title={VIEW_LABELS.value} workstream={6} />}
      </>
      )}
    </div>
  );
}
