import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "edge";

// Demo data for local dev (D1 not available outside Cloudflare)
const DEMO_CLIENTS = [
  {
    id: 1,
    org_name: "Riverside Elementary",
    org_type: "public",
    board: "TDSB",
    contact_name: "Jane Smith",
    contact_email: "jsmith@tdsb.on.ca",
    contact_phone: "416-555-0100",
    status: "new",
    created_at: "2025-06-01T10:00:00Z",
  },
  {
    id: 2,
    org_name: "Maple Academy",
    org_type: "private",
    board: "N/A",
    contact_name: "Michael Chen",
    contact_email: "mchen@mapleacademy.ca",
    contact_phone: null,
    status: "contacted",
    created_at: "2025-06-05T14:30:00Z",
  },
];

const DEMO_INTAKES = [
  {
    id: 1,
    client_id: 1,
    enrolment_range: "500–1,000",
    grade_range: "JK–8",
    identified_range: "50–100",
    exceptionalities: '["Communication","Intellectual","Behaviour"]',
    current_staffing: "1 SERT, 2 EAs",
    current_resources: "Resource room, Reading Recovery",
    challenges: "Inconsistent IEP process, no formal IPRC workflow",
    budget_range: "$100K–$250K",
    goals: "Build a compliant spec ed program, train staff",
    created_at: "2025-06-01T10:05:00Z",
  },
];

const DEMO_PLANS = [
  {
    id: 1,
    client_id: 1,
    intake_id: 1,
    plan_md:
      "# Draft Program Framework for Riverside Elementary\n\n> **Disclaimer:** This is a non-binding draft...\n\n## 1. Program Vision & Guiding Principles\n\nRiverside Elementary will foster an inclusive learning community...",
    model: "claude-sonnet-4-6-20250514",
    created_at: "2025-06-01T10:06:00Z",
  },
];

const DEMO_LEADS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Vice Principal",
    org: "Oakwood Public School",
    email: "sjohnson@yrdsb.ca",
    phone: "905-555-0200",
    message: "Interested in learning more about your services for our school.",
    source: "contact_form",
    created_at: "2025-06-10T09:00:00Z",
  },
];

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // In production with D1, query the database:
  // const db = getDB();
  // const clients = await db.prepare("SELECT * FROM clients ORDER BY created_at DESC").all();
  // etc.

  return NextResponse.json({
    clients: DEMO_CLIENTS,
    intakes: DEMO_INTAKES,
    plans: DEMO_PLANS,
    leads: DEMO_LEADS,
  });
}
