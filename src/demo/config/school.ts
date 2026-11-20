import type { SchoolConfig } from "../types";

// White-label configuration. To rename the demo for another school, copy an
// entry, change it, and open /demo?school=<key> (only keys listed here work).

export const ELEMENTARY_SUBJECTS = [
  "Language",
  "Mathematics",
  "Science and Technology",
  "Social Studies / History and Geography",
  "French",
  "Health and Physical Education",
  "The Arts",
];

export const SECONDARY_COURSES = [
  { code: "ENG1D", name: "English, Grade 9" },
  { code: "MTH1W", name: "Mathematics, Grade 9" },
  { code: "SNC1W", name: "Science, Grade 9" },
  { code: "CGC1W", name: "Exploring Canadian Geography, Grade 9" },
  { code: "ENG2D", name: "English, Grade 10" },
  { code: "MPM2D", name: "Principles of Mathematics, Grade 10" },
  { code: "SNC2D", name: "Science, Grade 10" },
  { code: "CHC2D", name: "Canadian History since World War I, Grade 10" },
  { code: "CHV2O", name: "Civics and Citizenship, Grade 10" },
  { code: "GLC2O", name: "Career Studies, Grade 10" },
  { code: "ENG3U", name: "English, Grade 11" },
  { code: "MCR3U", name: "Functions, Grade 11" },
  { code: "SBI3U", name: "Biology, Grade 11" },
  { code: "ENG4U", name: "English, Grade 12" },
  { code: "MHF4U", name: "Advanced Functions, Grade 12" },
  { code: "MAP4C", name: "Foundations for College Mathematics, Grade 12" },
];

export const SCHOOL_COURSES = ["Quran", "Arabic", "Islamic Studies"];

export const SCHOOLS: Record<string, SchoolConfig> = {
  gla: {
    key: "gla",
    name: "Gibraltar Leadership Academy",
    shortName: "GLA",
    crestInitials: "GLA",
    accentColor: "#0E9C92",
    locationLabel: "Scarborough, Ontario",
    gradeRangeLabel: "JK to Grade 12",
    enrolment: 300,
    programCapacity: 20,
    averageTuition: 5000,
    separateClassesFromGrade: 4,
    sameGenderSupport: true,
    eqaoParticipation: false,
    calendarNotes: [
      "Eid al-Fitr and Eid al-Adha are school closures and do not count as school days.",
      "Ramadan runs on a modified timetable.",
      "Elementary reports in two terms; secondary is semestered.",
    ],
    elementarySubjects: ELEMENTARY_SUBJECTS,
    secondaryCourses: SECONDARY_COURSES,
    schoolCourses: SCHOOL_COURSES,
  },
  sample: {
    key: "sample",
    name: "Northfield Academy",
    shortName: "Northfield",
    crestInitials: "NA",
    accentColor: "#4B2E91",
    locationLabel: "Ontario",
    gradeRangeLabel: "JK to Grade 12",
    enrolment: 300,
    programCapacity: 20,
    averageTuition: 5000,
    separateClassesFromGrade: null,
    sameGenderSupport: false,
    eqaoParticipation: false,
    calendarNotes: ["Elementary reports in two terms; secondary is semestered."],
    elementarySubjects: ELEMENTARY_SUBJECTS,
    secondaryCourses: SECONDARY_COURSES,
    schoolCourses: SCHOOL_COURSES,
  },
};

export const DEFAULT_SCHOOL_KEY = "gla";

/** Fixed "today" for the demo so clocks, progress data and tests are deterministic. */
export const DEMO_TODAY = "2027-01-22";

/** The child the Parent role can see. */
export const PARENT_CHILD_ID = "yusuf-a";

export function getSchool(key: string | null | undefined): SchoolConfig {
  return (key && SCHOOLS[key]) || SCHOOLS[DEFAULT_SCHOOL_KEY];
}

export function isSchoolKey(key: string | null | undefined): key is string {
  return !!key && Object.prototype.hasOwnProperty.call(SCHOOLS, key);
}
