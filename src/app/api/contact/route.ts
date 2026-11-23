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

    const db = getDB();
    if (db) {
      await db
        .prepare(
          "INSERT INTO leads (name, role, org, email, phone, message, source) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(body.name, body.role || null, body.org, body.email, body.phone || null, body.message, "contact_form")
        .run();
    } else {
      console.log("Lead received (no database configured):", {
        name: body.name,
        org: body.org,
        email: body.email,
        source: "contact_form",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
