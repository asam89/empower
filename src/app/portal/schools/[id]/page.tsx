import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { formatDate } from "@/lib/portal";
import { createMilestone, deleteMilestone, setMilestoneStatus } from "@/app/portal/actions";
import { Badge, Card, Flash, PageTitle, inputClass, labelClass, linkButtonClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";

export const runtime = "edge";
export const metadata: Metadata = { title: "School — Empower" };

interface Milestone {
  id: number;
  title: string;
  status: "planned" | "in_progress" | "done";
  due_date: string | null;
  notes: string | null;
  updated_at: string;
}

const STATUS = {
  planned: { label: "Planned", tone: "neutral" as const },
  in_progress: { label: "In progress", tone: "accent" as const },
  done: { label: "Done", tone: "care" as const },
};

export default async function SchoolPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requireUser(["admin", "teacher"]);
  const id = Number((await params).id);
  const { ok, error } = await searchParams;
  const db = getDB();
  const school = Number.isInteger(id)
    ? await db.prepare("SELECT id, name, board FROM schools WHERE id = ?").bind(id).first<{ id: number; name: string; board: string | null }>()
    : null;
  if (!school) notFound();
  const { results: milestones } = await db
    .prepare(
      `SELECT id, title, status, due_date, notes, updated_at FROM milestones WHERE school_id = ?
        ORDER BY CASE status WHEN 'in_progress' THEN 0 WHEN 'planned' THEN 1 ELSE 2 END, due_date IS NULL, due_date, id`
    )
    .bind(id)
    .all<Milestone>();
  const done = milestones.filter((m) => m.status === "done").length;
  const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
  const admin = user.role === "admin";

  return (
    <>
      <Flash ok={ok} error={error} />
      <p className="mb-2"><Link href="/portal/schools" className="text-[0.82rem] text-slate underline">← All schools</Link></p>
      <PageTitle title={school.name} subtitle={`${school.board ? `${school.board} · ` : ""}${done} of ${milestones.length} milestones done (${pct}%)`} />

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <Card>
          <h2 className="font-bold text-ink mb-4">Program milestones</h2>
          {milestones.length === 0 ? (
            <p className="text-slate text-[0.88rem]">No milestones yet.{admin ? " Add the first one to start tracking rollout." : ""}</p>
          ) : (
            <ul className="divide-y divide-border">
              {milestones.map((m) => (
                <li key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[0.92rem] ${m.status === "done" ? "text-slate line-through" : "text-ink"}`}>{m.title}</p>
                    <p className="text-[0.75rem] text-slate mt-0.5">
                      {m.due_date ? `Due ${formatDate(m.due_date)} · ` : ""}Updated {formatDate(m.updated_at)}
                    </p>
                    {m.notes && <p className="text-[0.83rem] text-slate mt-1 whitespace-pre-wrap">{m.notes}</p>}
                  </div>
                  {admin ? (
                    <div className="flex items-center gap-2">
                      <form action={setMilestoneStatus} className="flex gap-1">
                        <input type="hidden" name="milestone_id" value={m.id} />
                        {(Object.keys(STATUS) as Milestone["status"][]).map((s) => (
                          <button
                            key={s}
                            name="status"
                            value={s}
                            aria-pressed={m.status === s}
                            className={`px-2.5 py-1 rounded-lg text-[0.72rem] font-semibold border ${
                              m.status === s ? "bg-brand-primary text-white border-brand-primary" : "bg-surface text-slate border-border hover:border-brand-primary"
                            }`}
                          >
                            {STATUS[s].label}
                          </button>
                        ))}
                      </form>
                      <form action={deleteMilestone}>
                        <input type="hidden" name="milestone_id" value={m.id} />
                        <SubmitButton className={linkButtonClass} pendingText="…" confirm="Delete this milestone?">Delete</SubmitButton>
                      </form>
                    </div>
                  ) : (
                    <Badge tone={STATUS[m.status].tone}>{STATUS[m.status].label}</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {admin && (
          <Card>
            <h2 className="font-bold text-ink mb-4">Add a milestone</h2>
            <form action={createMilestone} className="space-y-4">
              <input type="hidden" name="school_id" value={id} />
              <div>
                <label htmlFor="title" className={labelClass}>Milestone</label>
                <input id="title" name="title" required maxLength={160} placeholder="e.g. IPRC workflow documented" className={inputClass} />
              </div>
              <div>
                <label htmlFor="due_date" className={labelClass}>Target date</label>
                <input id="due_date" name="due_date" type="date" className={inputClass} />
              </div>
              <div>
                <label htmlFor="notes" className={labelClass}>Notes</label>
                <textarea id="notes" name="notes" rows={3} maxLength={1000} className={`${inputClass} resize-y`} />
              </div>
              <SubmitButton>Add milestone</SubmitButton>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
