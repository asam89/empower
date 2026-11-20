import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export const runtime = "edge";

interface ContactPayload {
  name: string;
  role: string;
  org: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactPayload;

    if (!body.name || !body.email || !body.org || !body.message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (!body.consent) {
      return NextResponse.json(
        { error: "You must consent to our privacy policy." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "") || null;
    await getDB()
      .prepare(
        "INSERT INTO leads (name, role, org, email, phone, message, source) VALUES (?, ?, ?, ?, ?, ?, 'contact_form')"
      )
      .bind(
        clean(body.name, 120),
        clean(body.role, 120),
        clean(body.org, 200),
        body.email.trim().toLowerCase().slice(0, 200),
        clean(body.phone, 40),
        clean(body.message, 5000)
      )
      .run();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
