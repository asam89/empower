import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDB } from "@/lib/db";
import {
  canEdit,
  categoryLabel,
  displayName,
  formatDate,
  getStudent,
  listComments,
  listUpdates,
  studentAccess,
  studentName,
  UPDATE_CATEGORIES,
} from "@/lib/portal";
import {
  addComment,
  assignStaff,
  deleteUpdate,
  inviteGuardian,
  postUpdate,
  removeGuardian,
  unassignStaff,
} from "@/app/portal/actions";
import {
  Avatar,
  Badge,
  Card,
  Flash,
  inputClass,
  labelClass,
  linkButtonClass,
  secondaryButtonClass,
} from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";

export const runtime = "edge";
export const metadata: Metadata = { title: "Student — Empower" };

interface Person {
  id: number;
  email: string;
  name: string | null;
  relationship?: string | null;
  last_login_at: string | null;
}

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requireUser();
  const id = Number((await params).id);
  const { ok, error } = await searchParams;
  const access = Number.isInteger(id) ? await studentAccess(user, id) : null;
  if (!access) notFound();
  const student = await getStudent(id);
  if (!student) notFound();
  const editor = canEdit(access);
  const db = getDB();

  const [updates, guardians, staff, teachers] = await Promise.all([
    listUpdates(id, access),
    db
      .prepare(
        `SELECT u.id, u.email, u.name, g.relationship, u.last_login_at FROM guardians g
           JOIN users u ON u.id = g.user_id WHERE g.student_id = ? AND u.disabled = 0 ORDER BY u.email`
      )
      .bind(id)
      .all<Person>()
      .then((r) => r.results),
    db
      .prepare(
        `SELECT u.id, u.email, u.name, u.last_login_at FROM student_staff ss
           JOIN users u ON u.id = ss.user_id WHERE ss.student_id = ? AND u.disabled = 0 ORDER BY u.name, u.email`
      )
      .bind(id)
      .all<Person>()
      .then((r) => r.results),
    user.role === "admin"
      ? db
          .prepare("SELECT id, email, name, NULL AS last_login_at FROM users WHERE role IN ('teacher','admin') AND disabled = 0 ORDER BY name, email")
          .all<Person>()
          .then((r) => r.results)
      : Promise.resolve([] as Person[]),
  ]);
  const comments = await listComments(updates.map((u) => u.id));
  const goals = (student.goals ?? "").split("\n").map((g) => g.trim()).filter(Boolean);
  const name = studentName(student);

  return (
    <>
      <Flash ok={ok} error={error} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
        <Avatar name={name} size={72} />
        <div className="flex-1">
          <h1 className="text-[1.7rem] font-bold text-ink tracking-tight flex items-center gap-3 flex-wrap">
            {name}
            {student.archived === 1 && <Badge>Archived</Badge>}
          </h1>
          <p className="text-slate text-[0.9rem]">
            {[student.grade && `Grade ${student.grade}`, student.school_name].filter(Boolean).join(" · ") || "No school set"}
          </p>
        </div>
        {editor && (
          <Link href={`/portal/students/${id}/edit`} className={secondaryButtonClass}>
            Edit profile
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Progress feed */}
        <div className="space-y-6">
          {editor && (
            <Card>
              <h2 className="font-bold text-ink mb-4">Share a progress update</h2>
              <form action={postUpdate} className="space-y-4">
                <input type="hidden" name="student_id" value={id} />
                <div>
                  <label htmlFor="body" className="sr-only">Update</label>
                  <textarea
                    id="body"
                    name="body"
                    required
                    rows={4}
                    maxLength={5000}
                    placeholder={`What did ${student.first_name} work on or achieve today?`}
                    className={`${inputClass} resize-y`}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1">
                    <label htmlFor="category" className={labelClass}>Area</label>
                    <select id="category" name="category" className={inputClass} defaultValue="general">
                      {UPDATE_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="visibility" className={labelClass}>Who can see it</label>
                    <select id="visibility" name="visibility" className={inputClass} defaultValue="parents">
                      <option value="parents">Family + staff</option>
                      <option value="staff">Staff only</option>
                    </select>
                  </div>
                  <SubmitButton pendingText="Posting…">Post update</SubmitButton>
                </div>
              </form>
            </Card>
          )}

          {updates.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-slate text-[0.9rem]">No updates yet.</p>
            </Card>
          ) : (
            <ol className="space-y-5">
              {updates.map((u) => {
                const replies = comments.filter((c) => c.update_id === u.id);
                const canReply = access !== "guardian" || u.visibility === "parents";
                return (
                  <li key={u.id} id={`update-${u.id}`} className="scroll-mt-24">
                    <Card>
                      <div className="flex items-start gap-3">
                        <Avatar name={displayName({ name: u.author_name, email: u.author_email })} size={36} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-ink text-[0.9rem]">
                              {displayName({ name: u.author_name, email: u.author_email })}
                            </span>
                            <span className="text-[0.75rem] text-slate">{formatDate(u.created_at)}</span>
                            <Badge tone={u.category === "milestone" ? "accent" : "care"}>{categoryLabel(u.category)}</Badge>
                            {u.visibility === "staff" && <Badge tone="primary">Staff only</Badge>}
                          </div>
                          <p className="text-ink text-[0.92rem] mt-2 whitespace-pre-wrap break-words">{u.body}</p>
                        </div>
                        {editor && (user.role === "admin" || u.author_id === user.id) && (
                          <form action={deleteUpdate}>
                            <input type="hidden" name="update_id" value={u.id} />
                            <SubmitButton className={linkButtonClass} pendingText="…" confirm="Delete this update and its replies?">
                              Delete
                            </SubmitButton>
                          </form>
                        )}
                      </div>

                      {(replies.length > 0 || canReply) && (
                        <div className="mt-4 ml-12 space-y-3 border-t border-border pt-4">
                          {replies.map((c) => (
                            <div key={c.id} className="flex items-start gap-2">
                              <Avatar name={displayName({ name: c.author_name, email: c.author_email })} size={26} />
                              <div className="bg-cloud rounded-xl px-3 py-2 flex-1 min-w-0">
                                <p className="text-[0.75rem] text-slate">
                                  <strong className="text-ink">{displayName({ name: c.author_name, email: c.author_email })}</strong>
                                  {c.author_role === "parent" ? " · Family" : ""} · {formatDate(c.created_at)}
                                </p>
                                <p className="text-[0.85rem] text-ink whitespace-pre-wrap break-words">{c.body}</p>
                              </div>
                            </div>
                          ))}
                          {canReply && (
                            <form action={addComment} className="flex gap-2">
                              <input type="hidden" name="update_id" value={u.id} />
                              <label htmlFor={`reply-${u.id}`} className="sr-only">Reply</label>
                              <input
                                id={`reply-${u.id}`}
                                name="body"
                                required
                                maxLength={2000}
                                placeholder={access === "guardian" ? "Say thanks or share how it's going at home…" : "Reply…"}
                                className={`${inputClass} py-2`}
                              />
                              <SubmitButton className={secondaryButtonClass} pendingText="…">Reply</SubmitButton>
                            </form>
                          )}
                        </div>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h2 className="font-bold text-ink mb-3">Goals</h2>
            {goals.length === 0 ? (
              <p className="text-slate text-[0.85rem]">No goals set yet.</p>
            ) : (
              <ul className="space-y-2">
                {goals.map((g, i) => (
                  <li key={i} className="flex gap-2 text-[0.88rem] text-ink">
                    <span aria-hidden="true" className="text-brand-accent">★</span>
                    {g}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="font-bold text-ink mb-3">Teachers</h2>
            {staff.length === 0 ? (
              <p className="text-slate text-[0.85rem]">No teacher assigned.</p>
            ) : (
              <ul className="space-y-2">
                {staff.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-[0.85rem]">
                    <Avatar name={displayName(p)} size={28} />
                    <span className="flex-1 min-w-0 truncate">{displayName(p)}</span>
                    {user.role === "admin" && (
                      <form action={unassignStaff}>
                        <input type="hidden" name="student_id" value={id} />
                        <input type="hidden" name="user_id" value={p.id} />
                        <SubmitButton className={linkButtonClass} pendingText="…">Remove</SubmitButton>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {user.role === "admin" && teachers.length > 0 && (
              <form action={assignStaff} className="flex gap-2 mt-4">
                <input type="hidden" name="student_id" value={id} />
                <label htmlFor="assign" className="sr-only">Assign teacher</label>
                <select id="assign" name="user_id" className={`${inputClass} py-2`} required defaultValue="">
                  <option value="" disabled>Assign a teacher…</option>
                  {teachers
                    .filter((t) => !staff.some((s) => s.id === t.id))
                    .map((t) => (
                      <option key={t.id} value={t.id}>{displayName(t)}</option>
                    ))}
                </select>
                <SubmitButton className={secondaryButtonClass} pendingText="…">Add</SubmitButton>
              </form>
            )}
          </Card>

          <Card>
            <h2 className="font-bold text-ink mb-1">Family</h2>
            <p className="text-slate text-[0.78rem] mb-3">
              {editor ? "Family members see updates marked “Family + staff” and can reply." : "Family members following along."}
            </p>
            {guardians.length === 0 ? (
              <p className="text-slate text-[0.85rem]">No family linked yet.</p>
            ) : (
              <ul className="space-y-2">
                {guardians.map((g) => (
                  <li key={g.id} className="flex items-center gap-2 text-[0.85rem]">
                    <Avatar name={displayName(g)} size={28} />
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">{displayName(g)}</span>
                      <span className="block text-[0.72rem] text-slate truncate">
                        {[g.relationship, editor && (g.last_login_at ? "Joined" : "Invited · hasn't signed in")]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    {editor && (
                      <form action={removeGuardian}>
                        <input type="hidden" name="student_id" value={id} />
                        <input type="hidden" name="user_id" value={g.id} />
                        <SubmitButton className={linkButtonClass} pendingText="…" confirm={`Remove ${displayName(g)} from ${name}?`}>
                          Remove
                        </SubmitButton>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {editor && (
              <form action={inviteGuardian} className="space-y-3 mt-5 pt-4 border-t border-border">
                <input type="hidden" name="student_id" value={id} />
                <p className="text-[0.82rem] font-semibold text-ink">Invite a parent or guardian</p>
                <div>
                  <label htmlFor="guardian-email" className="sr-only">Their Google email</label>
                  <input id="guardian-email" name="email" type="email" required placeholder="Their Google email" className={`${inputClass} py-2`} />
                </div>
                <div>
                  <label htmlFor="relationship" className="sr-only">Relationship</label>
                  <input id="relationship" name="relationship" maxLength={40} placeholder="Relationship (e.g. Mom, Grandpa)" className={`${inputClass} py-2`} />
                </div>
                <SubmitButton className={secondaryButtonClass} pendingText="Inviting…">Link family member</SubmitButton>
              </form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
