// All wording for the program's Islamic elements, in one place so the school's
// Islamic Studies staff can review it without touching components.
// These are program and scheduling elements only. The demo never gives
// religious rulings or advice. {school} and {short} are filled from the school config.

export const ISLAMIC_CONTENT_STATUS = "Draft wording for review by {short} Islamic Studies staff.";

export const SCHOOL_COURSE_NOTES: Record<string, string> = {
  Quran: "School-developed course: recitation (tilawah) and memorization (hifz). Not a Ministry course.",
  Arabic: "School-developed course: reading, writing and speaking Arabic. Not a Ministry course.",
  "Islamic Studies": "School-developed course. Not a Ministry course.",
};

export const SCHOOL_DAY = {
  dhuhr: { label: "Dhuhr prayer", time: "12:30", minutes: 20 },
  jumuah: { label: "Jumu'ah (Friday)", time: "12:45", minutes: 40 },
  wuduRoutine: ["Walk to the wudu area", "Wudu", "Line up for prayer", "Prayer", "Return to class"],
};

export const PRAYER_TRANSITION_SUPPORTS = [
  "Five-minute and two-minute warnings before the prayer transition",
  "Visual schedule card for the wudu and prayer routine",
  "Option to line up first or last to avoid crowding",
  "Quiet space available after prayer before returning to class",
  "Staff member walks with the student during the transition",
];

export const QURAN_ACCOMMODATIONS = [
  "Reduced passage length for recitation assessments",
  "Audio model of the passage available for practice at school and home",
  "Recitation assessed one-to-one rather than in front of the class",
  "Extra time to prepare before recitation",
];

export const HIFZ_ACCOMMODATIONS = [
  "Memorization targets chunked into small sections (lines rather than pages)",
  "Structured repetition schedule with daily review of earlier sections",
  "Audio model for each new section",
  "Weekly targets agreed with the Quran teacher and family",
];

export const ARABIC_ACCOMMODATIONS = [
  "Enlarged, fully vowelled text for reading",
  "Letter and word cards with visual cues",
  "Oral responses accepted in place of written responses where appropriate",
];

export const RAMADAN = {
  termSetting: "Modified Ramadan timetable: shortened periods and an earlier dismissal.",
  assessmentAccommodations: [
    "Tests and major assessments scheduled earlier in the school day",
    "Extended time on assessments",
    "Rest breaks during longer assessments",
  ],
  familyNote: "Assessment timing during Ramadan is planned with the family.",
};

export const EID_NOTE = "Eid closures count as non-school days in the 30 school day IEP clock and in reporting.";

export const FAMILY_PARTNERSHIP = {
  meetingNote: "Parent meetings are scheduled around prayer times.",
  translationNote: "Sample translation. To be reviewed by a fluent speaker before any real use.",
};

export const GENDER_CONFIGURATION_NOTE =
  "Mixed classes to Grade 3; separate boys' and girls' classes from Grade 4. Same-gender SERT and EA support is assigned where the school requests it.";

export const NO_RULINGS_NOTE = "This demo describes program and scheduling elements only and does not give religious rulings or advice.";
