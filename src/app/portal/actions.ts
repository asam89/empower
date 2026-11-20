"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, type User } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { audit } from "@/lib/audit";
import { canEdit, studentAccess, UPDATE_CATEGORIES } from "@/lib/portal";

// ---------- helpers ----------

function text(form: FormData, key: string, max = 200): string {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

function optional(form: FormData, key: string, max = 200): string | null {
  return text(form, key, max) || null;
}

function intField(form: FormData, key: string): number | null {
  const n = Number(form.get(key));
  return Number.isInteger(n) && n > 0 ? n : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function back(path: string, params: { error?: string; ok?: string }): never {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  redirect(`${path}?${qs}`);
}

async function requireEditor(studentId: number | null): Promise<{ user: User; studentId: number }> {
  const user = await requireUser(["admin", "teacher"]);
  if (!studentId || !canEdit(await studentAccess(user, studentId))) {
    redirect("/portal?error=" + encodeURIComponent("You don't have access to that student."));
  }
  return { user, studentId };
}

/** Finds or invites a user by email. Never changes an existing user's role. */
async function ensureUser(email: string, role: "admin" | "teacher" | "parent", invitedBy: number) {
  const db = getDB();
  await db
    .prepare("INSERT INTO users (email, role, invited_by) VALUES (?, ?, ?) ON CONFLICT(email) DO NOTHING")
    .bind(email, role, invitedBy)
    .run();
  return db
    .prepare("SELECT id, role, disabled FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: number; role: string; disabled: number }>();
}

// ---------- students ----------

export async function createStudent(form: FormData) {
  const user = await requireUser(["admin", "teacher"]);
  const firstName = text(form, "first_name", 60);
  if (!firstName) back("/portal/students/new", { error: "First name is required." });
  const lastInitial = text(form, "last_initial", 1).toUpperCase() || null;

  const db = getDB();
  const row = await db
    .prepare(
      `INSERT INTO students (school_id, first_name, last_initial, grade, goals, created_by)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`
    )
    .bind(intField(form, "school_id"), firstName, lastInitial, optional(form, "grade", 20), optional(form, "goals", 2000), user.id)
    .first<{ id: number }>();
  const id = row!.id;
  await db.prepare("INSERT INTO student_staff (student_id, user_id) VALUES (?, ?)").bind(id, user.id).run();
  await audit(user.id, "student.create", "student", id);
  redirect(`/portal/students/${id}?ok=` + encodeURIComponent("Student profile created."));
}

export async function updateStudent(form: FormData) {
  const { user, studentId } = await requireEditor(intField(form, "student_id"));
  const firstName = text(form, "first_name", 60);
  if (!firstName) back(`/portal/students/${studentId}/edit`, { error: "First name is required." });
  await getDB()
    .prepare(
      `UPDATE students SET school_id = ?, first_name = ?, last_initial = ?, grade = ?, goals = ?
        WHERE id = ?`
    )
    .bind(
      intField(form, "school_id"),
      firstName,
      text(form, "last_initial", 1).toUpperCase() || null,
      optional(form, "grade", 20),
      optional(form, "goals", 2000),
      studentId
    )
    .run();
  await audit(user.id, "student.update", "student", studentId);
  redirect(`/portal/students/${studentId}?ok=` + encodeURIComponent("Profile saved."));
}

export async function setStudentArchived(form: FormData) {
  const { user, studentId } = await requireEditor(intField(form, "student_id"));
  const archived = form.get("archived") === "1" ? 1 : 0;
  await getDB().prepare("UPDATE students SET archived = ? WHERE id = ?").bind(archived, studentId).run();
  await audit(user.id, archived ? "student.archive" : "student.restore", "student", studentId);
  redirect(archived ? "/portal?ok=" + encodeURIComponent("Student archived.") : `/portal/students/${studentId}`);
}

// ---------- progress updates ----------

export async function postUpdate(form: FormData) {
  const { user, studentId } = await requireEditor(intField(form, "student_id"));
  const body = text(form, "body", 5000);
  const path = `/portal/students/${studentId}`;
  if (!body) back(path, { error: "Write something before posting." });
  const category = UPDATE_CATEGORIES.some((c) => c.value === form.get("category"))
    ? String(form.get("category"))
    : "general";
  const visibility = form.get("visibility") === "staff" ? "staff" : "parents";
  const row = await getDB()
    .prepare("INSERT INTO updates (student_id, author_id, category, body, visibility) VALUES (?, ?, ?, ?, ?) RETURNING id")
    .bind(studentId, user.id, category, body, visibility)
    .first<{ id: number }>();
  await audit(user.id, "update.create", "update", row!.id);
  revalidatePath(path);
  back(path, { ok: visibility === "parents" ? "Update posted and shared with family." : "Staff-only note posted." });
}

export async function deleteUpdate(form: FormData) {
  const user = await requireUser(["admin", "teacher"]);
  const updateId = intField(form, "update_id");
  const db = getDB();
  const update = updateId
    ? await db.prepare("SELECT student_id, author_id FROM updates WHERE id = ?").bind(updateId).first<{ student_id: number; author_id: number }>()
    : null;
  if (!update || (user.role !== "admin" && update.author_id !== user.id)) {
    redirect("/portal?error=" + encodeURIComponent("You can only delete your own updates."));
  }
  await db.prepare("DELETE FROM updates WHERE id = ?").bind(updateId).run();
  await audit(user.id, "update.delete", "update", updateId);
  back(`/portal/students/${update.student_id}`, { ok: "Update deleted." });
}

export async function addComment(form: FormData) {
  const user = await requireUser();
  const updateId = intField(form, "update_id");
  const body = text(form, "body", 2000);
  const db = getDB();
  const update = updateId
    ? await db.prepare("SELECT student_id, visibility FROM updates WHERE id = ?").bind(updateId).first<{ student_id: number; visibility: string }>()
    : null;
  const access = update ? await studentAccess(user, update.student_id) : null;
  if (!update || !access || (access === "guardian" && update.visibility !== "parents")) {
    redirect("/portal?error=" + encodeURIComponent("You can't reply to that update."));
  }
  const path = `/portal/students/${update.student_id}`;
  if (!body) back(path, { error: "Reply can't be empty." });
  const row = await db
    .prepare("INSERT INTO update_comments (update_id, author_id, body) VALUES (?, ?, ?) RETURNING id")
    .bind(updateId, user.id, body)
    .first<{ id: number }>();
  await audit(user.id, "comment.create", "comment", row!.id);
  redirect(`${path}#update-${updateId}`);
}

// ---------- family & staff links ----------

export async function inviteGuardian(form: FormData) {
  const { user, studentId } = await requireEditor(intField(form, "student_id"));
  const path = `/portal/students/${studentId}`;
  const email = text(form, "email", 200).toLowerCase();
  if (!EMAIL_RE.test(email)) back(path, { error: "Enter a valid email address." });
  const guardian = await ensureUser(email, "parent", user.id);
  if (!guardian || guardian.disabled) back(path, { error: "That account has been removed. Ask an admin to restore it." });
  await getDB()
    .prepare("INSERT INTO guardians (student_id, user_id, relationship) VALUES (?, ?, ?) ON CONFLICT DO UPDATE SET relationship = excluded.relationship")
    .bind(studentId, guardian.id, optional(form, "relationship", 40))
    .run();
  await audit(user.id, "guardian.link", "student", studentId);
  back(path, { ok: `${email} can now sign in with Google to follow along.` });
}

export async function removeGuardian(form: FormData) {
  const { user, studentId } = await requireEditor(intField(form, "student_id"));
  await getDB()
    .prepare("DELETE FROM guardians WHERE student_id = ? AND user_id = ?")
    .bind(studentId, intField(form, "user_id"))
    .run();
  await audit(user.id, "guardian.unlink", "student", studentId);
  back(`/portal/students/${studentId}`, { ok: "Family member removed from this student." });
}

export async function assignStaff(form: FormData) {
  const user = await requireUser(["admin"]);
  const studentId = intField(form, "student_id");
  const staffId = intField(form, "user_id");
  const db = getDB();
  const staff = staffId
    ? await db.prepare("SELECT role FROM users WHERE id = ? AND disabled = 0").bind(staffId).first<{ role: string }>()
    : null;
  if (!studentId || !staff || staff.role === "parent") back(`/portal/students/${studentId}`, { error: "Pick a teacher." });
  await db.prepare("INSERT INTO student_staff (student_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING").bind(studentId, staffId).run();
  await audit(user.id, "staff.assign", "student", studentId);
  back(`/portal/students/${studentId}`, { ok: "Teacher assigned." });
}

export async function unassignStaff(form: FormData) {
  const user = await requireUser(["admin"]);
  const studentId = intField(form, "student_id");
  await getDB().prepare("DELETE FROM student_staff WHERE student_id = ? AND user_id = ?").bind(studentId, intField(form, "user_id")).run();
  await audit(user.id, "staff.unassign", "student", studentId);
  back(`/portal/students/${studentId}`, { ok: "Teacher unassigned." });
}

// ---------- team (admin) ----------

export async function inviteStaff(form: FormData) {
  const user = await requireUser(["admin"]);
  const email = text(form, "email", 200).toLowerCase();
  const role = form.get("role") === "admin" ? "admin" : "teacher";
  if (!EMAIL_RE.test(email)) back("/portal/team", { error: "Enter a valid email address." });
  const existing = await getDB().prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) back("/portal/team", { error: "That email is already on the team list. Change their role below instead." });
  const created = await ensureUser(email, role, user.id);
  await audit(user.id, "user.invite", "user", created?.id);
  back("/portal/team", { ok: `${email} added as ${role}. They can now sign in with Google.` });
}

export async function changeRole(form: FormData) {
  const user = await requireUser(["admin"]);
  const targetId = intField(form, "user_id");
  const role = String(form.get("role"));
  if (!targetId || !["admin", "teacher", "parent"].includes(role)) back("/portal/team", { error: "Invalid role." });
  if (targetId === user.id) back("/portal/team", { error: "You can't change your own role." });
  await getDB().prepare("UPDATE users SET role = ? WHERE id = ?").bind(role, targetId).run();
  await audit(user.id, "user.role", "user", targetId);
  back("/portal/team", { ok: "Role updated." });
}

export async function setUserDisabled(form: FormData) {
  const user = await requireUser(["admin"]);
  const targetId = intField(form, "user_id");
  const disabled = form.get("disabled") === "1" ? 1 : 0;
  if (!targetId || targetId === user.id) back("/portal/team", { error: "You can't remove yourself." });
  const db = getDB();
  await db.batch([
    db.prepare("UPDATE users SET disabled = ? WHERE id = ?").bind(disabled, targetId),
    db.prepare("DELETE FROM sessions WHERE user_id = ? AND ? = 1").bind(targetId, disabled),
  ]);
  await audit(user.id, disabled ? "user.disable" : "user.enable", "user", targetId);
  back("/portal/team", { ok: disabled ? "Access removed." : "Access restored." });
}

// ---------- schools & program milestones ----------

export async function createSchool(form: FormData) {
  const user = await requireUser(["admin"]);
  const name = text(form, "name", 120);
  if (!name) back("/portal/schools", { error: "School name is required." });
  const row = await getDB()
    .prepare("INSERT INTO schools (name, board) VALUES (?, ?) RETURNING id")
    .bind(name, optional(form, "board", 60))
    .first<{ id: number }>();
  await audit(user.id, "school.create", "school", row!.id);
  redirect(`/portal/schools/${row!.id}`);
}

export async function createMilestone(form: FormData) {
  const user = await requireUser(["admin"]);
  const schoolId = intField(form, "school_id");
  const title = text(form, "title", 160);
  const path = `/portal/schools/${schoolId}`;
  if (!schoolId || !title) back(path, { error: "Milestone title is required." });
  const due = text(form, "due_date", 10);
  await getDB()
    .prepare("INSERT INTO milestones (school_id, title, due_date, notes) VALUES (?, ?, ?, ?)")
    .bind(schoolId, title, /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null, optional(form, "notes", 1000))
    .run();
  await audit(user.id, "milestone.create", "school", schoolId);
  back(path, { ok: "Milestone added." });
}

export async function setMilestoneStatus(form: FormData) {
  const user = await requireUser(["admin"]);
  const id = intField(form, "milestone_id");
  const status = String(form.get("status"));
  if (!id || !["planned", "in_progress", "done"].includes(status)) redirect("/portal/schools");
  const row = await getDB()
    .prepare("UPDATE milestones SET status = ?, updated_at = datetime('now') WHERE id = ? RETURNING school_id")
    .bind(status, id)
    .first<{ school_id: number }>();
  await audit(user.id, "milestone.status", "milestone", id);
  redirect(`/portal/schools/${row?.school_id ?? ""}`);
}

export async function deleteMilestone(form: FormData) {
  const user = await requireUser(["admin"]);
  const id = intField(form, "milestone_id");
  const row = await getDB()
    .prepare("DELETE FROM milestones WHERE id = ? RETURNING school_id")
    .bind(id)
    .first<{ school_id: number }>();
  await audit(user.id, "milestone.delete", "milestone", id);
  redirect(`/portal/schools/${row?.school_id ?? ""}`);
}
