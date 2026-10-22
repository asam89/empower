import type { Iep, SchoolCalendar } from "../types";
import { addSchoolDays, schoolDaysBetween } from "./calendar";

/** IEPs must be completed within 30 school days of the date of placement. */
export const IEP_COMPLETION_SCHOOL_DAYS = 30;
/** Flag an IEP in development when this many school days or fewer remain. */
export const IEP_DUE_SOON_SCHOOL_DAYS = 10;

export type IepClockStatus = "complete" | "on_time" | "due_soon" | "overdue";

export interface IepClock {
  dueDate: string;
  /** School days left until the due date; negative when overdue. */
  remaining: number;
  status: IepClockStatus;
}

export function iepClock(iep: Iep, today: string, cal: SchoolCalendar): IepClock {
  const dueDate = addSchoolDays(iep.placementDate, IEP_COMPLETION_SCHOOL_DAYS, cal);
  const remaining = schoolDaysBetween(today, dueDate, cal);
  if (iep.status === "complete") return { dueDate, remaining, status: "complete" };
  if (remaining < 0) return { dueDate, remaining, status: "overdue" };
  return { dueDate, remaining, status: remaining <= IEP_DUE_SOON_SCHOOL_DAYS ? "due_soon" : "on_time" };
}
