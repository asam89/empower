import type { FamilyRequest } from "../types";
import { SPOTLIGHT_IDS } from "./students";

// Sample requests from families to the school team. Parent names come from the
// student fixtures (via parentIndex), so no new identities are introduced.
const [yusuf, hana, third, fourth] = SPOTLIGHT_IDS;

export const SEED_REQUESTS: FamilyRequest[] = [
  {
    id: "req-1",
    studentId: fourth,
    parentIndex: 0,
    kind: "schedule",
    subject: "Early pickup on Friday",
    details: "We have a medical appointment on Friday at 1:30. Could the afternoon support session move to Thursday this week?",
    date: "2027-01-22",
    status: "new",
  },
  {
    id: "req-2",
    studentId: third,
    parentIndex: 0,
    kind: "concern",
    subject: "Homework is taking a long time",
    details: "Homework has been taking over an hour most nights and it ends in tears. Can we talk about what is expected and what supports can be used at home?",
    date: "2027-01-21",
    status: "new",
  },
  {
    id: "req-3",
    studentId: hana,
    parentIndex: 0,
    kind: "meeting",
    subject: "Meeting before the hifz review",
    details: "We would like to meet with the SERT and the Quran teacher before the hifz review to plan the next targets together.",
    date: "2027-01-20",
    status: "in_progress",
    staffNote: "Booked for February 3 after Dhuhr. The Quran teacher will join.",
  },
  {
    id: "req-4",
    studentId: yusuf,
    parentIndex: 0,
    kind: "question",
    subject: "Recitation audio will not play",
    details: "The recitation audio in the parent hub does not play on my phone.",
    date: "2027-01-19",
    status: "resolved",
    staffNote: "Re-uploaded as MP3 so it plays on all phones. Thank you for letting us know.",
  },
];
