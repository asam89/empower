import { SEED_REQUESTS } from "../fixtures/requests";
import type { FamilyRequest, RequestKind, RequestStatus } from "../types";
import type { DemoEdits } from "./edits";

export const REQUEST_KIND_LABELS: Record<RequestKind, string> = {
  question: "Question",
  concern: "Concern",
  meeting: "Meeting request",
  schedule: "Schedule or absence",
  other: "Other",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
};

/** Seed requests plus this session's, with staff changes applied, newest first. */
export function allRequests(edits: DemoEdits): FamilyRequest[] {
  return [...SEED_REQUESTS, ...edits.addedRequests]
    .map((r) => ({ ...r, ...edits.requestPatches[r.id] }))
    .sort((a, b) => (a.date === b.date ? b.id.localeCompare(a.id) : b.date.localeCompare(a.date)));
}

export function openRequestCount(requests: FamilyRequest[]): number {
  return requests.filter((r) => r.status !== "resolved").length;
}
