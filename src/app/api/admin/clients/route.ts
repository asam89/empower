import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDB } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDB();
  const [clients, intakes, plans, leads] = await Promise.all([
    db.prepare("SELECT * FROM clients ORDER BY created_at DESC LIMIT 500").all(),
    db.prepare("SELECT * FROM intakes ORDER BY created_at DESC LIMIT 1000").all(),
    db.prepare("SELECT * FROM program_plans ORDER BY created_at DESC LIMIT 1000").all(),
    db.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 500").all(),
  ]);

  return NextResponse.json({
    clients: clients.results,
    intakes: intakes.results,
    plans: plans.results,
    leads: leads.results,
  });
}
