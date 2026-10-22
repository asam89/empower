import { describe, expect, it } from "vitest";
import { DEMO_TODAY, getSchool } from "@/demo/config/school";
import { CALENDAR } from "@/demo/fixtures/calendar";
import { COHORT, STUDENTS } from "@/demo/fixtures/students";
import { applyEdits, emptyEdits } from "@/demo/lib/edits";
import { goalsOnTrack, needsAttention, seats, tierCounts } from "@/demo/lib/metrics";
import { isOnTrack, needsTeamReview } from "@/demo/lib/progress";

describe("dashboard metrics", () => {
  it("counts students by tier from the fixtures", () => {
    expect(tierCounts(STUDENTS)).toEqual({ 1: 8, 2: 13, 3: 7 });
    const edited = applyEdits(STUDENTS, { ...emptyEdits(), studentPatches: { "yusuf-a": { tier: 3 } } });
    expect(tierCounts(edited)).toEqual({ 1: 8, 2: 12, 3: 8 });
  });

  it("reports seats and the waitlist", () => {
    expect(seats(STUDENTS, getSchool("gla"))).toEqual({ capacity: 20, filled: 20, available: 0, waitlist: 3 });
  });

  it("computes goals on track from the aim lines", () => {
    const results = COHORT.flatMap((s) => s.goals).map((g) => isOnTrack(g, DEMO_TODAY, CALENDAR));
    const onTrack = results.filter((r) => r === true).length;
    const result = goalsOnTrack(STUDENTS, DEMO_TODAY, CALENDAR);
    expect(result.total).toBe(results.length);
    expect(result.onTrack).toBe(onTrack);
    expect(result.percent).toBe(Math.round((100 * onTrack) / results.length));
    expect(result.percent).toBeGreaterThan(40);
    expect(result.percent).toBeLessThan(90);
  });

  it("lists overdue and due-soon IEPs, flat progress and long referral waits", () => {
    const items = needsAttention(STUDENTS, DEMO_TODAY, CALENDAR);
    const has = (kind: string, id: string) => items.some((i) => i.kind === kind && i.studentId === id);
    expect(has("iep_overdue", "layla-b")).toBe(true);
    expect(has("iep_due_soon", "yusuf-a")).toBe(true);
    for (const id of ["layla-b", "ruqayya-n", "tariq-s"]) expect(has("referral_waiting", id)).toBe(true);
    const flat = COHORT.flatMap((s) => s.goals).filter((g) => needsTeamReview(g, DEMO_TODAY, CALENDAR));
    expect(items.filter((i) => i.kind === "progress_flat")).toHaveLength(flat.length);
    expect(items[0].kind).toBe("iep_overdue");
  });
});
