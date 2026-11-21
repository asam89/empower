import { describe, expect, it } from "vitest";
import { DEMO_TODAY } from "@/demo/config/school";
import { CALENDAR } from "@/demo/fixtures/calendar";
import { studentById } from "@/demo/fixtures/students";
import { iepClock } from "@/demo/lib/iep-rules";

describe("30 school day IEP clock", () => {
  it("shows Yusuf's IEP due soon and Layla's overdue at the demo date", () => {
    expect(iepClock(studentById("yusuf-a")!.iep!, DEMO_TODAY, CALENDAR)).toEqual({ dueDate: "2027-02-01", remaining: 6, status: "due_soon" });
    expect(iepClock(studentById("layla-b")!.iep!, DEMO_TODAY, CALENDAR)).toEqual({ dueDate: "2027-01-11", remaining: -9, status: "overdue" });
    expect(iepClock(studentById("hana-k")!.iep!, DEMO_TODAY, CALENDAR).status).toBe("complete");
  });

  it("skips Eid closures when computing the due date", () => {
    const iep = { ...studentById("yusuf-a")!.iep!, placementDate: "2027-03-01" };
    expect(iepClock(iep, "2027-03-01", CALENDAR).dueDate).toBe("2027-04-22");
  });
});
