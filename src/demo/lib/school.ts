import type { SchoolConfig, Student } from "../types";
import { gradeLabel } from "./text";

export function homeroomLabel(student: Student, school: SchoolConfig): string {
  const grade = gradeLabel(student.grade);
  if (school.separateClassesFromGrade !== null && student.grade >= school.separateClassesFromGrade) {
    return `${grade} ${student.gender === "f" ? "girls" : "boys"}`;
  }
  return grade;
}
