import { describe, expect, it } from "vitest";
import { CALENDAR } from "@/demo/fixtures/calendar";
import { addSchoolDays } from "@/demo/lib/calendar";
import { aimValue, isOnTrack, needsTeamReview } from "@/demo/lib/progress";
import type { Goal } from "@/demo/types";

const START = "2026-09-21";
const week = (k: number) => (k === 0 ? START : addSchoolDays(START, 5 * k, CALENDAR));

function goal(values: number[], baseline = 0, target = 100): Goal {
  return {
    id: "g", type: "reading_fluency", subject: "Language", description: "", parentText: "", measure: "m", unit: "u",
    baseline, target, startDate: START, reviewDate: "2027-06-11",
    points: values.map((value, k) => ({ date: week(k), value })), phaseChanges: [],
  };
}

describe("aim line and decision rule", () => {
  it("runs from the baseline at the start to the target at the review date", () => {
    const g = goal([0]);
    expect(aimValue(g, START, CALENDAR)).toBe(0);
    expect(aimValue(g, "2027-06-11", CALENDAR)).toBe(100);
    const mid = aimValue(g, week(10), CALENDAR);
    expect(mid).toBeGreaterThan(20);
    expect(mid).toBeLessThan(40);
  });

  it("flags a team review after four consecutive points below the aim line", () => {
    const below4 = goal([0, 1, 1, 1, 1]);
    expect(needsTeamReview(below4, week(4), CALENDAR)).toBe(true);
    const below3 = goal([0, 50, 1, 1, 1]);
    expect(needsTeamReview(below3, week(4), CALENDAR)).toBe(false);
    expect(isOnTrack(below3, week(1), CALENDAR)).toBe(true);
    expect(isOnTrack(below3, week(4), CALENDAR)).toBe(false);
  });

  it("handles goals where a lower value is better", () => {
    const g = goal([10, 10, 10, 10, 10], 10, 0);
    expect(needsTeamReview(g, week(4), CALENDAR)).toBe(true);
    const improving = goal([10, 2, 2, 2, 2], 10, 0);
    expect(needsTeamReview(improving, week(4), CALENDAR)).toBe(false);
  });
});
