import type { Accommodation, AssessmentRecord, GoalType, HumanResource } from "../types";
import {
  ARABIC_ACCOMMODATIONS,
  HIFZ_ACCOMMODATIONS,
  PRAYER_TRANSITION_SUPPORTS,
  QURAN_ACCOMMODATIONS,
  RAMADAN,
} from "../content/islamic";

// Reusable wording for building fictional student records. {name} is replaced
// with the student's given name and {target} with the goal target.

export interface GoalTemplate {
  measure: string;
  unit: string;
  description: string;
  parentText: string;
  /** Upper bound for generated values (e.g. 100 for percentages). */
  max?: number;
  decimals?: number;
}

export const GOAL_TEMPLATES: Record<GoalType, GoalTemplate> = {
  reading_fluency: {
    measure: "Oral reading fluency (one-minute timed reading)",
    unit: "words correct per minute",
    description: "By June, {name} will read a grade-level passage aloud at {target} words correct per minute, measured weekly with a one-minute timed reading.",
    parentText: "Reading speed and accuracy: how many words {name} reads correctly in one minute.",
  },
  on_task: {
    measure: "Interval observation during 20 minutes of independent work",
    unit: "% of intervals on task",
    description: "By June, {name} will be on task during independent work in {target}% of observed intervals, measured by a weekly 20-minute observation.",
    parentText: "Staying focused on independent work in class.",
    max: 100,
  },
  quran_recitation: {
    measure: "Lines recited with two prompts or fewer",
    unit: "lines",
    description: "By June, {name} will recite an assigned passage of {target} lines with two prompts or fewer, using an audio model for practice.",
    parentText: "Quran recitation: how many lines {name} recites smoothly with little help.",
  },
  hifz_pacing: {
    measure: "New lines memorized per week, with earlier sections secure in review",
    unit: "lines per week",
    description: "By June, {name} will memorize {target} new lines per week while keeping earlier sections secure in weekly review.",
    parentText: "Hifz: new lines memorized each week, while keeping earlier sections strong.",
  },
  arabic_reading: {
    measure: "Vowelled Arabic words read correctly in one minute",
    unit: "words correct per minute",
    description: "By June, {name} will read {target} vowelled Arabic words correctly in one minute, using enlarged text.",
    parentText: "Arabic reading: words read correctly in one minute.",
  },
  math_fluency: {
    measure: "Math facts correct in a two-minute probe",
    unit: "facts correct",
    description: "By June, {name} will answer {target} grade-level math facts correctly in a two-minute probe.",
    parentText: "Math facts: how many {name} answers correctly in two minutes.",
  },
  written_expression: {
    measure: "Correct word sequences in a timed writing prompt",
    unit: "correct word sequences",
    description: "By June, {name} will write a response with {target} correct word sequences in a timed prompt, using speech-to-text where needed.",
    parentText: "Writing: how much clear, correct writing {name} produces in a timed task.",
  },
  self_regulation: {
    measure: "Check-ins used to return to work within two minutes",
    unit: "% of opportunities",
    description: "By June, {name} will use the check-in system to return to work within two minutes in {target}% of observed opportunities.",
    parentText: "Calming down and getting back to work using a check-in routine.",
    max: 100,
  },
  social_communication: {
    measure: "Peer interactions started during structured activities",
    unit: "initiations per week",
    description: "By June, {name} will start an interaction with a peer during structured activities on {target} occasions per week.",
    parentText: "Starting conversations and play with classmates.",
  },
  speech_articulation: {
    measure: "Target sounds produced correctly in structured practice",
    unit: "% correct",
    description: "By June, {name} will produce target sounds correctly in {target}% of trials in structured practice.",
    parentText: "Saying target sounds clearly.",
    max: 100,
  },
  enrichment: {
    measure: "Independent inquiry project milestones completed",
    unit: "milestones",
    description: "By June, {name} will complete {target} milestones of an independent inquiry project, presenting findings to an authentic audience.",
    parentText: "Enrichment project: milestones {name} has completed.",
  },
  life_skills: {
    measure: "Steps of a 10-step daily routine completed independently",
    unit: "steps independent",
    description: "By June, {name} will complete {target} of 10 steps of a daily school routine independently.",
    parentText: "Daily routine: steps {name} completes on their own.",
    max: 10,
  },
  mobility: {
    measure: "Class transitions completed independently",
    unit: "% of transitions",
    description: "By June, {name} will complete {target}% of class transitions independently using the agreed route and equipment.",
    parentText: "Moving between classes independently.",
    max: 100,
  },
};

export interface Profile {
  strengths: string[];
  needs: string[];
  accommodations: Accommodation[];
  equipment: string[];
  assessments: AssessmentRecord[];
  strategies: string[];
  methods: string[];
  specialists: ("psych" | "slp" | "ot")[];
  medical: string[];
}

const instr = (text: string): Accommodation => ({ type: "instructional", text });
const env = (text: string): Accommodation => ({ type: "environmental", text });
const assess = (text: string): Accommodation => ({ type: "assessment", text });

export const PROFILES: Record<string, Profile> = {
  reading_attention: {
    strengths: ["Strong oral vocabulary", "Enjoys hands-on science", "Responds well to praise and clear routines"],
    needs: ["Decoding and reading fluency", "Sustaining attention during independent work"],
    accommodations: [instr("Chunked instructions, one step at a time"), instr("Audiobooks and read-aloud for content subjects"), env("Seat near the teacher, away from the door"), env("Movement break every 20 minutes"), assess("Tests read aloud (except where reading is assessed)"), assess("Extra time, up to 50%")],
    equipment: [],
    assessments: [
      { source: "Educational", date: "2026-11-02", summary: "SERT assessment: decoding and fluency below grade level; phonological awareness gaps.", status: "complete" },
      { source: "Psychological", date: "2027-02-10", summary: "Psychoeducational assessment requested to clarify reading and attention needs.", status: "pending" },
    ],
    strategies: ["Explicit, systematic phonics in small groups", "Repeated reading with a model", "Visual timer and task checklist"],
    methods: ["Weekly one-minute timed readings", "Interval observation", "Running records"],
    specialists: ["psych"],
    medical: [],
  },
  ld_reading: {
    strengths: ["Strong listening comprehension", "Creative ideas in discussion", "Works well with a partner"],
    needs: ["Reading fluency", "Spelling"],
    accommodations: [instr("Text-to-speech for longer readings"), instr("Graphic organizers"), env("Quiet work area for reading tasks"), assess("Extra time, up to 50%"), assess("Oral responses accepted where reading is not assessed")],
    equipment: ["Text-to-speech software"],
    assessments: [{ source: "Psychological", date: "2026-03-18", summary: "Learning disability affecting reading (decoding and fluency); average reasoning ability.", status: "complete" }],
    strategies: ["Structured literacy intervention", "Repeated reading", "Pre-teaching vocabulary"],
    methods: ["Weekly fluency probes", "Spelling inventories"],
    specialists: ["psych"],
    medical: [],
  },
  ld_writing: {
    strengths: ["Strong verbal reasoning", "Thoughtful contributions in class discussion", "Good at history and debate"],
    needs: ["Written expression: organizing and getting ideas onto the page", "Spelling and handwriting speed"],
    accommodations: [instr("Speech-to-text for written work"), instr("Graphic organizers and sentence starters"), instr("Copies of notes provided"), env("Separate setting for tests"), assess("Extra time, up to 50%"), assess("Use of speech-to-text on tests")],
    equipment: ["Laptop with speech-to-text software"],
    assessments: [{ source: "Psychological", date: "2025-05-20", summary: "Learning disability affecting written expression; strong verbal reasoning.", status: "complete" }],
    strategies: ["Explicit writing strategy instruction (plan, draft, revise)", "Speech-to-text drafting", "Writing conferences"],
    methods: ["Timed writing prompts scored for correct word sequences", "Writing rubric"],
    specialists: ["psych"],
    medical: [],
  },
  ld_math: {
    strengths: ["Strong reader", "Persistent with challenging tasks", "Organized"],
    needs: ["Math fact fluency", "Multi-step problem solving"],
    accommodations: [instr("Multiplication chart and number line"), instr("Worked examples"), env("Quiet setting for math tests"), assess("Extra time, up to 50%"), assess("Calculator where computation is not assessed")],
    equipment: [],
    assessments: [{ source: "Psychological", date: "2025-11-04", summary: "Learning disability affecting mathematics calculation and fluency.", status: "complete" }],
    strategies: ["Concrete-representational-abstract sequence", "Daily fact fluency practice"],
    methods: ["Two-minute fact probes", "Problem-solving rubric"],
    specialists: ["psych"],
    medical: [],
  },
  autism: {
    strengths: ["Excellent rote memory", "Follows visual routines well", "Deep interest in specific topics"],
    needs: ["Starting interactions with peers", "Self-regulation during changes and noisy settings"],
    accommodations: [instr("Visual schedule, including prayer and wudu routines"), instr("Advance notice of changes and transitions"), env("Quiet space available"), env("Noise-reducing headphones during assemblies"), assess("Separate, quiet setting"), assess("Instructions given one at a time with visuals")],
    equipment: ["Noise-reducing headphones", "Visual schedule board"],
    assessments: [
      { source: "Psychological", date: "2024-06-12", summary: "Diagnosis of autism spectrum disorder (external report shared by the family).", status: "complete" },
      { source: "Speech-language", date: "2026-10-15", summary: "Social communication assessment: needs support starting and maintaining interactions.", status: "complete" },
    ],
    strategies: ["Applied behaviour analysis (ABA) methods, including reinforcement and prompting", "Social stories", "Structured peer activities"],
    methods: ["Frequency counts", "Check-in data", "Observation"],
    specialists: ["slp", "ot"],
    medical: [],
  },
  speech: {
    strengths: ["Eager to participate", "Strong early numeracy", "Kind to classmates"],
    needs: ["Speech sound production", "Confidence speaking in groups"],
    accommodations: [instr("Extra wait time to respond"), instr("Visual supports for new vocabulary"), env("Small-group setting for oral tasks"), assess("Oral tasks assessed one-to-one")],
    equipment: [],
    assessments: [{ source: "Speech-language", date: "2026-09-29", summary: "Speech sound disorder affecting several sounds; language comprehension within the expected range.", status: "complete" }],
    strategies: ["Speech practice routines from the SLP", "Modelling and recasting"],
    methods: ["Probe trials", "SLP progress notes"],
    specialists: ["slp"],
    medical: [],
  },
  language: {
    strengths: ["Enjoys stories and pictures", "Good visual memory", "Follows routines"],
    needs: ["Understanding and using longer sentences", "Vocabulary"],
    accommodations: [instr("Simplified, repeated instructions"), instr("Visual supports and gestures"), env("Seat close to the speaker"), assess("Instructions rephrased as needed")],
    equipment: [],
    assessments: [{ source: "Speech-language", date: "2026-10-06", summary: "Language impairment affecting expressive and receptive language.", status: "complete" }],
    strategies: ["Vocabulary pre-teaching", "Sentence frames"],
    methods: ["Language samples", "Observation"],
    specialists: ["slp"],
    medical: [],
  },
  dhh: {
    strengths: ["Strong visual learner", "Hard-working and organized", "Good written English"],
    needs: ["Access to spoken instruction in noisy rooms", "Participation in group discussion"],
    accommodations: [instr("Captioned videos"), instr("Teacher wears the FM transmitter"), env("Preferential seating facing the teacher"), env("Reduced background noise"), assess("Written instructions for all tests")],
    equipment: ["FM system", "Hearing aids (personal)"],
    assessments: [{ source: "Educational", date: "2026-09-25", summary: "Audiology report reviewed: moderate bilateral hearing loss, uses hearing aids.", status: "complete" }],
    strategies: ["Check for understanding after instructions", "Visual summaries of discussion"],
    methods: ["Participation tracking", "Course assessments"],
    specialists: [],
    medical: ["Moderate bilateral hearing loss"],
  },
  behaviour: {
    strengths: ["Energetic and enthusiastic", "Strong at sports", "Helpful when given responsibility"],
    needs: ["Managing frustration", "Following classroom expectations during unstructured times"],
    accommodations: [instr("Clear, positively stated expectations"), instr("Choice of two tasks where possible"), env("Calm-down space"), env("Supervised transitions"), assess("Tests in short sections with breaks")],
    equipment: [],
    assessments: [{ source: "Behavioural", date: "2026-10-20", summary: "Functional behaviour assessment: behaviour linked to unstructured transitions and task avoidance.", status: "complete" }],
    strategies: ["Check-in/check-out", "Behaviour support plan", "Specific praise"],
    methods: ["Daily point sheet", "Incident tracking"],
    specialists: ["psych"],
    medical: [],
  },
  gifted: {
    strengths: ["Advanced reasoning in mathematics and science", "Reads well above grade level", "Natural leader in group work"],
    needs: ["Challenge and pace beyond the grade-level program", "Perseverance on open-ended tasks"],
    accommodations: [instr("Compacted curriculum in mathematics"), instr("Independent inquiry projects"), env("Access to enrichment group"), assess("Alternative, open-ended assessment tasks")],
    equipment: [],
    assessments: [{ source: "Psychological", date: "2026-04-14", summary: "Cognitive assessment: very superior reasoning; meets criteria for giftedness.", status: "complete" }],
    strategies: ["Curriculum compacting", "Mentored inquiry", "Mathematics contests"],
    methods: ["Project milestones", "Portfolio"],
    specialists: [],
    medical: [],
  },
  mild_id: {
    strengths: ["Friendly and social", "Follows familiar routines", "Proud of completed work"],
    needs: ["Functional literacy and numeracy", "Independence in daily routines", "Planning for life after school"],
    accommodations: [instr("Step-by-step task cards"), instr("Hands-on, real-world tasks"), env("EA support for transitions"), assess("Alternative assessment of functional skills")],
    equipment: ["Task cards", "Visual timer"],
    assessments: [{ source: "Psychological", date: "2024-02-08", summary: "Mild intellectual disability; adaptive skills a relative strength.", status: "complete" }],
    strategies: ["Task analysis", "Community-based learning", "Explicit modelling"],
    methods: ["Task analysis data", "Observation"],
    specialists: ["psych"],
    medical: [],
  },
  dd: {
    strengths: ["Warm and affectionate", "Enjoys music and recitation", "Responds to routine"],
    needs: ["Communication", "Self-care routines", "Fine motor skills"],
    accommodations: [instr("Picture communication supports"), instr("Hand-over-hand prompting, faded over time"), env("EA support throughout the day"), env("Quiet space"), assess("Alternative assessment through observation")],
    equipment: ["Picture communication board", "Adapted pencil grips"],
    assessments: [
      { source: "Psychological", date: "2023-05-30", summary: "Developmental disability.", status: "complete" },
      { source: "Occupational therapy", date: "2026-10-01", summary: "Fine motor and self-care needs; recommends adapted tools.", status: "complete" },
    ],
    strategies: ["Task analysis", "Visual supports", "Errorless learning"],
    methods: ["Task analysis data", "Observation checklists"],
    specialists: ["ot", "slp"],
    medical: [],
  },
  low_vision: {
    strengths: ["Excellent listening skills", "Strong memory", "Independent and determined"],
    needs: ["Access to print and diagrams", "Orientation in new spaces"],
    accommodations: [instr("Enlarged print and digital copies of all materials"), instr("Verbal description of diagrams"), env("Preferential seating and lighting"), assess("Large-print or digital tests"), assess("Extra time, up to 50%")],
    equipment: ["Screen reader and magnification software", "Tablet"],
    assessments: [{ source: "Educational", date: "2026-09-18", summary: "Vision report reviewed: low vision; benefits from magnification and screen reader.", status: "complete" }],
    strategies: ["Pre-teaching layouts of new spaces", "Digital materials in advance"],
    methods: ["Course assessments", "Observation"],
    specialists: ["ot"],
    medical: ["Low vision"],
  },
  physical: {
    strengths: ["Strong academic skills", "Mature and articulate", "Advocates for own needs"],
    needs: ["Physical access around the building", "Fatigue across the day"],
    accommodations: [instr("Notes provided"), env("Accessible routes and elevator access"), env("Extra time for transitions"), assess("Scribe or speech-to-text for longer written tasks"), assess("Rest breaks")],
    equipment: ["Wheelchair (personal)", "Laptop"],
    assessments: [{ source: "Occupational therapy", date: "2026-09-22", summary: "Physical disability affecting mobility and fine motor endurance.", status: "complete" }],
    strategies: ["Planned transition times", "Assistive technology for writing"],
    methods: ["Course assessments", "Transition log"],
    specialists: ["ot"],
    medical: ["Physical disability (mobility)"],
  },
  multiple: {
    strengths: ["Strong visual memory", "Enjoys computers", "Calm with familiar adults"],
    needs: ["Communication", "Functional academics", "Coping with change"],
    accommodations: [instr("Visual schedule, including prayer routines"), instr("Simplified language with visuals"), env("EA support throughout the day"), env("Quiet space"), assess("Alternative assessment of functional skills")],
    equipment: ["Tablet with communication app", "Visual schedule"],
    assessments: [
      { source: "Psychological", date: "2025-03-11", summary: "Autism with mild intellectual disability.", status: "complete" },
      { source: "Speech-language", date: "2026-10-08", summary: "Uses short phrases; benefits from a communication app.", status: "complete" },
    ],
    strategies: ["ABA methods", "Visual supports", "Task analysis"],
    methods: ["Frequency counts", "Task analysis data"],
    specialists: ["slp", "ot", "psych"],
    medical: [],
  },
  tier1: {
    strengths: [],
    needs: [],
    accommodations: [],
    equipment: [],
    assessments: [],
    strategies: [],
    methods: [],
    specialists: [],
    medical: [],
  },
};

export const SCHOOL_COURSE_ACCOMMODATIONS: Record<string, string[]> = {
  Quran: QURAN_ACCOMMODATIONS,
  Hifz: HIFZ_ACCOMMODATIONS,
  Arabic: ARABIC_ACCOMMODATIONS,
};

export { PRAYER_TRANSITION_SUPPORTS, RAMADAN };

export const SPECIALIST_SERVICES: Record<"psych" | "slp" | "ot", HumanResource> = {
  psych: { service: "Educational psychologist consultation", startDate: "2026-09-08", frequency: "As scheduled, about monthly", location: "School" },
  slp: { service: "Speech-language therapy", startDate: "2026-09-21", frequency: "Weekly, 30 minutes", location: "Resource room" },
  ot: { service: "Occupational therapy", startDate: "2026-09-28", frequency: "Every second week, 45 minutes", location: "School" },
};
