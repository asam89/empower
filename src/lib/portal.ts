import { getDB } from "@/lib/db";
import type { Role, User } from "@/lib/auth";

export interface Student {
  id: number;
  school_id: number | null;
  school_name: string | null;
  first_name: string;
  last_initial: string | null;
  grade: string | null;
  goals: string | null;
  archived: number;
  created_at: string;
}

export interface UpdateRow {
  id: number;
  student_id: number;
  author_id: number;
  author_name: string | null;
  author_email: string;
  author_role: Role;
  category: string;
  body: string;
  visibility: "parents" | "staff";
  created_at: string;
}

export interface CommentRow {
  id: number;
  update_id: number;
  author_id: number;
  author_name: string | null;
  author_email: string;
  author_role: Role;
  body: string;
  created_at: string;
}

export interface School {
  id: number;
  name: string;
  board: string | null;
}

export const UPDATE_CATEGORIES = [
  { value: "academic", label: "Academic" },
  { value: "communication", label: "Communication" },
  { value: "social", label: "Social & emotional" },
  { value: "behaviour", label: "Behaviour" },
  { value: "independence", label: "Life & independence skills" },
  { value: "milestone", label: "Milestone 🎉" },
  { value: "general", label: "General" },
] as const;

export const categoryLabel = (value: string) =>
  UPDATE_CATEGORIES.find((c) => c.value === value)?.label ?? "General";

export const studentName = (s: Pick<Student, "first_name" | "last_initial">) =>
  s.last_initial ? `${s.first_name} ${s.last_initial}.` : s.first_name;

export const displayName = (u: { name: string | null; email: string }) => u.name || u.email;

const STUDENT_COLS = `s.id, s.school_id, sc.name AS school_name, s.first_name, s.last_initial,
  s.grade, s.goals, s.archived, s.created_at`;

/** Students the user may see: admins see all, teachers their assigned students, parents their children. */
export async function listStudents(user: User, includeArchived = false): Promise<Student[]> {
  const db = getDB();
  const archived = includeArchived ? "" : "AND s.archived = 0";
  let sql: string;
  let binds: unknown[] = [];
  if (user.role === "admin") {
    sql = `SELECT ${STUDENT_COLS} FROM students s LEFT JOIN schools sc ON sc.id = s.school_id
           WHERE 1=1 ${archived} ORDER BY s.first_name`;
  } else if (user.role === "teacher") {
    sql = `SELECT ${STUDENT_COLS} FROM students s LEFT JOIN schools sc ON sc.id = s.school_id
           JOIN student_staff ss ON ss.student_id = s.id AND ss.user_id = ?
           WHERE 1=1 ${archived} ORDER BY s.first_name`;
    binds = [user.id];
  } else {
    sql = `SELECT ${STUDENT_COLS} FROM students s LEFT JOIN schools sc ON sc.id = s.school_id
           JOIN guardians g ON g.student_id = s.id AND g.user_id = ?
           WHERE s.archived = 0 ORDER BY s.first_name`;
    binds = [user.id];
  }
  const { results } = await db.prepare(sql).bind(...binds).all<Student>();
  return results;
}

export type Access = "admin" | "staff" | "guardian";

/** How the user relates to a student, or null when they may not see it. */
export async function studentAccess(user: User, studentId: number): Promise<Access | null> {
  if (user.role === "admin") return "admin";
  const db = getDB();
  const staff = await db
    .prepare("SELECT 1 AS ok FROM student_staff WHERE student_id = ? AND user_id = ?")
    .bind(studentId, user.id)
    .first();
  if (staff && user.role === "teacher") return "staff";
  const guardian = await db
    .prepare(
      `SELECT 1 AS ok FROM guardians g JOIN students s ON s.id = g.student_id
        WHERE g.student_id = ? AND g.user_id = ? AND s.archived = 0`
    )
    .bind(studentId, user.id)
    .first();
  return guardian ? "guardian" : null;
}

export const canEdit = (access: Access | null) => access === "admin" || access === "staff";

export async function getStudent(id: number): Promise<Student | null> {
  return getDB()
    .prepare(`SELECT ${STUDENT_COLS} FROM students s LEFT JOIN schools sc ON sc.id = s.school_id WHERE s.id = ?`)
    .bind(id)
    .first<Student>();
}

const UPDATE_COLS = `up.id, up.student_id, up.author_id, u.name AS author_name, u.email AS author_email,
  u.role AS author_role, up.category, up.body, up.visibility, up.created_at`;

export async function listUpdates(studentId: number, access: Access): Promise<UpdateRow[]> {
  const parentsOnly = access === "guardian" ? "AND up.visibility = 'parents'" : "";
  const { results } = await getDB()
    .prepare(
      `SELECT ${UPDATE_COLS} FROM updates up JOIN users u ON u.id = up.author_id
        WHERE up.student_id = ? ${parentsOnly} ORDER BY up.created_at DESC, up.id DESC LIMIT 200`
    )
    .bind(studentId)
    .all<UpdateRow>();
  return results;
}

export async function listComments(updateIds: number[]): Promise<CommentRow[]> {
  if (updateIds.length === 0) return [];
  const { results } = await getDB()
    .prepare(
      `SELECT c.id, c.update_id, c.author_id, u.name AS author_name, u.email AS author_email,
              u.role AS author_role, c.body, c.created_at
         FROM update_comments c JOIN users u ON u.id = c.author_id
        WHERE c.update_id IN (${updateIds.map(() => "?").join(",")})
        ORDER BY c.created_at, c.id`
    )
    .bind(...updateIds)
    .all<CommentRow>();
  return results;
}

/** Latest updates across every student the user can see, for the dashboard feed. */
export async function recentUpdates(user: User, limit = 10): Promise<(UpdateRow & Pick<Student, "first_name" | "last_initial">)[]> {
  const students = await listStudents(user);
  if (students.length === 0) return [];
  const ids = students.map((s) => s.id);
  const parentsOnly = user.role === "parent" ? "AND up.visibility = 'parents'" : "";
  const { results } = await getDB()
    .prepare(
      `SELECT ${UPDATE_COLS}, s.first_name, s.last_initial
         FROM updates up JOIN users u ON u.id = up.author_id JOIN students s ON s.id = up.student_id
        WHERE up.student_id IN (${ids.map(() => "?").join(",")}) ${parentsOnly}
        ORDER BY up.created_at DESC, up.id DESC LIMIT ?`
    )
    .bind(...ids, limit)
    .all<UpdateRow & Pick<Student, "first_name" | "last_initial">>();
  return results;
}

export async function listSchools(): Promise<School[]> {
  const { results } = await getDB().prepare("SELECT id, name, board FROM schools ORDER BY name").all<School>();
  return results;
}

export function formatDate(sqlDate: string): string {
  // D1 datetime('now') is UTC without a zone suffix
  const d = new Date(sqlDate.includes("T") ? sqlDate : sqlDate.replace(" ", "T") + "Z");
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Toronto" });
}
