"use client";

import { useState } from "react";
import { formatDate } from "../../lib/calendar";
import { REQUEST_KIND_LABELS } from "../../lib/requests";
import type { FamilyRequest, RequestStatus, Student } from "../../types";
import { RequestStatusPill } from "./ParentHub";

interface Props {
  requests: FamilyRequest[];
  students: Student[];
  onOpenStudent: (id: string) => void;
  onUpdate: (id: string, patch: { status?: RequestStatus; staffNote?: string }) => void;
}

export function FamilyRequests({ requests, students, onOpenStudent, onUpdate }: Props) {
  const [showAll, setShowAll] = useState(false);
  const open = requests.filter((r) => r.status !== "resolved");
  const list = showAll ? requests : open;
  const counts = {
    new: requests.filter((r) => r.status === "new").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <section aria-labelledby="requests-heading">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 id="requests-heading" className="text-[1.4rem] font-bold text-ink">Family requests</h2>
            <p className="text-slate text-[0.88rem]">Questions, concerns and meeting requests sent from the parent hub.</p>
          </div>
          <div role="group" aria-label="Show" className="inline-flex rounded-lg border border-border bg-surface p-1">
            {[
              { all: false, label: `Open (${open.length})` },
              { all: true, label: `All (${requests.length})` },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                aria-pressed={showAll === o.all}
                onClick={() => setShowAll(o.all)}
                className={`px-3 py-1 rounded-md text-[0.82rem] font-semibold ${showAll === o.all ? "bg-brand-primary text-white" : "text-slate"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="grid grid-cols-3 gap-3 mb-5">
          {[
            ["New", counts.new],
            ["In progress", counts.in_progress],
            ["Resolved", counts.resolved],
          ].map(([label, n]) => (
            <li key={label as string} className="bg-surface border border-border rounded-xl p-4">
              <span className="block text-[1.5rem] font-bold text-ink leading-tight">{n}</span>
              <span className="text-[0.82rem] text-slate">{label}</span>
            </li>
          ))}
        </ul>

        {list.length === 0 ? (
          <p className="bg-surface border border-border rounded-xl p-6 text-center text-slate">No open requests. 🎉</p>
        ) : (
          <ul className="space-y-4">
            {list.map((r) => (
              <RequestItem key={r.id} request={r} student={students.find((s) => s.id === r.studentId)} onOpenStudent={onOpenStudent} onUpdate={onUpdate} />
            ))}
          </ul>
        )}
      </section>

      <p className="text-[0.82rem] text-slate bg-surface border border-border rounded-xl p-4">
        Coming next: text and email alerts to families when a request is answered or a goal is met (needs an SMS and
        email provider). In this demo, requests and replies stay in this browser session.
      </p>
    </div>
  );
}

function RequestItem({
  request: r,
  student,
  onOpenStudent,
  onUpdate,
}: {
  request: FamilyRequest;
  student: Student | undefined;
  onOpenStudent: (id: string) => void;
  onUpdate: Props["onUpdate"];
}) {
  const parent = student?.parents[r.parentIndex];
  const [note, setNote] = useState("");

  function reply(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    onUpdate(r.id, { staffNote: note.trim().slice(0, 1000), status: r.status === "new" ? "in_progress" : r.status });
    setNote("");
  }

  return (
    <li className={`bg-surface border rounded-xl p-5 ${r.status === "new" ? "border-[#FFD3B3]" : "border-border"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <RequestStatusPill status={r.status} />
        <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-slate">{REQUEST_KIND_LABELS[r.kind]}</span>
        <span className="text-[0.75rem] text-slate">· {formatDate(r.date)}</span>
      </div>
      <h3 className="font-semibold text-ink mt-1">{r.subject}</h3>
      <p className="text-[0.88rem] text-ink mt-1">{r.details}</p>
      <p className="text-[0.8rem] text-slate mt-2">
        From {parent?.name ?? "a parent"} ({parent?.relationship ?? "family"}) about{" "}
        {student ? (
          <button type="button" onClick={() => onOpenStudent(student.id)} className="font-semibold text-brand-primary underline">
            {student.name}
          </button>
        ) : (
          "a student"
        )}
      </p>
      {r.staffNote && <p className="mt-2 pl-3 border-l-2 border-brand-care text-[0.85rem] text-slate">Reply: {r.staffNote}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <form onSubmit={reply} className="flex flex-1 min-w-[260px] gap-2">
          <label htmlFor={`note-${r.id}`} className="sr-only">Reply to family</label>
          <input
            id={`note-${r.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            placeholder="Reply to the family…"
            className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-cloud text-[0.85rem]"
          />
          <button type="submit" className="px-3 py-1.5 rounded-lg border border-border text-[0.82rem] font-semibold hover:border-brand-primary">Reply</button>
        </form>
        {r.status !== "in_progress" && r.status !== "resolved" && (
          <button type="button" onClick={() => onUpdate(r.id, { status: "in_progress" })} className="px-3 py-1.5 rounded-lg border border-border text-[0.82rem] font-semibold hover:border-brand-primary">
            Mark in progress
          </button>
        )}
        {r.status !== "resolved" ? (
          <button type="button" onClick={() => onUpdate(r.id, { status: "resolved" })} className="px-3 py-1.5 rounded-lg bg-brand-care text-white text-[0.82rem] font-semibold">
            Resolve
          </button>
        ) : (
          <button type="button" onClick={() => onUpdate(r.id, { status: "in_progress" })} className="px-3 py-1.5 rounded-lg border border-border text-[0.82rem] font-semibold">
            Reopen
          </button>
        )}
      </div>
    </li>
  );
}
