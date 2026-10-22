import { describe, expect, it } from "vitest";
import { CALENDAR } from "@/demo/fixtures/calendar";
import { addSchoolDays, isSchoolDay, reportingPeriodFor, schoolDaysBetween } from "@/demo/lib/calendar";

const NO_EID = { ...CALENDAR, closures: CALENDAR.closures.filter((c) => c.kind !== "eid") };

describe("school calendar", () => {
  it("skips weekends, holidays, breaks and Eid closures", () => {
    expect(isSchoolDay("2026-09-08", CALENDAR)).toBe(true);
    expect(isSchoolDay("2026-09-12", CALENDAR)).toBe(false); // Saturday
    expect(isSchoolDay("2026-10-12", CALENDAR)).toBe(false); // Thanksgiving
    expect(isSchoolDay("2026-12-28", CALENDAR)).toBe(false); // winter break
    expect(isSchoolDay("2027-03-10", CALENDAR)).toBe(false); // Eid al-Fitr
    expect(isSchoolDay("2027-05-18", CALENDAR)).toBe(false); // Eid al-Adha
    expect(isSchoolDay("2026-09-04", CALENDAR)).toBe(false); // before the first day
  });

  it("counts school days between two dates", () => {
    expect(schoolDaysBetween("2027-03-08", "2027-03-12", CALENDAR)).toBe(2);
    expect(schoolDaysBetween("2027-03-08", "2027-03-12", NO_EID)).toBe(4);
    expect(schoolDaysBetween("2026-12-07", "2027-01-22", CALENDAR)).toBe(24);
  });

  it("computes the 30 school day IEP deadline, skipping Eid", () => {
    expect(addSchoolDays("2026-12-07", 30, CALENDAR)).toBe("2027-02-01");
    expect(addSchoolDays("2027-03-01", 30, CALENDAR)).toBe("2027-04-22");
    expect(addSchoolDays("2027-03-01", 30, NO_EID)).toBe("2027-04-20");
  });

  it("rejects deadlines outside the school year", () => {
    expect(() => addSchoolDays("2027-06-01", 30, CALENDAR)).toThrow();
  });

  it("finds the reporting period for each band", () => {
    expect(reportingPeriodFor("2027-01-22", "elementary", CALENDAR)?.id).toBe("t1");
    expect(reportingPeriodFor("2027-02-03", "secondary", CALENDAR)?.id).toBe("s2");
  });
});
