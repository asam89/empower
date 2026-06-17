import { NextRequest, NextResponse } from "next/server";

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

    // In production with D1 binding, persist to database:
    // const db = getDB();
    // await db.prepare(
    //   "INSERT INTO leads (name, role, org, email, phone, message, source) VALUES (?, ?, ?, ?, ?, ?, ?)"
    // ).bind(body.name, body.role, body.org, body.email, body.phone, body.message, "contact_form").run();

    console.log("Lead received:", {
      name: body.name,
      role: body.role,
      org: body.org,
      email: body.email,
      phone: body.phone,
      source: "contact_form",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
