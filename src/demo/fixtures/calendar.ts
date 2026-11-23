import type { SchoolCalendar } from "../types";

// 2026–2027 demo calendar. Eid and Ramadan dates are approximate (they depend on
// the lunar calendar) and should be confirmed with the school.
export const CALENDAR: SchoolCalendar = {
  schoolYear: "2026–2027",
  firstDay: "2026-09-08",
  lastDay: "2027-06-25",
  closures: [
    { start: "2026-10-12", label: "Thanksgiving", kind: "holiday" },
    { start: "2026-11-13", label: "PA day", kind: "pa_day" },
    { start: "2026-12-21", end: "2027-01-01", label: "Winter break", kind: "break" },
    { start: "2027-02-15", label: "Family Day", kind: "holiday" },
    { start: "2027-03-10", end: "2027-03-11", label: "Eid al-Fitr", kind: "eid", approximate: true },
    { start: "2027-03-15", end: "2027-03-19", label: "March break", kind: "break" },
    { start: "2027-03-26", label: "Good Friday", kind: "holiday" },
    { start: "2027-05-17", end: "2027-05-18", label: "Eid al-Adha", kind: "eid", approximate: true },
    { start: "2027-05-24", label: "Victoria Day", kind: "holiday" },
  ],
  ramadan: { start: "2027-02-08", end: "2027-03-09", approximate: true },
  reportingPeriods: [
    { id: "t1", label: "Term 1", band: "elementary", start: "2026-09-08", end: "2027-01-29" },
    { id: "t2", label: "Term 2", band: "elementary", start: "2027-02-01", end: "2027-06-25" },
    { id: "s1", label: "Semester 1", band: "secondary", start: "2026-09-08", end: "2027-01-29" },
    { id: "s2", label: "Semester 2", band: "secondary", start: "2027-02-01", end: "2027-06-25" },
  ],
  fallScreening: { start: "2026-09-21", end: "2026-10-09" },
  winterScreening: { start: "2027-01-11", end: "2027-01-29" },
};
