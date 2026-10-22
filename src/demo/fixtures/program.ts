import type { Grade, ProgramMetrics } from "../types";

// Program-level sample data. Totals that can be derived from student fixtures
// (tiers, IEPs, goals, referrals, meetings) are computed, not stored here.

const ENROLLED: [Grade, number][] = [
  [-1, 22], [0, 22], [1, 24], [2, 24], [3, 24], [4, 24], [5, 22],
  [6, 22], [7, 22], [8, 22], [9, 20], [10, 18], [11, 18], [12, 16],
];

export const PROGRAM: ProgramMetrics = {
  screening: ENROLLED.map(([grade, enrolled]) => ({
    grade,
    enrolled,
    fallScreened: grade === -1 ? enrolled - 2 : enrolled,
    winterScreened: grade >= 9 ? Math.round(enrolled * 0.5) : Math.round(enrolled * 0.75),
  })),
  pdSessions: [
    { date: "2026-08-31", title: "Tiered support and the identification pipeline", attendees: 34 },
    { date: "2026-09-25", title: "Writing SMART IEP goals", attendees: 28 },
    { date: "2026-10-23", title: "Accommodations in Quran, Arabic and Islamic Studies", attendees: 22 },
    { date: "2026-11-13", title: "Progress monitoring and decision rules", attendees: 30 },
    { date: "2027-01-15", title: "Supporting students with autism through daily transitions", attendees: 26 },
  ],
  staffTrained: 36,
  specialistHoursUsed: { psych: 31, slp: 39, ot: 16 },
  parentPortalViews: [
    { weekOf: "2026-11-30", views: 41 },
    { weekOf: "2026-12-07", views: 48 },
    { weekOf: "2026-12-14", views: 52 },
    { weekOf: "2027-01-04", views: 46 },
    { weekOf: "2027-01-11", views: 57 },
    { weekOf: "2027-01-18", views: 61 },
  ],
};
