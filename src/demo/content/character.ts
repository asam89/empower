// Character and leadership strengths, in plain values language that staff can edit.

export const CHARACTER_STRENGTHS: Record<string, string> = {
  responsibility: "Takes care of their work and belongings, and follows through on jobs.",
  kindness: "Notices when others need help and offers it.",
  perseverance: "Keeps trying when work is hard.",
  honesty: "Tells the truth, even when it is difficult.",
  respect: "Speaks and listens respectfully to classmates and staff.",
  leadership: "Helps the group get started and includes others.",
  gratitude: "Shows appreciation for others' help.",
  patience: "Waits their turn and stays calm while waiting.",
  teamwork: "Works well with a partner or group.",
  courage: "Tries new things and speaks up for others.",
};

export type CharacterStrength = keyof typeof CHARACTER_STRENGTHS;

export const CHARACTER_SECTION_TITLE = "Character and leadership strengths";
