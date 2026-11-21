import { PARENT_CHILD_ID } from "../config/school";
import { STAFF } from "../fixtures/staff";
import { STUDENTS } from "../fixtures/students";
import type { Role } from "../types";

// Who each demo role "signs in" as. Names come from the fixtures, so no new
// identities are introduced (INVARIANTS.md #1).
export interface Persona {
  role: Role;
  name: string;
  title: string;
  group: "staff" | "family";
  summary: string;
  sees: string[];
}

const staffName = (id: string) => STAFF.find((s) => s.id === id)?.name ?? "";
const child = STUDENTS.find((s) => s.id === PARENT_CHILD_ID);
const parent = child?.parents[0];

export const PERSONAS: Record<Role, Persona> = {
  principal: {
    role: "principal",
    name: staffName("principal"),
    title: "Principal",
    group: "staff",
    summary: "The whole program at a glance.",
    sees: ["Seats, tiers and goals on track", "Every student's progress", "Family requests and program value"],
  },
  sert: {
    role: "sert",
    name: staffName("sert-f"),
    title: "Special education teacher (SERT)",
    group: "staff",
    summary: "Runs the program day to day.",
    sees: ["Student profiles and progress data", "The identification pipeline", "Family requests to answer"],
  },
  teacher: {
    role: "teacher",
    name: staffName("t-13"),
    title: "Homeroom teacher",
    group: "staff",
    summary: "Supports students in class.",
    sees: ["Students' goals and strategies", "Weekly progress to log"],
  },
  parent: {
    role: "parent",
    name: parent?.name ?? "Parent",
    title: `Parent of ${child?.name.split(" ")[0] ?? "a student"}`,
    group: "family",
    summary: "Follows their child's progress.",
    sees: ["Their child's growth path", "Messages with the SERT", "Requests and concerns"],
  },
};
