import type { Grade, SchoolConfig } from "../types";

/** Fill {school} and {short} placeholders from the school config. */
export function fill(text: string, school: SchoolConfig): string {
  return text.replaceAll("{school}", school.name).replaceAll("{short}", school.shortName);
}

export function gradeLabel(grade: Grade): string {
  if (grade === -1) return "JK";
  if (grade === 0) return "SK";
  return `Grade ${grade}`;
}

export function initials(name: string): string {
  return name
    .replace(/^Dr\.\s+/, "")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .replace(/[^A-Z]/g, "")
    .slice(0, 2);
}
