import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { displayName, formatDate } from "@/lib/portal";
import { changeRole, inviteStaff, setUserDisabled } from "@/app/portal/actions";
import { Avatar, Badge, Card, Flash, PageTitle, inputClass, labelClass, linkButtonClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";

export const runtime = "edge";
export const metadata: Metadata = { title: "Team — Empower" };

interface Member {
  id: number;
  email: string;
  name: string | null;
  role: "admin" | "teacher" | "parent";
  disabled: number;
  last_login_at: string | null;
  students: number;
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; show?: string }>;
}) {
  const user = await requireUser(["admin"]);
  const { ok, error, show } = await searchParams;
  const showParents = show === "parents";
  const { results: members } = await getDB()
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.disabled, u.last_login_at,
              CASE WHEN u.role = 'parent'
                   THEN (SELECT COUNT(*) FROM guardians g WHERE g.user_id = u.id)
                   ELSE (SELECT COUNT(*) FROM student_staff ss WHERE ss.user_id = u.id) END AS students
         FROM users u WHERE ${showParents ? "u.role = 'parent'" : "u.role IN ('admin','teacher')"}
        ORDER BY u.disabled, u.role, u.name, u.email`
    )
    .all<Member>();

  return (
    <>
      <Flash ok={ok} error={error} />
      <PageTitle
        title={showParents ? "Families" : "Team"}
        subtitle={
          <>
            Only people listed here can sign in.{" "}
            <a className="underline" href={showParents ? "/portal/team" : "/portal/team?show=parents"}>
              {showParents ? "Show staff" : "Show families"}
            </a>
          </>
        }
      />
      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <Card className="p-0 overflow-hidden">
          {members.length === 0 ? (
            <p className="p-6 text-slate text-[0.88rem]">Nobody here yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {members.map((m) => (
                <li key={m.id} className={`p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${m.disabled ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={displayName(m)} size={36} />
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-[0.9rem] truncate">
                        {displayName(m)} {m.disabled ? <Badge>Removed</Badge> : null}
                      </p>
                      <p className="text-[0.75rem] text-slate truncate">
                        {m.name ? `${m.email} · ` : ""}
                        {m.last_login_at ? `Last sign-in ${formatDate(m.last_login_at)}` : "Hasn't signed in yet"} · {m.students} student
                        {m.students === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  {m.id === user.id ? (
                    <Badge tone="primary">You</Badge>
                  ) : (
                    <div className="flex items-center gap-3">
                      <form action={changeRole} className="flex items-center gap-2">
                        <input type="hidden" name="user_id" value={m.id} />
                        <label htmlFor={`role-${m.id}`} className="sr-only">Role</label>
                        <select id={`role-${m.id}`} name="role" defaultValue={m.role} className="px-2 py-1.5 border border-border rounded-lg bg-cloud text-[0.8rem]">
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                          <option value="parent">Family</option>
                        </select>
                        <SubmitButton className={linkButtonClass} pendingText="…">Save</SubmitButton>
                      </form>
                      <form action={setUserDisabled}>
                        <input type="hidden" name="user_id" value={m.id} />
                        <input type="hidden" name="disabled" value={m.disabled ? "0" : "1"} />
                        <SubmitButton
                          className={linkButtonClass}
                          pendingText="…"
                          confirm={m.disabled ? undefined : `Remove ${displayName(m)}'s access? They'll be signed out immediately.`}
                        >
                          {m.disabled ? "Restore" : "Remove"}
                        </SubmitButton>
                      </form>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-bold text-ink mb-1">Add a team member</h2>
          <p className="text-slate text-[0.8rem] mb-4">Families are invited from a student&apos;s profile.</p>
          <form action={inviteStaff} className="space-y-4">
            <div>
              <label htmlFor="email" className={labelClass}>Google email</label>
              <input id="email" name="email" type="email" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="role" className={labelClass}>Role</label>
              <select id="role" name="role" defaultValue="teacher" className={inputClass}>
                <option value="teacher">Teacher: their assigned students</option>
                <option value="admin">Admin: everything</option>
              </select>
            </div>
            <SubmitButton>Add to team</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
