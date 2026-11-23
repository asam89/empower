import type {
  Accommodation,
  AssessmentRecord,
  CourseStatus,
  Course,
  Exceptionality,
  Gender,
  Goal,
  GoalType,
  Grade,
  HumanResource,
  Iep,
  Meeting,
  Message,
  NotificationPrefs,
  Parent,
  ParentSummary,
  PipelineStage,
  ProgressPoint,
  ProvincialAssessment,
  Referral,
  ScreeningResult,
  SpecialEducationProgram,
  Student,
  Tier,
  TransitionPlan,
} from "../types";
import type { CharacterStrength } from "../content/character";
import { DEMO_TODAY, ELEMENTARY_SUBJECTS, SCHOOL_COURSES, SECONDARY_COURSES } from "../config/school";
import { addSchoolDays, bandForGrade, reportingPeriods } from "../lib/calendar";
import { seededRandom } from "../lib/rng";
import { gradeLabel } from "../lib/text";
import { CALENDAR } from "./calendar";
import {
  GOAL_TEMPLATES,
  PRAYER_TRANSITION_SUPPORTS,
  PROFILES,
  RAMADAN,
  SCHOOL_COURSE_ACCOMMODATIONS,
  SPECIALIST_SERVICES,
} from "./library";

// Builds complete fictional student records from compact specs, so every
// cohort student has every IEP section populated.

export interface GoalSpec {
  type: GoalType;
  subject: string;
  baseline: number;
  target: number;
  start: string;
  review?: string;
  interventionStart?: string;
  intervention: { what: string; staffId: string; frequency: string; minutes: number };
  trend: "up" | "slow" | "flat";
  maxPoints?: number;
  revision?: { date: string; note: string };
}

export interface ParentSpec {
  name: string;
  relationship: Parent["relationship"];
  channel?: NotificationPrefs["channel"];
  language?: NotificationPrefs["language"];
  frequency?: NotificationPrefs["frequency"];
}

export interface StudentSpec {
  id: string;
  name: string;
  gender: Gender;
  grade: Grade;
  age: number;
  tier: Tier;
  tierChange?: Tier;
  inCohort: boolean;
  waitlisted?: boolean;
  spotlight?: boolean;
  homeroomTeacherId: string;
  stage: PipelineStage;
  flaggedBy: Student["flaggedBy"];
  exceptionality: Exceptionality | null;
  profile: keyof typeof PROFILES;
  hifzTrack?: boolean;
  character: CharacterStrength[];
  goals?: GoalSpec[];
  /** MOD/ALT status by subject name or course code (default AC). */
  subjectStatus?: Record<string, CourseStatus>;
  /** Alternative programs (ALT), e.g. "Life and employment skills". */
  alternativePrograms?: string[];
  diploma?: Iep["diploma"];
  exemptions?: string;
  parents: ParentSpec[];
  summary?: ParentSummary;
  iep?: Partial<Iep>;
  referrals?: Referral[];
  meetings?: Meeting[];
  messages?: Message[];
  screening?: ScreeningResult[];
  classroomStrategies?: string[];
  transitionPlan?: TransitionPlan;
  extraAccommodations?: Accommodation[];
  extraStrengths?: string[];
  extraNeeds?: string[];
  extraAssessments?: AssessmentRecord[];
}

const DEFAULT_REVIEW = "2027-06-11";
const DEFAULT_PLACEMENT = "2026-09-08";
const SECONDARY_LOADS: Partial<Record<Grade, string[]>> = {
  9: ["ENG1D", "MTH1W", "SNC1W", "CGC1W"],
  10: ["ENG2D", "MPM2D", "SNC2D", "CHC2D"],
  11: ["ENG3U", "MCR3U", "SBI3U"],
  12: ["ENG4U", "MAP4C"],
};

let phoneCounter = 0;

function givenName(name: string): string {
  return name.split(" ")[0];
}

function fillGoalText(text: string, name: string, target: number): string {
  return text.replaceAll("{name}", name).replaceAll("{target}", String(target));
}

function round(value: number, decimals = 0): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

function buildPoints(goalId: string, spec: GoalSpec): ProgressPoint[] {
  const template = GOAL_TEMPLATES[spec.type];
  const rnd = seededRandom(goalId);
  const review = spec.review ?? DEFAULT_REVIEW;
  const maxPoints = spec.maxPoints ?? 16;
  const totalWeeks = 36;
  const slope = (spec.target - spec.baseline) / totalWeeks;
  const factor = spec.trend === "up" ? 1.9 : spec.trend === "slow" ? 1.2 : 0.08;
  const noise = Math.max(1, Math.abs(spec.target - spec.baseline) * 0.07);
  const points: ProgressPoint[] = [];
  let ivWeek = 0;
  for (let k = 0; points.length < maxPoints; k++) {
    const date = k === 0 ? spec.start : addSchoolDays(spec.start, 5 * k, CALENDAR);
    if (date > DEMO_TODAY || date > review) break;
    if (spec.interventionStart && date < spec.interventionStart) ivWeek = k + 1;
    const weeksActive = Math.max(0, k - ivWeek);
    let value = spec.baseline + weeksActive * slope * factor + (rnd() - 0.5) * 2 * noise;
    if (k === 0) value = spec.baseline;
    const max = template.max ?? Number.POSITIVE_INFINITY;
    value = Math.min(max, Math.max(0, value));
    points.push({ date, value: round(value, template.decimals ?? 0) });
  }
  return points;
}

function buildGoal(student: StudentSpec, spec: GoalSpec, index: number): Goal {
  const id = `${student.id}-g${index + 1}`;
  const template = GOAL_TEMPLATES[spec.type];
  const name = givenName(student.name);
  return {
    id,
    type: spec.type,
    subject: spec.subject,
    description: fillGoalText(template.description, name, spec.target),
    parentText: fillGoalText(template.parentText, name, spec.target),
    measure: template.measure,
    unit: template.unit,
    baseline: spec.baseline,
    target: spec.target,
    startDate: spec.start,
    reviewDate: spec.review ?? DEFAULT_REVIEW,
    points: buildPoints(id, spec),
    phaseChanges: spec.interventionStart
      ? [{ date: spec.interventionStart, label: `Intervention starts: ${spec.intervention.what}` }]
      : [],
    revision: spec.revision,
  };
}

function buildCourses(spec: StudentSpec): Course[] {
  const status = (key: string, code?: string): CourseStatus =>
    spec.subjectStatus?.[key] ?? (code ? spec.subjectStatus?.[code] : undefined) ?? "AC";
  let ministry: Course[];
  if (spec.grade <= 0) {
    ministry = [{ name: "Kindergarten Program", schoolDeveloped: false, status: status("Kindergarten Program") }];
  } else if (spec.grade <= 8) {
    ministry = ELEMENTARY_SUBJECTS.map((name) => ({ name, schoolDeveloped: false, status: status(name) }));
  } else {
    ministry = (SECONDARY_LOADS[spec.grade] ?? []).map((code) => {
      const course = SECONDARY_COURSES.find((c) => c.code === code);
      return { name: course?.name ?? code, code, schoolDeveloped: false, status: status(course?.name ?? code, code) };
    });
  }
  const alternative: Course[] = (spec.alternativePrograms ?? []).map((name) => ({
    name,
    schoolDeveloped: false,
    status: "ALT",
  }));
  const school: Course[] = SCHOOL_COURSES.map((name) => ({ name, schoolDeveloped: true, status: status(name) }));
  return [...ministry, ...alternative, ...school];
}

function buildPrograms(spec: StudentSpec, courses: Course[], goals: Goal[]): SpecialEducationProgram[] {
  const profile = PROFILES[spec.profile];
  const band = bandForGrade(spec.grade);
  const periods = reportingPeriods(band, CALENDAR);
  return courses
    .filter((c) => c.status !== "AC")
    .map((course) => {
      const goal = goals.find((g) => g.subject === course.name || g.subject === course.code);
      const label = course.code ? `${course.code} ${course.name}` : course.name;
      if (!goal) {
        return {
          subject: label,
          baseline: `Working below grade-level expectations in ${course.name}.`,
          annualGoal: `Make measurable progress on modified expectations in ${course.name}.`,
          expectations: periods.map((p) => ({ periodId: p.id, text: `Modified expectations for ${course.name}, set with the subject teacher for ${p.label}.` })),
          teachingStrategies: profile.strategies,
          assessmentMethods: profile.methods,
        };
      }
      const mid = round((goal.baseline + goal.target) / 2);
      return {
        subject: label,
        baseline: `${goal.measure}: ${goal.baseline} ${goal.unit} (${goal.startDate}).`,
        annualGoal: goal.description,
        expectations: periods.map((p, i) => ({
          periodId: p.id,
          text:
            i === 0
              ? `${goal.measure} reaches about ${mid} ${goal.unit}.`
              : `${goal.measure} reaches ${goal.target} ${goal.unit}.`,
        })),
        teachingStrategies: profile.strategies,
        assessmentMethods: profile.methods,
      };
    });
}

function buildAccommodations(spec: StudentSpec, courses: Course[]): Accommodation[] {
  const profile = PROFILES[spec.profile];
  const list: Accommodation[] = [...profile.accommodations];
  const modified = (name: string) => courses.some((c) => c.name === name && c.status !== "AC");
  if (modified("Quran")) {
    list.push(...SCHOOL_COURSE_ACCOMMODATIONS.Quran.slice(0, 2).map((text) => ({ type: "instructional" as const, text: `Quran: ${text}` })));
  }
  if (spec.hifzTrack) {
    list.push(...SCHOOL_COURSE_ACCOMMODATIONS.Hifz.slice(0, 2).map((text) => ({ type: "instructional" as const, text: `Hifz: ${text}` })));
  }
  if (modified("Arabic")) {
    list.push(...SCHOOL_COURSE_ACCOMMODATIONS.Arabic.slice(0, 2).map((text) => ({ type: "instructional" as const, text: `Arabic: ${text}` })));
  }
  if (["autism", "multiple", "dd"].includes(spec.profile)) {
    list.push(...PRAYER_TRANSITION_SUPPORTS.slice(0, 2).map((text) => ({ type: "environmental" as const, text: `Prayer transitions: ${text}` })));
  }
  if (spec.grade >= 9) {
    list.push(...RAMADAN.assessmentAccommodations.map((text) => ({ type: "assessment" as const, text: `Ramadan: ${text}` })));
  }
  list.push(...(spec.extraAccommodations ?? []));
  return list;
}

function buildProvincial(spec: StudentSpec, accommodations: Accommodation[], diploma: Iep["diploma"]): ProvincialAssessment[] {
  if (spec.grade < 9) {
    return [{ name: "EQAO", participation: "not_applicable", accommodations: [], note: "{short} does not participate in EQAO assessments." }];
  }
  if (diploma !== "OSSD") {
    return [{ name: "OSSLT", participation: "exempt", accommodations: [], note: "Not working toward the OSSD; exempt with parent consent." }];
  }
  const assessmentAccs = accommodations.filter((a) => a.type === "assessment" && !a.text.startsWith("Ramadan")).map((a) => a.text);
  if (spec.grade === 9) {
    return [{ name: "OSSLT", participation: "not_applicable", accommodations: [], note: "Writes the OSSLT in Grade 10." }];
  }
  if (spec.grade === 10) {
    return [{ name: "OSSLT", participation: "participating", accommodations: assessmentAccs, note: "Writes the OSSLT this spring with the accommodations listed." }];
  }
  return [{ name: "OSSLT", participation: "not_applicable", accommodations: [], note: "OSSLT requirement met in Grade 10." }];
}

function defaultTransition(spec: StudentSpec): TransitionPlan {
  const name = givenName(spec.name);
  if (spec.age >= 14) {
    return {
      goals: [
        `${name} plans next year's courses to match postsecondary goals.`,
        `${name} explains their own accommodations to each new teacher.`,
      ],
      actions: [
        { action: "Course planning meeting", responsible: "Guidance counsellor", timeline: "February 2027" },
        { action: "Practise a self-advocacy script for the start of the new semester", responsible: "SERT and student", timeline: "January to February 2027" },
        { action: "Explore postsecondary programs and accessibility services", responsible: "Student and family, with guidance", timeline: "By June 2027" },
      ],
    };
  }
  const next = gradeLabel((spec.grade + 1) as Grade);
  return {
    goals: [`${name} moves to ${next} in September 2027 with the same supports in place.`],
    actions: [
      { action: "Share the IEP and what works with next year's teacher", responsible: "SERT", timeline: "June 2027" },
      { action: "Visit next year's classroom and meet the teacher", responsible: "Homeroom teacher", timeline: "June 2027" },
      { action: "Use the visual schedule for daily transitions", responsible: "Teacher and SERT", timeline: "Ongoing" },
    ],
  };
}

function buildHumanResources(spec: StudentSpec): HumanResource[] {
  const list: HumanResource[] =
    spec.tier === 3
      ? [
          { service: "SERT small-group and one-to-one support", startDate: DEFAULT_PLACEMENT, frequency: "Daily, 45 minutes", location: "Resource room" },
          { service: "Educational assistant support", startDate: DEFAULT_PLACEMENT, frequency: "Daily, as scheduled", location: "Classroom" },
        ]
      : [{ service: "SERT small-group support", startDate: DEFAULT_PLACEMENT, frequency: "3 times a week, 30 minutes", location: "Resource room and in class" }];
  for (const s of PROFILES[spec.profile].specialists) list.push(SPECIALIST_SERVICES[s]);
  return list;
}

function sertFor(spec: StudentSpec): string {
  return spec.gender === "m" && spec.grade >= 4 ? "sert-m" : "sert-f";
}

function buildIep(spec: StudentSpec, goals: Goal[]): Iep {
  const profile = PROFILES[spec.profile];
  const courses = buildCourses(spec);
  const accommodations = buildAccommodations(spec, courses);
  const diploma = spec.grade >= 9 ? spec.diploma ?? "OSSD" : null;
  const status = spec.iep?.status ?? "complete";
  const placementDate = spec.iep?.placementDate ?? DEFAULT_PLACEMENT;
  const completionDate = status === "complete" ? spec.iep?.completionDate ?? addSchoolDays(placementDate, 22, CALENDAR) : null;
  const identified = spec.exceptionality !== null;
  const team = ["principal", sertFor(spec), spec.homeroomTeacherId, "lead", ...profile.specialists];
  if (spec.grade >= 9) team.push("guidance");
  const sources = ["Parents/guardians", "Provincial report card", ...(identified ? ["Identification review statement of decision"] : []), ...(spec.age >= 12 ? ["Student"] : []), ...(profile.medical.length ? ["Health and medical reports"] : []), ...(placementDate === DEFAULT_PLACEMENT ? ["Previous IEP"] : [])];
  const log =
    status === "complete"
      ? [
          { date: "2026-09-17", activity: "Phone call to review last year's plan and family priorities", source: "Parent", outcome: "Priorities recorded for the IEP" },
          { date: completionDate as string, activity: "IEP meeting", source: "Parent, SERT, homeroom teacher", outcome: "IEP reviewed; copy sent home" },
          { date: "2026-11-27", activity: "Staff review after the first progress report", source: "SERT, teachers", outcome: "Goals continued; accommodations confirmed" },
        ]
      : [{ date: placementDate, activity: "Meeting to start the IEP", source: "Parent, SERT", outcome: "Family priorities and strengths recorded" }];
  const studentSigns = spec.age >= 16 && status === "complete";
  return {
    status,
    reason: identified ? "identified" : "not_identified",
    placementDecision: spec.tier === 3 ? "Regular class with withdrawal assistance" : "Regular class with resource assistance",
    lastReviewDate: identified ? "2026-06-10" : null,
    assessments: [...profile.assessments, ...(spec.extraAssessments ?? [])],
    medicalConditions: profile.medical,
    healthSupport: [],
    strengths: [...profile.strengths, ...(spec.extraStrengths ?? [])],
    needs: [...profile.needs, ...(spec.extraNeeds ?? [])],
    courses,
    exemptions: spec.exemptions ?? null,
    diploma,
    reportFormat: "Provincial Report Card",
    accommodations,
    equipment: profile.equipment,
    provincialAssessments: buildProvincial(spec, accommodations, diploma),
    programs: buildPrograms(spec, courses, goals),
    transitionPlan: spec.transitionPlan ?? defaultTransition(spec),
    humanResources: buildHumanResources(spec),
    team,
    sourcesConsulted: sources,
    placementDate,
    completionDate,
    log,
    principalSignedDate: status === "complete" ? completionDate : null,
    consultation: {
      parent: "consulted",
      parentReceivedCopy: status === "complete",
      studentConsulted: spec.age >= 12,
      studentReceivedCopy: studentSigns,
      studentSignedDate: studentSigns ? completionDate : null,
      parentSignedDate: status === "complete" ? completionDate : null,
    },
    ...spec.iep,
  };
}

function buildParents(spec: StudentSpec): Parent[] {
  return spec.parents.map((p, i) => {
    const nn = String(phoneCounter++).padStart(2, "0");
    return {
      id: `${spec.id}-p${i + 1}`,
      name: p.name,
      relationship: p.relationship,
      phone: `+1 416 555 01${nn}`,
      email: `${givenName(p.name).toLowerCase()}.${spec.id}@example.com`,
      prefs: { channel: p.channel ?? "both", language: p.language ?? "en", frequency: p.frequency ?? "weekly" },
    };
  });
}

function defaultMeetings(spec: StudentSpec, iep: Iep | null): Meeting[] {
  if (!iep) {
    return [{ id: `${spec.id}-m1`, date: "2026-11-05", time: "15:30", title: "Parent conversation about screening results", withParent: true, status: "held" }];
  }
  const meetings: Meeting[] = [];
  if (iep.completionDate) {
    meetings.push({ id: `${spec.id}-m1`, date: iep.completionDate, time: "15:30", title: "IEP meeting", withParent: true, status: "held" });
  }
  meetings.push({ id: `${spec.id}-m2`, date: "2026-11-27", time: "14:00", title: "Progress review (staff)", withParent: false, status: "held" });
  meetings.push({ id: `${spec.id}-m3`, date: "2027-02-04", time: "15:30", title: bandForGrade(spec.grade) === "secondary" ? "Semester 2 IEP review" : "Term 2 IEP review", withParent: true, status: "upcoming" });
  return meetings;
}

function defaultMessages(spec: StudentSpec): Message[] {
  const name = givenName(spec.name);
  return [
    { id: `${spec.id}-msg1`, date: "2027-01-15", from: "sert", text: `Salaam. A quick update: ${name} had a good week and is using the strategies we agreed on. Please let me know if you notice anything at home.` },
    { id: `${spec.id}-msg2`, date: "2027-01-16", from: "parent", text: "Thank you for the update. We will keep practising at home." },
  ];
}

function defaultScreening(spec: StudentSpec): ScreeningResult[] {
  const rnd = seededRandom(`${spec.id}-screen`);
  const measure = spec.grade >= 9 ? "Reading and writing screener" : spec.grade <= 0 ? "Early learning screener" : "Reading screener";
  const threshold = 40;
  return [{ window: "fall", measure, score: Math.round(18 + rnd() * 18), threshold }];
}

function defaultSummary(spec: StudentSpec, goals: Goal[]): ParentSummary {
  const name = givenName(spec.name);
  if (goals.length === 0) {
    return { en: `${name}'s teacher is using classroom strategies and checking progress regularly. We will share an update at the next parent conversation.` };
  }
  const list = goals.map((g) => g.parentText.replace(/\.$/, "").toLowerCase()).join("; ");
  return { en: `${name} is working on ${goals.length} goals this term: ${list}. The team is checking progress every week and will share updates here.` };
}

export function buildStudent(spec: StudentSpec): Student {
  const goals = spec.inCohort ? (spec.goals ?? []).map((g, i) => buildGoal(spec, g, i)) : [];
  const iep = spec.inCohort ? buildIep(spec, goals) : null;
  return {
    id: spec.id,
    name: spec.name,
    gender: spec.gender,
    grade: spec.grade,
    age: spec.age,
    tier: spec.tier,
    tierChange: spec.tierChange,
    inCohort: spec.inCohort,
    waitlisted: spec.waitlisted ?? false,
    spotlight: spec.spotlight ?? false,
    homeroomTeacherId: spec.homeroomTeacherId,
    sertId: sertFor(spec),
    stage: spec.stage,
    flaggedBy: spec.flaggedBy,
    exceptionality: spec.exceptionality,
    hifzTrack: spec.hifzTrack ?? false,
    characterStrengths: spec.character,
    screening: spec.screening ?? defaultScreening(spec),
    goals,
    interventions: (spec.goals ?? [])
      .map((g, i) => ({
        id: `${spec.id}-g${i + 1}-int`,
        goalId: `${spec.id}-g${i + 1}`,
        what: g.intervention.what,
        staffId: g.intervention.staffId,
        frequency: g.intervention.frequency,
        minutes: g.intervention.minutes,
        startDate: g.interventionStart ?? g.start,
      }))
      .filter(() => spec.inCohort),
    referrals: spec.referrals ?? [],
    meetings: spec.meetings ?? defaultMeetings(spec, iep),
    messages: spec.messages ?? defaultMessages(spec),
    parents: buildParents(spec),
    parentSummary: spec.summary ?? defaultSummary(spec, goals),
    classroomStrategies: spec.classroomStrategies ?? [],
    iep,
  };
}
