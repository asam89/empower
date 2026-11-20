import type { Metadata } from "next";
import Link from "next/link";
import { requireUser, isStaff } from "@/lib/auth";
import { categoryLabel, formatDate, listStudents, recentUpdates, studentName, displayName } from "@/lib/portal";
import { Avatar, Badge, Card, Flash, PageTitle, buttonClass } from "@/components/portal/ui";

export const runtime = "edge";
export const metadata: Metadata = { title: "Portal — Empower" };

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; archived?: string }>;
}) {
  const { ok, error, archived } = await searchParams;
  const user = await requireUser();
  const staff = isStaff(user);
  const showArchived = staff && archived === "1";
  const [students, feed] = await Promise.all([listStudents(user, showArchived), recentUpdates(user, 8)]);
  const firstName = (user.name ?? "").split(" ")[0];

  return (
    <>
      <Flash ok={ok} error={error} />
      <PageTitle
        title={staff ? "Students" : `Hi${firstName ? `, ${firstName}` : ""} 👋`}
        subtitle={
          staff
            ? user.role === "admin"
              ? "Every student in the program."
              : "Students you're supporting."
            : "Here's how your child is growing."
        }
        actions={
          staff && (
            <Link href="/portal/students/new" className={buttonClass}>
              + Add student
            </Link>
          )
        }
      />

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div>
          {students.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-ink font-semibold">{staff ? "No students yet" : "No profiles shared with you yet"}</p>
              <p className="text-slate text-[0.88rem] mt-1">
                {staff
                  ? "Add a student to start sharing progress with their family."
                  : "Your child's teacher will link you to their profile."}
              </p>
            </Card>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-4">
              {students.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/portal/students/${s.id}`}
                    className="flex items-center gap-4 bg-surface rounded-2xl border border-border p-5 hover:border-brand-primary hover:shadow-sm transition"
                  >
                    <Avatar name={studentName(s)} />
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink truncate">{studentName(s)}</span>
                      <span className="block text-[0.8rem] text-slate truncate">
                        {[s.grade && `Grade ${s.grade}`, s.school_name].filter(Boolean).join(" · ") || "—"}
                      </span>
                      {s.archived === 1 && <Badge>Archived</Badge>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {staff && (
            <p className="mt-4 text-[0.8rem]">
              <Link className="text-slate underline" href={showArchived ? "/portal" : "/portal?archived=1"}>
                {showArchived ? "Hide archived students" : "Show archived students"}
              </Link>
            </p>
          )}
        </div>

        <Card>
          <h2 className="font-bold text-ink mb-4">Latest updates</h2>
          {feed.length === 0 ? (
            <p className="text-slate text-[0.85rem]">Nothing posted yet.</p>
          ) : (
            <ol className="space-y-4">
              {feed.map((u) => (
                <li key={u.id} className="border-l-4 border-brand-care pl-3">
                  <Link href={`/portal/students/${u.student_id}#update-${u.id}`} className="block group">
                    <span className="flex items-center gap-2 flex-wrap text-[0.78rem] text-slate">
                      <strong className="text-ink">{studentName(u)}</strong>
                      <Badge tone={u.category === "milestone" ? "accent" : "care"}>{categoryLabel(u.category)}</Badge>
                      {u.visibility === "staff" && <Badge tone="primary">Staff only</Badge>}
                    </span>
                    <span className="block text-[0.85rem] text-ink mt-1 line-clamp-2 group-hover:text-brand-primary">{u.body}</span>
                    <span className="block text-[0.72rem] text-slate mt-1">
                      {displayName({ name: u.author_name, email: u.author_email })} · {formatDate(u.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
