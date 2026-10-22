import type { StaffMember } from "../types";

// Fictional program staff. Given name plus initial only.
export const STAFF: StaffMember[] = [
  { id: "principal", name: "Nadia R.", role: "Principal", gender: "f", employer: "school" },
  { id: "vp", name: "Samir K.", role: "Vice-Principal", gender: "m", employer: "school" },
  { id: "lead", name: "Leila H.", role: "Lead Consultant (Empower)", gender: "f", employer: "empower" },
  { id: "sert-f", name: "Rania A.", role: "Embedded SERT (Empower)", gender: "f", employer: "empower", sections: "girls", detail: "JK to Grade 3 and girls' sections" },
  { id: "sert-m", name: "Faisal O.", role: "SERT (Empower)", gender: "m", employer: "empower", sections: "boys", detail: "Boys' sections, Grade 4 to 12" },
  { id: "ea-f", name: "Salma Y.", role: "Educational Assistant", gender: "f", employer: "school", sections: "girls" },
  { id: "ea-m", name: "Kareem B.", role: "Educational Assistant", gender: "m", employer: "school", sections: "boys" },
  { id: "psych", name: "Dr. Imran Q.", role: "Educational Psychologist", gender: "m", employer: "contracted", scheduledHoursPerTerm: 40 },
  { id: "slp", name: "Yasmin T.", role: "Speech-Language Pathologist", gender: "f", employer: "contracted", scheduledHoursPerTerm: 48 },
  { id: "ot", name: "Daniel W.", role: "Occupational Therapist", gender: "m", employer: "contracted", detail: "Scheduled visits every second week", scheduledHoursPerTerm: 24 },
  { id: "t-k", name: "Rabia N.", role: "Homeroom Teacher", gender: "f", employer: "school", detail: "JK and SK" },
  { id: "t-13", name: "Mona E.", role: "Homeroom Teacher", gender: "f", employer: "school", detail: "Grades 1 to 3" },
  { id: "t-46b", name: "Hassan J.", role: "Homeroom Teacher", gender: "m", employer: "school", sections: "boys", detail: "Grades 4 to 6, boys" },
  { id: "t-46g", name: "Iman S.", role: "Homeroom Teacher", gender: "f", employer: "school", sections: "girls", detail: "Grades 4 to 6, girls" },
  { id: "t-78b", name: "Karim D.", role: "Homeroom Teacher", gender: "m", employer: "school", sections: "boys", detail: "Grades 7 and 8, boys" },
  { id: "t-78g", name: "Lina F.", role: "Homeroom Teacher", gender: "f", employer: "school", sections: "girls", detail: "Grades 7 and 8, girls" },
  { id: "t-eng", name: "Michael D.", role: "Subject Teacher", gender: "m", employer: "school", detail: "English, Grades 9 to 12" },
  { id: "t-hist", name: "Hiba L.", role: "Subject Teacher", gender: "f", employer: "school", detail: "History and Civics, Grades 9 to 12" },
  { id: "t-math", name: "Ahmed Z.", role: "Subject Teacher", gender: "m", employer: "school", detail: "Mathematics, Grades 9 to 12" },
  { id: "quran-m", name: "Abdullah F.", role: "Quran Teacher", gender: "m", employer: "school", sections: "boys" },
  { id: "quran-f", name: "Zahra W.", role: "Quran Teacher", gender: "f", employer: "school", sections: "girls" },
  { id: "arabic", name: "Dina M.", role: "Arabic Teacher", gender: "f", employer: "school" },
  { id: "islamic", name: "Bashir N.", role: "Islamic Studies Teacher", gender: "m", employer: "school" },
  { id: "guidance", name: "Sana V.", role: "Guidance Counsellor", gender: "f", employer: "school", detail: "Secondary" },
];

export function staffById(id: string): StaffMember | undefined {
  return STAFF.find((s) => s.id === id);
}
