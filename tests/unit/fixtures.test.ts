import { describe, expect, it } from "vitest";
import { DEMO_TODAY, getSchool } from "@/demo/config/school";
import { CALENDAR } from "@/demo/fixtures/calendar";
import { STAFF } from "@/demo/fixtures/staff";
import { COHORT, SPOTLIGHT_IDS, STUDENTS } from "@/demo/fixtures/students";
import { schoolDaysBetween } from "@/demo/lib/calendar";

const NAME = /^[A-Z][a-z]+ [A-Z]\.$/;

describe("student fixtures", () => {
  it("has a cohort of 20 (7 Tier 3, 13 Tier 2) within capacity, and 8 Tier 1 outside it", () => {
    expect(STUDENTS).toHaveLength(28);
    expect(COHORT).toHaveLength(20);
    expect(COHORT.length).toBeLessThanOrEqual(getSchool("gla").programCapacity);
    expect(COHORT.filter((s) => s.tier === 3)).toHaveLength(7);
    expect(COHORT.filter((s) => s.tier === 2)).toHaveLength(13);
    expect(COHORT.filter((s) => s.grade >= 9).length).toBeGreaterThanOrEqual(6);
    const outside = STUDENTS.filter((s) => !s.inCohort);
    expect(outside).toHaveLength(8);
    expect(outside.every((s) => s.tier === 1 && s.iep === null)).toBe(true);
    expect(STUDENTS.filter((s) => s.waitlisted)).toHaveLength(3);
    expect(STUDENTS.filter((s) => s.waitlisted).every((s) => !s.inCohort)).toBe(true);
    expect(COHORT.some((s) => s.exceptionality?.definition === "Giftedness")).toBe(true);
  });

  it("includes the four spotlight students", () => {
    const grades = SPOTLIGHT_IDS.map((id) => STUDENTS.find((s) => s.id === id)?.grade);
    expect(grades).toEqual([3, 6, 10, 7]);
  });

  it("uses fictional identities only", () => {
    const json = JSON.stringify({ STUDENTS, STAFF });
    for (const s of STUDENTS) {
      expect(s.name).toMatch(NAME);
      for (const p of s.parents) {
        expect(p.name).toMatch(NAME);
        expect(p.email).toMatch(/@example\.com$/);
        expect(p.phone).toMatch(/^\+1 \d{3} 555 01\d{2}$/);
      }
    }
    for (const m of STAFF) expect(m.name).toMatch(/^(Dr\. )?[A-Z][a-z]+ [A-Z]\.$/);
    expect(json).not.toMatch(/\b\d{1,5} [A-Z][a-z]+ (St|Street|Ave|Avenue|Rd|Road|Blvd|Drive|Dr|Cres|Crescent)\b/);
    expect(json.match(/[\w.+-]+@[\w-]+\.[\w.]+/g)?.every((e) => e.endsWith("@example.com"))).toBe(true);
  });

  it("populates every IEP section for every cohort student", () => {
    for (const s of COHORT) {
      const iep = s.iep!;
      expect(iep, s.id).not.toBeNull();
      expect(iep.assessments.length, s.id).toBeGreaterThan(0);
      expect(iep.strengths.length, s.id).toBeGreaterThan(0);
      expect(iep.needs.length, s.id).toBeGreaterThan(0);
      expect(iep.courses.length, s.id).toBeGreaterThan(0);
      expect(iep.courses.filter((c) => c.schoolDeveloped).map((c) => c.name)).toEqual(["Quran", "Arabic", "Islamic Studies"]);
      expect(iep.accommodations.map((a) => a.type)).toEqual(expect.arrayContaining(["instructional", "environmental", "assessment"]));
      expect(iep.provincialAssessments.length, s.id).toBeGreaterThan(0);
      expect(iep.programs.length, s.id).toBe(iep.courses.filter((c) => c.status !== "AC").length);
      expect(iep.transitionPlan.goals.length, s.id).toBeGreaterThan(0);
      expect(iep.transitionPlan.actions.length, s.id).toBeGreaterThan(0);
      expect(iep.humanResources.length, s.id).toBeGreaterThan(0);
      expect(iep.team.length, s.id).toBeGreaterThan(2);
      expect(iep.sourcesConsulted.length, s.id).toBeGreaterThan(0);
      expect(iep.log.length, s.id).toBeGreaterThan(0);
      if (iep.status === "complete") {
        expect(iep.completionDate, s.id).not.toBeNull();
        expect(schoolDaysBetween(iep.placementDate, iep.completionDate!, CALENDAR), s.id).toBeLessThanOrEqual(30);
        expect(iep.principalSignedDate, s.id).not.toBeNull();
        if (s.age >= 16) expect(iep.consultation.studentSignedDate, s.id).not.toBeNull();
      }
      if (s.grade >= 9) expect(iep.diploma, s.id).not.toBeNull();
    }
  });

  it("gives every cohort student 2 to 4 goals with 8 to 16 weekly points up to the demo date", () => {
    for (const s of COHORT) {
      expect(s.goals.length, s.id).toBeGreaterThanOrEqual(2);
      expect(s.goals.length, s.id).toBeLessThanOrEqual(4);
      for (const g of s.goals) {
        expect(g.points.length, g.id).toBeGreaterThanOrEqual(8);
        expect(g.points.length, g.id).toBeLessThanOrEqual(16);
        const dates = g.points.map((p) => p.date);
        expect(dates.every((d) => d <= DEMO_TODAY), g.id).toBe(true);
        expect([...dates].sort(), g.id).toEqual(dates);
      }
    }
  });

  it("has plausible, mixed progress (not every chart goes up) and one revised goal", () => {
    const changes = COHORT.flatMap((s) =>
      s.goals.map((g) => (g.points[g.points.length - 1].value - g.points[0].value) / (g.target - g.baseline))
    );
    expect(changes.some((c) => c < 0.15)).toBe(true);
    expect(changes.some((c) => c > 0.4)).toBe(true);
    expect(COHORT.flatMap((s) => s.goals).filter((g) => g.revision)).toHaveLength(1);
  });

  it("includes Quran, Arabic and hifz goals", () => {
    const types = new Set(COHORT.flatMap((s) => s.goals.map((g) => g.type)));
    for (const t of ["quran_recitation", "hifz_pacing", "arabic_reading"]) expect(types.has(t as never)).toBe(true);
  });
});
