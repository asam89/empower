"use client";

import { useState } from "react";
import { DEMO_TODAY } from "../../config/school";
import { CALENDAR } from "../../fixtures/calendar";
import { STAFF } from "../../fixtures/staff";
import { CHARACTER_STRENGTHS } from "../../content/character";
import { formatDate } from "../../lib/calendar";
import { goalStatus } from "../../lib/goal-status";
import { REQUEST_KIND_LABELS, REQUEST_STATUS_LABELS } from "../../lib/requests";
import { homeroomLabel } from "../../lib/school";
import type { FamilyRequest, Message, RequestKind, SchoolConfig, Student } from "../../types";
import { StatusBadge } from "../GoalCard";
import { ProgressChart } from "../ProgressChart";

type Lang = "en" | "ar" | "ur";
const LANGS: { key: Lang; label: string; dir: "ltr" | "rtl" }[] = [
  { key: "en", label: "English", dir: "ltr" },
  { key: "ar", label: "العربية", dir: "rtl" },
  { key: "ur", label: "اردو", dir: "rtl" },
];

const card = "bg-surface border border-border rounded-xl p-5";
const input = "w-full px-3 py-2 border border-border rounded-lg bg-cloud text-ink text-[0.9rem]";

interface Props {
  school: SchoolConfig;
  student: Student;
  requests: FamilyRequest[];
  onMessage: (message: Message) => void;
  onRequest: (request: FamilyRequest) => void;
}

export function ParentHub({ school, student, requests, onMessage, onRequest }: Props) {
  const first = student.name.split(" ")[0];
  const parent = student.parents[0];
  const sert = STAFF.find((m) => m.id === student.sertId);
  const [lang, setLang] = useState<Lang>("en");
  const summary = student.parentSummary[lang] ?? student.parentSummary.en;
  const dir = LANGS.find((l) => l.key === lang)?.dir ?? "ltr";
  const upcoming = student.meetings.filter((m) => m.withParent && m.status === "upcoming");
  const mine = requests.filter((r) => r.studentId === student.id);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <section aria-labelledby="hub-heading" className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="hub-heading" className="text-[1.5rem] font-bold text-ink">{first}&apos;s program</h2>
            <p className="text-slate text-[0.88rem]">
              {homeroomLabel(student, school)} · SERT: {sert?.name ?? "—"} · Signed in as {parent?.name} ({parent?.relationship})
            </p>
          </div>
          <div role="group" aria-label="Summary language" className="inline-flex rounded-lg border border-border p-1">
            {LANGS.filter((l) => l.key === "en" || student.parentSummary[l.key]).map((l) => (
              <button
                key={l.key}
                type="button"
                aria-pressed={lang === l.key}
                onClick={() => setLang(l.key)}
                className={`px-3 py-1 rounded-md text-[0.82rem] font-semibold ${lang === l.key ? "bg-brand-primary text-white" : "text-slate"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <p lang={lang} dir={dir} className="mt-4 text-[1.02rem] leading-relaxed">{summary}</p>
        {lang !== "en" && (
          <p className="mt-2 text-[0.75rem] text-slate">Sample translation, to be reviewed by a fluent speaker.</p>
        )}
        {student.characterStrengths.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-4" aria-label="Character strengths">
            {student.characterStrengths.map((c) => (
              <li key={c} title={CHARACTER_STRENGTHS[c]} className="px-3 py-1 rounded-full bg-[#EFEAF8] text-brand-primary text-[0.8rem] font-semibold capitalize">
                ★ {c}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Growth path */}
      <section aria-labelledby="growth-heading">
        <h3 id="growth-heading" className="text-[1.2rem] font-bold text-ink mb-1">{first}&apos;s growth path</h3>
        <p className="text-slate text-[0.88rem] mb-3">How far {first} has come toward each goal this term.</p>
        <div className="grid lg:grid-cols-3 gap-4">
          {student.goals.map((g) => (
            <FamilyGoal key={g.id} goal={g} first={first} />
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Messages student={student} sertName={sert?.name ?? "SERT"} parentName={parent?.name ?? "Parent"} onMessage={onMessage} />
        <div className="space-y-6">
          <section aria-labelledby="meetings-heading" className={card}>
            <h3 id="meetings-heading" className="font-bold text-ink mb-3">Upcoming meetings</h3>
            {upcoming.length === 0 ? (
              <p className="text-slate text-[0.88rem]">No meetings scheduled.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((m) => (
                  <li key={m.id} className="flex gap-3 text-[0.9rem]">
                    <span className="font-semibold text-brand-primary shrink-0 w-28">{formatDate(m.date)}</span>
                    <span>
                      {m.title} at {m.time}
                      {m.notes && <span className="block text-[0.8rem] text-slate">{m.notes}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <RequestForm student={student} first={first} mine={mine} onRequest={onRequest} />
        </div>
      </div>
    </div>
  );
}

function FamilyGoal({ goal, first }: { goal: Student["goals"][number]; first: string }) {
  const status = goalStatus(goal, DEMO_TODAY, CALENDAR);
  const [open, setOpen] = useState(false);
  const text = goal.parentText.replace(/\{name\}/g, first);
  return (
    <article className={card}>
      <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-slate">{goal.subject}</p>
      <h4 className="font-semibold text-ink leading-snug mt-0.5">{text}</h4>
      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge kind={status.kind} audience="family" />
        <span className="text-[0.8rem] text-slate">{status.percent}% of the way</span>
      </div>
      <div
        className="mt-2 h-3 rounded-full bg-cloud border border-border overflow-hidden"
        role="progressbar"
        aria-valuenow={status.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${text}: ${status.percent}% of the way to the goal`}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-[#0E9C92] to-[#3CC2B7]" style={{ width: `${Math.max(4, status.percent)}%` }} />
      </div>
      <p className="mt-2 text-[0.8rem] text-slate">
        Started at {goal.baseline}, now {status.latest ?? "—"}, goal {goal.target} ({goal.unit})
      </p>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mt-2 text-[0.8rem] font-semibold text-brand-primary underline">
        {open ? "Hide weekly check-ins" : "See weekly check-ins"}
      </button>
      {open && <ProgressChart goal={goal} cal={CALENDAR} asOf={status.asOf} variant="family" />}
    </article>
  );
}

function Messages({ student, sertName, parentName, onMessage }: { student: Student; sertName: string; parentName: string; onMessage: (m: Message) => void }) {
  const [text, setText] = useState("");
  function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    onMessage({ id: `${student.id}-msg-${Date.now()}`, date: DEMO_TODAY, from: "parent", text: body.slice(0, 1000) });
    setText("");
  }
  return (
    <section aria-labelledby="messages-heading" className={card}>
      <h3 id="messages-heading" className="font-bold text-ink mb-3">Messages with {sertName}</h3>
      <ol className="space-y-3 mb-4" aria-live="polite">
        {student.messages.map((m) => {
          const fromParent = m.from === "parent";
          return (
            <li key={m.id} className={`flex ${fromParent ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-[0.9rem] ${fromParent ? "bg-brand-primary text-white rounded-br-sm" : "bg-cloud text-ink rounded-bl-sm"}`}>
                <p className={`text-[0.72rem] mb-0.5 ${fromParent ? "text-white/75" : "text-slate"}`}>
                  {fromParent ? parentName : sertName} · {formatDate(m.date)}
                </p>
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <form onSubmit={send} className="flex gap-2">
        <label htmlFor="hub-message" className="sr-only">Message</label>
        <input id="hub-message" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder={`Write to ${sertName}…`} className={input} />
        <button type="submit" className="px-4 rounded-lg bg-brand-primary text-white text-[0.85rem] font-semibold">Send</button>
      </form>
      <p className="text-[0.72rem] text-slate mt-2">Demo only: messages stay in this browser session.</p>
    </section>
  );
}

function RequestForm({ student, first, mine, onRequest }: { student: Student; first: string; mine: FamilyRequest[]; onRequest: (r: FamilyRequest) => void }) {
  const [kind, setKind] = useState<RequestKind>("question");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return;
    onRequest({
      id: `req-${Date.now()}`,
      studentId: student.id,
      parentIndex: 0,
      kind,
      subject: subject.trim().slice(0, 120),
      details: details.trim().slice(0, 2000),
      date: DEMO_TODAY,
      status: "new",
    });
    setSubject("");
    setDetails("");
    setSent(true);
  }

  return (
    <section aria-labelledby="request-heading" className={card}>
      <h3 id="request-heading" className="font-bold text-ink">Make a request or report a concern</h3>
      <p className="text-slate text-[0.82rem] mb-3">It goes to {first}&apos;s school team, who will reply here.</p>
      {sent && (
        <p role="status" className="mb-3 rounded-lg px-3 py-2 text-[0.85rem] bg-[#ECFDF3] border border-[#A6F4C5] text-[#05603A]">
          Sent to the school team. You can follow its status below.
        </p>
      )}
      <form onSubmit={submit} className="space-y-3">
        <div className="grid sm:grid-cols-[180px_1fr] gap-3">
          <label className="text-[0.82rem] font-semibold text-ink">
            Type
            <select value={kind} onChange={(e) => setKind(e.target.value as RequestKind)} className={`${input} mt-1 font-normal`}>
              {(Object.keys(REQUEST_KIND_LABELS) as RequestKind[]).map((k) => (
                <option key={k} value={k}>{REQUEST_KIND_LABELS[k]}</option>
              ))}
            </select>
          </label>
          <label className="text-[0.82rem] font-semibold text-ink">
            Subject
            <input value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={120} className={`${input} mt-1 font-normal`} />
          </label>
        </div>
        <label className="block text-[0.82rem] font-semibold text-ink">
          Details
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} required rows={3} maxLength={2000} className={`${input} mt-1 font-normal resize-y`} />
        </label>
        <button type="submit" className="px-4 py-2 rounded-lg bg-brand-primary text-white text-[0.85rem] font-semibold">Send to school</button>
        <span className="ml-2 text-[0.72rem] text-slate">Demo only: nothing is sent.</span>
      </form>

      {mine.length > 0 && (
        <div className="mt-5 border-t border-border pt-3">
          <h4 className="text-[0.88rem] font-semibold text-ink mb-2">Your requests</h4>
          <ul className="space-y-3">
            {mine.map((r) => (
              <li key={r.id} className="text-[0.85rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{r.subject}</span>
                  <RequestStatusPill status={r.status} />
                  <span className="text-slate text-[0.75rem]">{REQUEST_KIND_LABELS[r.kind]} · {formatDate(r.date)}</span>
                </div>
                {r.staffNote && <p className="mt-1 pl-3 border-l-2 border-brand-care text-slate">School: {r.staffNote}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function RequestStatusPill({ status }: { status: FamilyRequest["status"] }) {
  const tone =
    status === "new"
      ? "bg-[#FFF2E8] text-[#B4520F] border-[#FFD3B3]"
      : status === "in_progress"
        ? "bg-[#EFEAF8] text-brand-primary border-[#D6CBEF]"
        : "bg-[#E6F6F4] text-[#0B7A72] border-[#B3E3DF]";
  return <span className={`px-2 py-0.5 rounded-full border text-[0.72rem] font-semibold ${tone}`}>{REQUEST_STATUS_LABELS[status]}</span>;
}
