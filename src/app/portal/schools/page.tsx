import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { requireDB } from "@/lib/db";
import { createSchool } from "@/app/portal/actions";
import { Card, Flash, PageTitle, inputClass, labelClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";

export const runtime = "edge";
export const metadata: Metadata = { title: "Schools — Empower" };

interface SchoolRow {
  id: number;
  name: string;
  board: string | null;
  total: number;
  done: number;
  students: number;
}

export default async function SchoolsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const user = await requireUser(["admin", "teacher"]);
  const { ok, error } = await searchParams;
  const { results: schools } = await requireDB()
    .prepare(
      `SELECT sc.id, sc.name, sc.board,
              (SELECT COUNT(*) FROM milestones m WHERE m.school_id = sc.id) AS total,
              (SELECT COUNT(*) FROM milestones m WHERE m.school_id = sc.id AND m.status = 'done') AS done,
              (SELECT COUNT(*) FROM students s WHERE s.school_id = sc.id AND s.archived = 0) AS students
         FROM schools sc ORDER BY sc.name`
    )
    .all<SchoolRow>();

  return (
    <>
      <Flash ok={ok} error={error} />
      <PageTitle title="Schools" subtitle="Program rollout progress at each partner school." />
      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        {schools.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate text-[0.9rem]">No schools yet.</p>
          </Card>
        ) : (
          <ul className="space-y-4">
            {schools.map((s) => {
              const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
              return (
                <li key={s.id}>
                  <Link href={`/portal/schools/${s.id}`} className="block bg-surface rounded-2xl border border-border p-5 hover:border-brand-primary hover:shadow-sm transition">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-semibold text-ink">{s.name}</span>
                      <span className="text-[0.78rem] text-slate shrink-0">{s.board ?? ""}</span>
                    </div>
                    <div className="mt-3 h-2.5 rounded-full bg-cloud border border-border overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} program progress`}>
                      <div className="h-full bg-brand-care" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[0.78rem] text-slate mt-2">
                      {s.done} of {s.total} milestones done · {s.students} student{s.students === 1 ? "" : "s"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {user.role === "admin" && (
          <Card>
            <h2 className="font-bold text-ink mb-4">Add a school</h2>
            <form action={createSchool} className="space-y-4">
              <div>
                <label htmlFor="name" className={labelClass}>School name</label>
                <input id="name" name="name" required maxLength={120} className={inputClass} />
              </div>
              <div>
                <label htmlFor="board" className={labelClass}>Board</label>
                <input id="board" name="board" maxLength={60} placeholder="e.g. TDSB, YRDSB, Independent" className={inputClass} />
              </div>
              <SubmitButton>Add school</SubmitButton>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
