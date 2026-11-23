import { describe, expect, it } from "vitest";
import { CALENDAR } from "@/demo/fixtures/calendar";
import { SEED_REQUESTS } from "@/demo/fixtures/requests";
import { STUDENTS } from "@/demo/fixtures/students";
import { addSchoolDays } from "@/demo/lib/calendar";
import { applyEdits, emptyEdits } from "@/demo/lib/edits";
import { goalStatus, nextPointDate } from "@/demo/lib/goal-status";
import { allRequests, openRequestCount } from "@/demo/lib/requests";
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

describe("goal status", () => {
  it("reports progress toward the goal as a clamped percentage", () => {
    expect(goalStatus(goal([0, 50]), week(1), CALENDAR).percent).toBe(50);
    expect(goalStatus(goal([0, 150]), week(1), CALENDAR).percent).toBe(100);
    expect(goalStatus(goal([0, -20]), week(1), CALENDAR).percent).toBe(0);
    expect(goalStatus(goal([]), START, CALENDAR).kind).toBe("no_data");
  });

  it("flags a team review after four points below the aim line, and clears it when progress recovers", () => {
    const flat = goal([0, 1, 1, 1, 1]);
    expect(goalStatus(flat, week(4), CALENDAR).kind).toBe("review");
    const recovered = goal([0, 1, 1, 1, 1, 90]);
    expect(goalStatus(recovered, week(5), CALENDAR).kind).toBe("on_track");
  });

  it("judges points added after the demo date at their own date", () => {
    const g = goal([0, 1, 1, 1, 1]);
    const status = goalStatus(g, START, CALENDAR);
    expect(status.asOf).toBe(week(4));
    expect(status.kind).toBe("review");
  });

  it("dates the next weekly point a week after the newest point", () => {
    expect(nextPointDate(goal([0]), "2027-01-22")).toBe("2026-09-28");
    expect(nextPointDate(goal([]), "2027-01-22")).toBe("2027-01-29");
  });
});

describe("family requests and messages", () => {
  it("seed requests point at real fixture students and parents only", () => {
    for (const r of SEED_REQUESTS) {
      const student = STUDENTS.find((s) => s.id === r.studentId);
      expect(student, r.id).toBeDefined();
      expect(student!.parents[r.parentIndex], r.id).toBeDefined();
    }
    const json = JSON.stringify(SEED_REQUESTS);
    expect(json).not.toMatch(/@/);
    expect(json).not.toMatch(/\d{3}[ -]\d{3,4}/);
  });

  it("merges session requests and staff changes, newest first", () => {
    const edits = emptyEdits();
    edits.addedRequests.push({
      id: "req-new", studentId: STUDENTS[0].id, parentIndex: 0, kind: "question",
      subject: "s", details: "d", date: "2027-01-23", status: "new",
    });
    edits.requestPatches["req-1"] = { status: "resolved", staffNote: "Done" };
    const list = allRequests(edits);
    expect(list[0].id).toBe("req-new");
    expect(list.find((r) => r.id === "req-1")).toMatchObject({ status: "resolved", staffNote: "Done" });
    expect(openRequestCount(list)).toBe(openRequestCount(allRequests(emptyEdits())));
  });

  it("appends session messages to the right student only", () => {
    const edits = emptyEdits();
    const id = STUDENTS[0].id;
    edits.addedMessages[id] = [{ id: "m", date: "2027-01-22", from: "parent", text: "Hello" }];
    const out = applyEdits(STUDENTS, edits);
    expect(out[0].messages.at(-1)?.text).toBe("Hello");
    expect(out[1].messages).toEqual(STUDENTS[1].messages);
  });
});
