// Types for the fictional demo fixtures. IEP sections follow the order of the
// Ontario sample IEP template (Ministry of Education, 2022).

export type Role = "principal" | "sert" | "teacher" | "parent";
export type Tier = 1 | 2 | 3;
export type Gender = "f" | "m";
export type Band = "elementary" | "secondary";
/** -1 = JK, 0 = SK, 1..12 = grades. */
export type Grade = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ExceptionalityCategory = "Behaviour" | "Communication" | "Intellectual" | "Physical" | "Multiple";

export interface Exceptionality {
  category: ExceptionalityCategory;
  /** Ontario definition within the category, e.g. "Autism", "Learning disability", "Giftedness". */
  definition?: string;
}

export interface SecondaryCourse {
  code: string;
  name: string;
}

export interface SchoolConfig {
  key: string;
  name: string;
  shortName: string;
  crestInitials: string;
  accentColor: string;
  locationLabel: string;
  gradeRangeLabel: string;
  /** Illustrative total enrolment. */
  enrolment: number;
  programCapacity: number;
  /** Illustrative average annual tuition, used only by the value calculator. */
  averageTuition: number;
  /** Grade from which boys and girls are in separate classes; null = mixed classes throughout. */
  separateClassesFromGrade: number | null;
  /** Assign same-gender SERT/EA support where the school requests it. */
  sameGenderSupport: boolean;
  /** Whether the school participates in EQAO elementary assessments. */
  eqaoParticipation: boolean;
  calendarNotes: string[];
  elementarySubjects: string[];
  secondaryCourses: SecondaryCourse[];
  /** School-developed courses offered at every grade (not Ministry courses). */
  schoolCourses: string[];
}

export type ClosureKind = "holiday" | "eid" | "break" | "pa_day";

export interface Closure {
  start: string;
  /** Inclusive; omitted for single-day closures. */
  end?: string;
  label: string;
  kind: ClosureKind;
  approximate?: boolean;
}

export interface ReportingPeriod {
  id: string;
  label: string;
  band: Band;
  start: string;
  end: string;
}

export interface SchoolCalendar {
  schoolYear: string;
  firstDay: string;
  lastDay: string;
  closures: Closure[];
  ramadan: { start: string; end: string; approximate: boolean };
  reportingPeriods: ReportingPeriod[];
  fallScreening: { start: string; end: string };
  winterScreening: { start: string; end: string };
}

export type StaffRole =
  | "Principal"
  | "Vice-Principal"
  | "Lead Consultant (Empower)"
  | "Embedded SERT (Empower)"
  | "SERT (Empower)"
  | "Educational Assistant"
  | "Educational Psychologist"
  | "Speech-Language Pathologist"
  | "Occupational Therapist"
  | "Homeroom Teacher"
  | "Subject Teacher"
  | "Quran Teacher"
  | "Arabic Teacher"
  | "Islamic Studies Teacher"
  | "Guidance Counsellor";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  gender: Gender;
  employer: "school" | "empower" | "contracted";
  /** Which sections the staff member supports when same-gender support is on. */
  sections?: "girls" | "boys" | "all";
  detail?: string;
  /** Specialist time on a schedule (hours per term). */
  scheduledHoursPerTerm?: number;
}

export type CourseStatus = "AC" | "MOD" | "ALT";

export interface Course {
  name: string;
  /** Ministry course code (secondary only). */
  code?: string;
  /** School-developed course (Quran, Arabic, Islamic Studies), not a Ministry course. */
  schoolDeveloped: boolean;
  status: CourseStatus;
}

export type AccommodationType = "instructional" | "environmental" | "assessment";

export interface Accommodation {
  type: AccommodationType;
  text: string;
}

export interface LearningExpectation {
  periodId: string;
  text: string;
}

/** IEP section 8: one entry per MOD or ALT subject. */
export interface SpecialEducationProgram {
  subject: string;
  baseline: string;
  annualGoal: string;
  expectations: LearningExpectation[];
  teachingStrategies: string[];
  assessmentMethods: string[];
}

export type AssessmentSource =
  | "Educational"
  | "Psychological"
  | "Speech-language"
  | "Occupational therapy"
  | "Behavioural";

export interface AssessmentRecord {
  source: AssessmentSource;
  date: string;
  summary: string;
  status: "complete" | "pending";
}

export interface TransitionAction {
  action: string;
  responsible: string;
  timeline: string;
}

export interface TransitionPlan {
  goals: string[];
  actions: TransitionAction[];
}

export interface HumanResource {
  service: string;
  startDate: string;
  frequency: string;
  location: string;
}

export interface ConsultationLogEntry {
  date: string;
  activity: string;
  source: string;
  outcome: string;
}

export interface ProvincialAssessment {
  name: string;
  participation: "participating" | "exempt" | "deferred" | "not_applicable";
  accommodations: string[];
  note?: string;
}

export interface IepConsultation {
  parent: "consulted" | "declined";
  parentReceivedCopy: boolean;
  studentConsulted: boolean;
  studentReceivedCopy: boolean;
  /** Required at 16 and over (demo signature only). */
  studentSignedDate: string | null;
  parentSignedDate: string | null;
}

export interface Iep {
  status: "in_development" | "complete";
  // 1. Reason for developing the IEP
  reason: "identified" | "not_identified";
  // 2. Student profile
  placementDecision: string;
  lastReviewDate: string | null;
  // 3. Assessment data
  assessments: AssessmentRecord[];
  medicalConditions: string[];
  healthSupport: string[];
  // 4. Strengths and needs
  strengths: string[];
  needs: string[];
  // 5. Subjects, courses or alternative programs
  courses: Course[];
  exemptions: string | null;
  diploma: "OSSD" | "OSSC" | "Certificate of Accomplishment" | null;
  reportFormat: "Provincial Report Card" | "Alternative Report";
  // 6. Accommodations
  accommodations: Accommodation[];
  equipment: string[];
  // 7. Provincial assessments
  provincialAssessments: ProvincialAssessment[];
  // 8. Special education program
  programs: SpecialEducationProgram[];
  // 9. Transition plan
  transitionPlan: TransitionPlan;
  // 10. Human resources
  humanResources: HumanResource[];
  // 11. IEP development team (staff ids)
  team: string[];
  // 12. Sources consulted, placement and completion dates
  sourcesConsulted: string[];
  placementDate: string;
  completionDate: string | null;
  // 13. Log of parent/student consultation and staff review/updating
  log: ConsultationLogEntry[];
  // 14. Principal's statement
  principalSignedDate: string | null;
  // 15. Parent/student consultation and signatures
  consultation: IepConsultation;
}

export type GoalType =
  | "reading_fluency"
  | "math_fluency"
  | "written_expression"
  | "on_task"
  | "self_regulation"
  | "social_communication"
  | "hifz_pacing"
  | "arabic_reading"
  | "quran_recitation"
  | "speech_articulation"
  | "enrichment"
  | "life_skills"
  | "mobility";

export interface ProgressPoint {
  date: string;
  value: number;
}

export interface PhaseChange {
  date: string;
  label: string;
}

export interface Goal {
  id: string;
  type: GoalType;
  subject: string;
  /** SMART goal statement. */
  description: string;
  /** One-sentence plain-language version for parents. */
  parentText: string;
  measure: string;
  unit: string;
  baseline: number;
  target: number;
  startDate: string;
  reviewDate: string;
  points: ProgressPoint[];
  phaseChanges: PhaseChange[];
  revision?: { date: string; note: string };
}

export interface Intervention {
  id: string;
  goalId: string;
  what: string;
  staffId: string;
  frequency: string;
  minutes: number;
  startDate: string;
}

export type PipelineStage =
  | "screening"
  | "flagged"
  | "tier1_strategies"
  | "sert_assessment"
  | "identification_review"
  | "specialist_referral"
  | "iep_in_development"
  | "iep_in_place"
  | "review";

export interface Referral {
  id: string;
  to: "Educational Psychologist" | "Speech-Language Pathologist" | "Occupational Therapist";
  requestedDate: string;
  status: "waiting" | "scheduled" | "complete";
  scheduledDate?: string;
}

export interface Meeting {
  id: string;
  date: string;
  time: string;
  title: string;
  withParent: boolean;
  status: "held" | "upcoming";
  notes?: string;
}

export interface Message {
  id: string;
  date: string;
  from: "sert" | "parent";
  text: string;
}

export interface NotificationPrefs {
  channel: "sms" | "email" | "both";
  language: "en" | "ar" | "ur";
  frequency: "weekly" | "biweekly" | "monthly";
}

export interface Parent {
  id: string;
  name: string;
  relationship: "Mother" | "Father" | "Guardian";
  /** Fictional 555-01xx numbers only. */
  phone: string;
  /** example.com addresses only. */
  email: string;
  prefs: NotificationPrefs;
}

export interface ParentSummary {
  en: string;
  /** Sample translations, to be reviewed by a fluent speaker before any real use. */
  ar?: string;
  ur?: string;
}

export interface ScreeningResult {
  window: "fall" | "winter";
  measure: string;
  score: number;
  threshold: number;
}

export interface Student {
  id: string;
  /** Given name plus last initial only. */
  name: string;
  gender: Gender;
  grade: Grade;
  /** Age at the demo date, used by the 14+ transition and 16+ signature rules. */
  age: number;
  tier: Tier;
  /** Tier the team is considering moving the student to. */
  tierChange?: Tier;
  inCohort: boolean;
  waitlisted: boolean;
  spotlight: boolean;
  homeroomTeacherId: string;
  sertId: string;
  stage: PipelineStage;
  flaggedBy: "Fall screening" | "Winter screening" | "Teacher referral" | "Parent request";
  exceptionality: Exceptionality | null;
  hifzTrack: boolean;
  characterStrengths: string[];
  screening: ScreeningResult[];
  goals: Goal[];
  interventions: Intervention[];
  referrals: Referral[];
  meetings: Meeting[];
  messages: Message[];
  parents: Parent[];
  parentSummary: ParentSummary;
  /** Classroom strategies for Tier 1 students outside the cohort. */
  classroomStrategies: string[];
  iep: Iep | null;
}

export interface ScreeningCompletion {
  grade: Grade;
  enrolled: number;
  fallScreened: number;
  winterScreened: number;
}

export interface PdSession {
  date: string;
  title: string;
  attendees: number;
}

export interface ProgramMetrics {
  screening: ScreeningCompletion[];
  pdSessions: PdSession[];
  staffTrained: number;
  /** Specialist hours used this term, keyed by staff id. */
  specialistHoursUsed: Record<string, number>;
  /** Parent hub views per week (sample data). */
  parentPortalViews: { weekOf: string; views: number }[];
}
