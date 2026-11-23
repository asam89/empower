import type { Student } from "../types";
import { buildStudent, type GoalSpec, type StudentSpec } from "./build";

// 28 fictional students: a program cohort of 20 (7 Tier 3, 13 Tier 2) and 8
// Tier 1 students outside the cohort (3 on the waitlist). Given name plus last
// initial only; parent contacts use 555-01xx numbers and example.com.

const FALL = "2026-09-21";
const OCT = "2026-10-05";
const LATE_OCT = "2026-10-19";
const NOV = "2026-11-02";

const iv = (what: string, staffId: string, frequency: string, minutes: number): GoalSpec["intervention"] => ({ what, staffId, frequency, minutes });

const SPECS: StudentSpec[] = [
  // ---- Spotlight 1 ----
  {
    id: "yusuf-a",
    name: "Yusuf A.",
    gender: "m",
    grade: 3,
    age: 8,
    tier: 2,
    tierChange: 3,
    inCohort: true,
    spotlight: true,
    homeroomTeacherId: "t-13",
    stage: "iep_in_development",
    flaggedBy: "Fall screening",
    exceptionality: null,
    profile: "reading_attention",
    character: ["kindness", "perseverance", "gratitude"],
    subjectStatus: { Language: "MOD", Quran: "MOD" },
    goals: [
      { type: "reading_fluency", subject: "Language", baseline: 42, target: 75, start: OCT, interventionStart: "2026-11-09", trend: "up", intervention: iv("Small-group structured phonics and repeated reading", "sert-f", "4 times a week", 30) },
      { type: "on_task", subject: "Language", baseline: 45, target: 75, start: OCT, interventionStart: "2026-11-09", trend: "slow", intervention: iv("Visual timer, task checklist and check-ins", "sert-f", "Daily", 10) },
      { type: "quran_recitation", subject: "Quran", baseline: 3, target: 8, start: OCT, interventionStart: "2026-11-16", trend: "up", intervention: iv("Shorter passages with an audio model for practice", "quran-m", "3 times a week", 15) },
    ],
    referrals: [{ id: "yusuf-a-r1", to: "Educational Psychologist", requestedDate: "2026-11-16", status: "scheduled", scheduledDate: "2027-02-10" }],
    iep: { status: "in_development", placementDate: "2026-12-07" },
    screening: [
      { window: "fall", measure: "Reading screener", score: 24, threshold: 40 },
      { window: "winter", measure: "Reading screener", score: 33, threshold: 40 },
    ],
    transitionPlan: {
      goals: ["Yusuf moves to Grade 4 in September 2027, including the change to a separate boys' class, with his reading supports in place."],
      actions: [
        { action: "Share the IEP and reading strategies with the Grade 4 teacher", responsible: "SERT (Faisal O.)", timeline: "June 2027" },
        { action: "Visit the Grade 4 boys' classroom and meet the teacher", responsible: "Homeroom teacher and family", timeline: "June 2027" },
        { action: "Hand over from the girls'/primary SERT to the boys' sections SERT", responsible: "Rania A. and Faisal O.", timeline: "June 2027" },
      ],
    },
    meetings: [
      { id: "yusuf-a-m1", date: "2026-11-05", time: "15:30", title: "Parent conversation about fall screening", withParent: true, status: "held" },
      { id: "yusuf-a-m2", date: "2026-12-07", time: "15:30", title: "Meeting to start the IEP", withParent: true, status: "held" },
      { id: "yusuf-a-m3", date: "2027-01-28", time: "15:30", title: "IEP meeting (draft review)", withParent: true, status: "upcoming", notes: "Scheduled after Dhuhr." },
      { id: "yusuf-a-m4", date: "2027-02-10", time: "09:00", title: "Psychoeducational assessment, session 1", withParent: false, status: "upcoming" },
    ],
    messages: [
      { id: "yusuf-a-msg1", date: "2027-01-11", from: "sert", text: "Salaam. Yusuf is enjoying the reading group. He read two new books this week and was proud to show the class." },
      { id: "yusuf-a-msg2", date: "2027-01-12", from: "parent", text: "Jazakum Allahu khayran. He told us about the books. Can we have the recitation audio for home?" },
      { id: "yusuf-a-msg3", date: "2027-01-12", from: "sert", text: "Of course. The Quran teacher has added the audio to his folder in the parent hub." },
    ],
    parents: [
      { name: "Amina A.", relationship: "Mother", language: "ar", channel: "both" },
      { name: "Tariq A.", relationship: "Father", language: "en", channel: "sms" },
    ],
    summary: {
      en: "Yusuf is working on three goals this term. His reading has been getting faster since the reading group started in November, and he is staying focused on his own work for longer. In Quran class he recites shorter passages and practises with an audio recording. At home, reading together for 10 minutes a day and listening to the recording will help.",
      ar: "يعمل يوسف هذا الفصل على ثلاثة أهداف. أصبحت قراءته أسرع منذ أن بدأت مجموعة القراءة في نوفمبر، وأصبح يركّز على عمله المستقل لفترات أطول. في حصة القرآن يتلو مقاطع أقصر ويتدرّب بتسجيل صوتي. في البيت، تساعده القراءة معكم عشر دقائق يومياً والاستماع إلى التسجيل.",
      ur: "یوسف اس ٹرم میں تین اہداف پر کام کر رہا ہے۔ نومبر میں ریڈنگ گروپ شروع ہونے کے بعد سے اس کی پڑھائی تیز ہو گئی ہے، اور وہ اپنے کام پر زیادہ دیر توجہ دیتا ہے۔ قرآن کی کلاس میں وہ چھوٹے حصے پڑھتا ہے اور آڈیو ریکارڈنگ سے مشق کرتا ہے۔ گھر پر روزانہ دس منٹ ساتھ پڑھنا اور ریکارڈنگ سننا مددگار ہوگا۔",
    },
  },
  // ---- Spotlight 2 ----
  {
    id: "hana-k",
    name: "Hana K.",
    gender: "f",
    grade: 6,
    age: 11,
    tier: 3,
    inCohort: true,
    spotlight: true,
    homeroomTeacherId: "t-46g",
    stage: "iep_in_place",
    flaggedBy: "Parent request",
    exceptionality: { category: "Communication", definition: "Autism" },
    profile: "autism",
    hifzTrack: true,
    character: ["responsibility", "honesty", "patience"],
    subjectStatus: { "Health and Physical Education": "MOD" },
    alternativePrograms: ["Social skills (alternative program)"],
    goals: [
      { type: "social_communication", subject: "Social skills (alternative program)", baseline: 1, target: 5, start: FALL, interventionStart: "2026-10-05", trend: "slow", intervention: iv("Structured peer activities with social stories (ABA methods)", "slp", "Weekly with SLP, daily practice with EA", 20) },
      { type: "self_regulation", subject: "Health and Physical Education", baseline: 40, target: 80, start: FALL, interventionStart: "2026-10-05", trend: "up", intervention: iv("Check-in system with a visual feelings scale", "sert-f", "Daily", 10) },
      { type: "hifz_pacing", subject: "Quran", baseline: 3, target: 6, start: FALL, trend: "up", intervention: iv("Chunked memorization targets with a repetition schedule", "quran-f", "Daily hifz period", 30) },
    ],
    extraAccommodations: [
      { type: "environmental", text: "Prayer transitions: quiet space available after prayer before returning to class" },
      { type: "instructional", text: "Hifz: chunked targets measured in lines, with an audio model" },
    ],
    transitionPlan: {
      goals: ["Hana manages daily transitions (classes, prayer, assemblies) with minimal adult prompting.", "Hana moves to Grade 7 with her hifz pacing and communication supports in place."],
      actions: [
        { action: "Fade adult prompts for prayer and wudu transitions using the visual schedule (ABA prompting hierarchy, PPM 140)", responsible: "EA (Salma Y.) and SERT (Rania A.)", timeline: "January to June 2027" },
        { action: "Social story about the move to Grade 7 and a visit to the new classroom", responsible: "SERT and homeroom teacher", timeline: "May to June 2027" },
        { action: "Share data on what works with the Grade 7 team", responsible: "SERT", timeline: "June 2027" },
      ],
    },
    parents: [{ name: "Sara K.", relationship: "Mother", language: "en", channel: "email" }, { name: "Omar K.", relationship: "Father", language: "ur", channel: "sms" }],
  },
  // ---- Spotlight 3 ----
  {
    id: "zayd-r",
    name: "Zayd R.",
    gender: "m",
    grade: 10,
    age: 15,
    tier: 2,
    inCohort: true,
    spotlight: true,
    homeroomTeacherId: "t-eng",
    stage: "iep_in_place",
    flaggedBy: "Teacher referral",
    exceptionality: { category: "Communication", definition: "Learning disability" },
    profile: "ld_writing",
    character: ["leadership", "respect", "courage"],
    goals: [
      { type: "written_expression", subject: "ENG2D", baseline: 18, target: 40, start: FALL, interventionStart: "2026-10-05", trend: "up", revision: { date: "2026-11-27", note: "Target raised from 35 to 40 correct word sequences at the progress review, after strong gains with speech-to-text." }, intervention: iv("Plan-draft-revise strategy instruction with speech-to-text", "sert-m", "3 times a week", 30) },
      { type: "arabic_reading", subject: "Arabic", baseline: 28, target: 40, start: OCT, trend: "flat", intervention: iv("Enlarged vowelled text and paired reading", "arabic", "Twice a week", 15) },
    ],
    extraAccommodations: [{ type: "assessment", text: "Ramadan: assessment timing planned with the family" }],
    transitionPlan: {
      goals: ["Zayd earns the OSSD and plans for a university program in history or political science.", "Zayd requests his accommodations independently in every course."],
      actions: [
        { action: "Course selection for Grade 11 with university pathway courses", responsible: "Guidance counsellor (Sana V.)", timeline: "February 2027" },
        { action: "Self-advocacy practice: explain speech-to-text and extra time to new teachers", responsible: "SERT (Faisal O.) and Zayd", timeline: "Start of Semester 2" },
        { action: "Research university accessibility services and documentation requirements", responsible: "Zayd and family, with guidance", timeline: "By June 2027" },
        { action: "Schedule Semester 2 assessments outside the Ramadan afternoon slots", responsible: "Subject teachers and SERT", timeline: "February to March 2027" },
      ],
    },
    meetings: [
      { id: "zayd-r-m1", date: "2026-10-08", time: "16:00", title: "IEP meeting", withParent: true, status: "held" },
      { id: "zayd-r-m2", date: "2026-11-27", time: "14:00", title: "Progress review: writing goal revised", withParent: true, status: "held" },
      { id: "zayd-r-m3", date: "2027-02-02", time: "15:30", title: "Plan assessment timing for Ramadan with the family", withParent: true, status: "upcoming" },
      { id: "zayd-r-m4", date: "2027-02-04", time: "15:30", title: "Semester 2 IEP review", withParent: true, status: "upcoming" },
    ],
    iep: { completionDate: "2026-10-08" },
    parents: [{ name: "Huda R.", relationship: "Mother", language: "en" }],
  },
  // ---- Spotlight 4 ----
  {
    id: "ibrahim-s",
    name: "Ibrahim S.",
    gender: "m",
    grade: 7,
    age: 12,
    tier: 2,
    inCohort: true,
    spotlight: true,
    homeroomTeacherId: "t-78b",
    stage: "iep_in_place",
    flaggedBy: "Teacher referral",
    exceptionality: { category: "Intellectual", definition: "Giftedness" },
    profile: "gifted",
    character: ["leadership", "responsibility", "courage"],
    subjectStatus: { Mathematics: "MOD" },
    goals: [
      { type: "enrichment", subject: "Mathematics", baseline: 0, target: 6, start: FALL, trend: "up", intervention: iv("Mentored inquiry project in mathematics", "sert-m", "Weekly", 45) },
      { type: "on_task", subject: "Science and Technology", baseline: 55, target: 85, start: OCT, trend: "slow", intervention: iv("Goal setting and self-monitoring on open-ended tasks", "sert-m", "Weekly check-in", 15) },
    ],
    transitionPlan: {
      goals: ["Ibrahim enters Grade 9 in September 2028 on a pathway toward AP courses in mathematics and science."],
      actions: [
        { action: "Map a Grade 9 to 12 course plan that leads to AP Calculus and AP Physics", responsible: "Guidance counsellor and SERT", timeline: "Spring 2027, reviewed in Grade 8" },
        { action: "Join the secondary mathematics contest club as a guest", responsible: "Mathematics teacher", timeline: "From February 2027" },
        { action: "Leadership role: peer tutor in the Grade 5 mathematics club", responsible: "Homeroom teacher", timeline: "Term 2" },
      ],
    },
    parents: [{ name: "Fatima S.", relationship: "Mother", language: "en" }, { name: "Ali S.", relationship: "Father", language: "en", channel: "email" }],
  },
  // ---- Rest of the cohort ----
  {
    id: "maryam-h", name: "Maryam H.", gender: "f", grade: 1, age: 6, tier: 3, inCohort: true, homeroomTeacherId: "t-13", stage: "iep_in_place", flaggedBy: "Parent request",
    exceptionality: { category: "Communication", definition: "Speech impairment" }, profile: "speech", character: ["kindness", "courage"],
    subjectStatus: { Language: "MOD" },
    goals: [
      { type: "speech_articulation", subject: "Language", baseline: 35, target: 80, start: FALL, trend: "up", intervention: iv("Speech practice routine from the SLP", "slp", "Weekly with SLP, daily practice", 15) },
      { type: "reading_fluency", subject: "Language", baseline: 8, target: 30, start: LATE_OCT, trend: "slow", intervention: iv("Small-group phonics", "sert-f", "4 times a week", 20) },
    ],
    parents: [{ name: "Khadija H.", relationship: "Mother", language: "ur" }],
  },
  {
    id: "adam-n", name: "Adam N.", gender: "m", grade: 0, age: 5, tier: 3, inCohort: true, homeroomTeacherId: "t-k", stage: "iep_in_place", flaggedBy: "Fall screening",
    exceptionality: { category: "Communication", definition: "Language impairment" }, profile: "language", character: ["kindness", "teamwork"],
    subjectStatus: { "Kindergarten Program": "MOD" },
    goals: [
      { type: "social_communication", subject: "Kindergarten Program", baseline: 1, target: 6, start: FALL, trend: "slow", intervention: iv("Language-rich play groups", "slp", "Weekly with SLP", 30) },
      { type: "life_skills", subject: "Kindergarten Program", baseline: 3, target: 9, start: OCT, trend: "up", intervention: iv("Visual routine cards for arrival and snack", "ea-m", "Daily", 10) },
    ],
    parents: [{ name: "Rana N.", relationship: "Mother", language: "ar" }],
  },
  {
    id: "aisha-m", name: "Aisha M.", gender: "f", grade: 4, age: 9, tier: 2, inCohort: true, homeroomTeacherId: "t-46g", stage: "iep_in_place", flaggedBy: "Fall screening",
    exceptionality: { category: "Communication", definition: "Learning disability" }, profile: "ld_reading", character: ["teamwork", "gratitude"],
    subjectStatus: { Language: "MOD", Arabic: "MOD" },
    goals: [
      { type: "reading_fluency", subject: "Language", baseline: 55, target: 95, start: FALL, trend: "up", intervention: iv("Structured literacy group", "sert-f", "4 times a week", 30) },
      { type: "arabic_reading", subject: "Arabic", baseline: 12, target: 30, start: OCT, trend: "slow", intervention: iv("Enlarged vowelled text and letter cards", "arabic", "Twice a week", 15) },
    ],
    parents: [{ name: "Noura M.", relationship: "Mother", language: "en" }],
  },
  {
    id: "omar-f", name: "Omar F.", gender: "m", grade: 5, age: 10, tier: 3, inCohort: true, homeroomTeacherId: "t-46b", stage: "iep_in_place", flaggedBy: "Teacher referral",
    exceptionality: { category: "Behaviour" }, profile: "behaviour", character: ["leadership", "courage"],
    subjectStatus: { "Health and Physical Education": "MOD" },
    goals: [
      { type: "self_regulation", subject: "Health and Physical Education", baseline: 30, target: 75, start: FALL, interventionStart: "2026-10-19", trend: "up", intervention: iv("Check-in/check-out with a daily point sheet", "sert-m", "Daily", 10) },
      { type: "on_task", subject: "Mathematics", baseline: 40, target: 70, start: OCT, trend: "flat", intervention: iv("Choice of two tasks and planned movement breaks", "ea-m", "Daily", 5) },
    ],
    referrals: [{ id: "omar-f-r1", to: "Educational Psychologist", requestedDate: "2026-09-28", status: "complete" }],
    parents: [{ name: "Layla F.", relationship: "Mother", language: "ar" }, { name: "Hassan F.", relationship: "Father", language: "ar", channel: "sms" }],
  },
  {
    id: "layla-b", name: "Layla B.", gender: "f", grade: 2, age: 7, tier: 2, inCohort: true, homeroomTeacherId: "t-13", stage: "iep_in_development", flaggedBy: "Fall screening",
    exceptionality: null, profile: "reading_attention", character: ["kindness", "honesty"],
    subjectStatus: { Language: "MOD" },
    goals: [
      { type: "reading_fluency", subject: "Language", baseline: 22, target: 55, start: OCT, trend: "flat", intervention: iv("Small-group phonics", "sert-f", "3 times a week", 20) },
      { type: "on_task", subject: "Mathematics", baseline: 50, target: 75, start: LATE_OCT, trend: "slow", intervention: iv("Visual timer and seating change", "t-13", "Daily", 5) },
    ],
    referrals: [{ id: "layla-b-r1", to: "Educational Psychologist", requestedDate: "2026-12-01", status: "waiting" }],
    iep: { status: "in_development", placementDate: "2026-11-16" },
    parents: [{ name: "Mariam B.", relationship: "Mother", language: "en" }],
  },
  {
    id: "bilal-d", name: "Bilal D.", gender: "m", grade: 8, age: 13, tier: 2, inCohort: true, homeroomTeacherId: "t-78b", stage: "iep_in_place", flaggedBy: "Teacher referral",
    exceptionality: { category: "Communication", definition: "Learning disability" }, profile: "ld_math", character: ["perseverance", "respect"],
    subjectStatus: { Mathematics: "MOD" },
    goals: [
      { type: "math_fluency", subject: "Mathematics", baseline: 18, target: 40, start: FALL, trend: "up", intervention: iv("Daily fact fluency practice (CRA sequence)", "sert-m", "Daily", 15) },
      { type: "on_task", subject: "Mathematics", baseline: 60, target: 85, start: OCT, trend: "slow", intervention: iv("Worked examples and self-monitoring", "t-78b", "Daily", 5) },
    ],
    parents: [{ name: "Samira D.", relationship: "Mother", language: "ur" }],
  },
  {
    id: "noor-j", name: "Noor J.", gender: "f", grade: 9, age: 14, tier: 2, inCohort: true, homeroomTeacherId: "t-eng", stage: "iep_in_place", flaggedBy: "Parent request",
    exceptionality: { category: "Communication", definition: "Deaf and hard-of-hearing" }, profile: "dhh", character: ["perseverance", "responsibility"],
    goals: [
      { type: "on_task", subject: "ENG1D", baseline: 65, target: 90, start: FALL, trend: "up", intervention: iv("FM system and visual summaries of discussion", "t-eng", "Every class", 5) },
      { type: "hifz_pacing", subject: "Quran", baseline: 4, target: 6, start: OCT, trend: "slow", intervention: iv("Written text alongside recitation", "quran-f", "Daily", 20) },
    ],
    parents: [{ name: "Rahma J.", relationship: "Mother", language: "en", channel: "email" }],
  },
  {
    id: "idris-t", name: "Idris T.", gender: "m", grade: 11, age: 16, tier: 3, inCohort: true, homeroomTeacherId: "t-math", stage: "iep_in_place", flaggedBy: "Teacher referral",
    exceptionality: { category: "Intellectual", definition: "Mild intellectual disability" }, profile: "mild_id", character: ["kindness", "gratitude", "teamwork"],
    diploma: "OSSC", subjectStatus: { ENG3U: "MOD" }, alternativePrograms: ["Life and employment skills (alternative program)"],
    goals: [
      { type: "life_skills", subject: "Life and employment skills (alternative program)", baseline: 4, target: 9, start: FALL, trend: "up", intervention: iv("Task analysis for a school-store job routine", "ea-m", "Daily", 30) },
      { type: "reading_fluency", subject: "ENG3U", baseline: 48, target: 70, start: OCT, trend: "slow", intervention: iv("Functional reading of schedules and signs", "sert-m", "3 times a week", 30) },
    ],
    transitionPlan: {
      goals: ["Idris works toward the OSSC and a supported work placement after secondary school."],
      actions: [
        { action: "Co-op placement in the school store", responsible: "SERT (Faisal O.)", timeline: "Semester 2" },
        { action: "Connect the family with adult developmental services", responsible: "Guidance counsellor", timeline: "By June 2027" },
        { action: "Practise travel planning for a familiar route", responsible: "EA (Kareem B.) and family", timeline: "Ongoing" },
      ],
    },
    parents: [{ name: "Zainab T.", relationship: "Mother", language: "ur" }],
  },
  {
    id: "sara-q", name: "Sara Q.", gender: "f", grade: 12, age: 17, tier: 2, inCohort: true, homeroomTeacherId: "t-eng", stage: "review", flaggedBy: "Teacher referral",
    exceptionality: { category: "Communication", definition: "Learning disability" }, profile: "ld_reading", character: ["leadership", "perseverance"],
    goals: [
      { type: "reading_fluency", subject: "ENG4U", baseline: 120, target: 150, start: FALL, trend: "up", intervention: iv("Text-to-speech and pre-reading strategies", "sert-f", "Twice a week", 30) },
      { type: "written_expression", subject: "ENG4U", baseline: 45, target: 60, start: OCT, trend: "slow", intervention: iv("Essay planning templates", "t-eng", "Weekly", 20) },
    ],
    transitionPlan: {
      goals: ["Sara graduates with the OSSD and enters a college nursing program with accommodations."],
      actions: [
        { action: "Submit college applications and accessibility documentation", responsible: "Sara and guidance counsellor", timeline: "February 2027" },
        { action: "Register with the college accessibility office", responsible: "Sara, with SERT support", timeline: "By May 2027" },
      ],
    },
    parents: [{ name: "Maha Q.", relationship: "Mother", language: "en", channel: "email" }],
  },
  {
    id: "hamza-w", name: "Hamza W.", gender: "m", grade: 9, age: 14, tier: 3, inCohort: true, homeroomTeacherId: "t-math", stage: "iep_in_place", flaggedBy: "Parent request",
    exceptionality: { category: "Multiple" }, profile: "multiple", character: ["honesty", "patience"],
    diploma: "Certificate of Accomplishment", subjectStatus: { MTH1W: "MOD", ENG1D: "MOD" }, alternativePrograms: ["Communication and social skills (alternative program)"],
    goals: [
      { type: "social_communication", subject: "Communication and social skills (alternative program)", baseline: 0, target: 4, start: FALL, trend: "slow", intervention: iv("Communication app with peer partner (ABA methods)", "slp", "Weekly with SLP, daily with EA", 20) },
      { type: "math_fluency", subject: "MTH1W", baseline: 8, target: 20, start: OCT, trend: "flat", intervention: iv("Functional money and time tasks", "ea-m", "Daily", 20) },
      { type: "life_skills", subject: "ENG1D", baseline: 3, target: 8, start: OCT, trend: "up", intervention: iv("Visual schedule for the school day", "ea-m", "Daily", 10) },
    ],
    parents: [{ name: "Asma W.", relationship: "Mother", language: "ar" }, { name: "Yasin W.", relationship: "Father", language: "en", channel: "sms" }],
  },
  {
    id: "fatima-z", name: "Fatima Z.", gender: "f", grade: 11, age: 16, tier: 2, inCohort: true, homeroomTeacherId: "t-hist", stage: "iep_in_place", flaggedBy: "Parent request",
    exceptionality: { category: "Physical", definition: "Blind and low vision" }, profile: "low_vision", character: ["courage", "responsibility"],
    goals: [
      { type: "mobility", subject: "SBI3U", baseline: 50, target: 90, start: FALL, trend: "up", intervention: iv("Orientation practice for lab and new rooms", "ot", "Every second week", 45) },
      { type: "reading_fluency", subject: "ENG3U", baseline: 90, target: 130, start: OCT, trend: "slow", intervention: iv("Screen reader speed training", "sert-f", "Twice a week", 20) },
    ],
    parents: [{ name: "Iman Z.", relationship: "Mother", language: "en" }],
  },
  {
    id: "ali-p", name: "Ali P.", gender: "m", grade: 4, age: 9, tier: 2, inCohort: true, homeroomTeacherId: "t-46b", stage: "iep_in_place", flaggedBy: "Teacher referral",
    exceptionality: { category: "Behaviour" }, profile: "behaviour", character: ["kindness", "teamwork"],
    goals: [
      { type: "self_regulation", subject: "Health and Physical Education", baseline: 45, target: 80, start: FALL, trend: "up", intervention: iv("Check-in/check-out", "sert-m", "Daily", 10) },
      { type: "on_task", subject: "Language", baseline: 55, target: 80, start: LATE_OCT, trend: "slow", intervention: iv("Specific praise and task chunking", "t-46b", "Daily", 5) },
    ],
    parents: [{ name: "Hiba P.", relationship: "Mother", language: "ur", channel: "sms" }],
  },
  {
    id: "zainab-l", name: "Zainab L.", gender: "f", grade: 7, age: 12, tier: 2, inCohort: true, homeroomTeacherId: "t-78g", stage: "iep_in_place", flaggedBy: "Fall screening",
    exceptionality: { category: "Communication", definition: "Language impairment" }, profile: "language", character: ["gratitude", "patience"],
    subjectStatus: { Language: "MOD" },
    goals: [
      { type: "written_expression", subject: "Language", baseline: 20, target: 38, start: FALL, trend: "up", intervention: iv("Sentence frames and vocabulary pre-teaching", "sert-f", "3 times a week", 30) },
      { type: "social_communication", subject: "Language", baseline: 2, target: 5, start: NOV, trend: "slow", intervention: iv("Structured group discussion roles", "slp", "Weekly", 30) },
    ],
    parents: [{ name: "Ruqayya L.", relationship: "Mother", language: "ar" }],
  },
  {
    id: "musa-e", name: "Musa E.", gender: "m", grade: 6, age: 11, tier: 3, inCohort: true, homeroomTeacherId: "t-46b", stage: "iep_in_place", flaggedBy: "Parent request",
    exceptionality: { category: "Intellectual", definition: "Developmental disability" }, profile: "dd", character: ["kindness", "gratitude"],
    subjectStatus: { Language: "MOD", Mathematics: "MOD", Quran: "MOD" }, alternativePrograms: ["Self-care routines (alternative program)"],
    goals: [
      { type: "life_skills", subject: "Self-care routines (alternative program)", baseline: 2, target: 7, start: FALL, trend: "up", intervention: iv("Task analysis with picture supports", "ea-m", "Daily", 20) },
      { type: "quran_recitation", subject: "Quran", baseline: 1, target: 4, start: OCT, trend: "up", intervention: iv("Audio model and one-to-one recitation", "quran-m", "Daily", 10) },
      { type: "math_fluency", subject: "Mathematics", baseline: 3, target: 10, start: OCT, trend: "flat", intervention: iv("Counting with manipulatives", "sert-m", "Daily", 15) },
    ],
    referrals: [{ id: "musa-e-r1", to: "Occupational Therapist", requestedDate: "2026-09-14", status: "complete" }],
    parents: [{ name: "Salma E.", relationship: "Mother", language: "ar" }],
  },
  {
    id: "huda-c", name: "Huda C.", gender: "f", grade: 3, age: 8, tier: 2, inCohort: true, homeroomTeacherId: "t-13", stage: "iep_in_place", flaggedBy: "Parent request",
    exceptionality: { category: "Communication", definition: "Autism" }, profile: "autism", character: ["honesty", "responsibility"],
    goals: [
      { type: "social_communication", subject: "Language", baseline: 2, target: 6, start: FALL, trend: "up", intervention: iv("Lunch bunch with structured games", "slp", "Weekly", 30) },
      { type: "self_regulation", subject: "The Arts", baseline: 55, target: 85, start: OCT, trend: "slow", intervention: iv("Noise-reducing headphones and quiet space access", "sert-f", "As needed", 10) },
    ],
    parents: [{ name: "Nadia C.", relationship: "Mother", language: "en", channel: "email" }],
  },
  {
    id: "khalid-v", name: "Khalid V.", gender: "m", grade: 12, age: 17, tier: 2, inCohort: true, homeroomTeacherId: "t-hist", stage: "iep_in_place", flaggedBy: "Parent request",
    exceptionality: { category: "Physical", definition: "Physical disability" }, profile: "physical", character: ["leadership", "perseverance"],
    goals: [
      { type: "mobility", subject: "ENG4U", baseline: 60, target: 95, start: FALL, trend: "up", intervention: iv("Planned transition times and elevator access", "ot", "Every second week review", 30) },
      { type: "written_expression", subject: "ENG4U", baseline: 50, target: 65, start: OCT, trend: "slow", intervention: iv("Speech-to-text for longer tasks", "sert-m", "Twice a week", 20) },
    ],
    transitionPlan: {
      goals: ["Khalid graduates with the OSSD and starts a university computer science program."],
      actions: [
        { action: "Arrange a campus accessibility visit", responsible: "Khalid and family, with guidance", timeline: "March 2027" },
        { action: "Prepare documentation for university accessibility services", responsible: "SERT and guidance counsellor", timeline: "By May 2027" },
      ],
    },
    parents: [{ name: "Amal V.", relationship: "Mother", language: "en" }, { name: "Bassam V.", relationship: "Father", language: "en", channel: "email" }],
  },
  // ---- Tier 1, outside the cohort ----
  {
    id: "ismail-g", name: "Ismail G.", gender: "m", grade: 2, age: 7, tier: 1, inCohort: false, waitlisted: true, homeroomTeacherId: "t-13", stage: "sert_assessment", flaggedBy: "Fall screening",
    exceptionality: null, profile: "tier1", character: ["kindness"], parents: [{ name: "Hafsa G.", relationship: "Mother" }],
    classroomStrategies: ["Daily guided reading with the classroom teacher", "Phonics review in a small group of four"],
  },
  {
    id: "ruqayya-n", name: "Ruqayya N.", gender: "f", grade: 5, age: 10, tier: 1, inCohort: false, waitlisted: true, homeroomTeacherId: "t-46g", stage: "specialist_referral", flaggedBy: "Teacher referral",
    exceptionality: null, profile: "tier1", character: ["patience"], parents: [{ name: "Dalia N.", relationship: "Mother", language: "ar" }],
    classroomStrategies: ["Visual supports for instructions", "Extra wait time"],
    referrals: [{ id: "ruqayya-n-r1", to: "Speech-Language Pathologist", requestedDate: "2026-11-23", status: "waiting" }],
  },
  {
    id: "tariq-s", name: "Tariq S.", gender: "m", grade: 9, age: 14, tier: 1, inCohort: false, waitlisted: true, homeroomTeacherId: "t-math", stage: "identification_review", flaggedBy: "Fall screening",
    exceptionality: null, profile: "tier1", character: ["respect"], parents: [{ name: "Mona S.", relationship: "Mother" }],
    classroomStrategies: ["Graphic organizers in English", "Check-ins at the start of class"],
    referrals: [{ id: "tariq-s-r1", to: "Educational Psychologist", requestedDate: "2026-11-20", status: "waiting" }],
  },
  {
    id: "amina-r", name: "Amina R.", gender: "f", grade: -1, age: 4, tier: 1, inCohort: false, homeroomTeacherId: "t-k", stage: "flagged", flaggedBy: "Fall screening",
    exceptionality: null, profile: "tier1", character: ["kindness"], parents: [{ name: "Sumaya R.", relationship: "Mother", language: "ur" }],
    classroomStrategies: ["Language-rich play centres", "Picture cues for routines"],
  },
  {
    id: "yahya-k", name: "Yahya K.", gender: "m", grade: 1, age: 6, tier: 1, inCohort: false, homeroomTeacherId: "t-13", stage: "tier1_strategies", flaggedBy: "Fall screening",
    exceptionality: null, profile: "tier1", character: ["courage"], parents: [{ name: "Rahma K.", relationship: "Mother" }],
    classroomStrategies: ["Letter-sound practice in a small group", "Decodable readers"],
  },
  {
    id: "safiya-a", name: "Safiya A.", gender: "f", grade: 4, age: 9, tier: 1, inCohort: false, homeroomTeacherId: "t-46g", stage: "tier1_strategies", flaggedBy: "Winter screening",
    exceptionality: null, profile: "tier1", character: ["teamwork"], parents: [{ name: "Laila A.", relationship: "Mother", language: "ar" }],
    classroomStrategies: ["Math manipulatives and number lines", "Partner work"],
    screening: [{ window: "winter", measure: "Math screener", score: 31, threshold: 40 }],
  },
  {
    id: "dawud-h", name: "Dawud H.", gender: "m", grade: 7, age: 12, tier: 1, inCohort: false, homeroomTeacherId: "t-78b", stage: "screening", flaggedBy: "Winter screening",
    exceptionality: null, profile: "tier1", character: ["honesty"], parents: [{ name: "Aaliyah H.", relationship: "Mother" }],
    classroomStrategies: ["Monitoring after winter screening"],
    screening: [{ window: "winter", measure: "Reading screener", score: 37, threshold: 40 }],
  },
  {
    id: "khadija-t", name: "Khadija T.", gender: "f", grade: 10, age: 15, tier: 1, inCohort: false, homeroomTeacherId: "t-hist", stage: "tier1_strategies", flaggedBy: "Teacher referral",
    exceptionality: null, profile: "tier1", character: ["responsibility"], parents: [{ name: "Saida T.", relationship: "Mother", language: "ur" }],
    classroomStrategies: ["Organizer for assignments and due dates", "Weekly check-in with the homeroom teacher"],
  },
];

export const STUDENTS: Student[] = SPECS.map(buildStudent);

export function studentById(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id);
}

export const COHORT = STUDENTS.filter((s) => s.inCohort);
export const SPOTLIGHT_IDS = ["yusuf-a", "hana-k", "zayd-r", "ibrahim-s"];
