import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminPasswordSession, ADMIN_PASSWORD_COOKIE } from "@/lib/admin-password";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { username: string; password: string };

    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const valid = await verifyAdminCredentials(body.username, body.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const sessionId = await createAdminPasswordSession();

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_PASSWORD_COOKIE, sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
