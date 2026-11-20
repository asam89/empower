import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, verifyDemoToken } from "@/lib/demo-access";

// Guards the demo behind the DEMO_ACCESS_CODE cookie. Only /demo routes are
// matched; the rest of the site is untouched.

const PUBLIC_DEMO_PATHS = new Set(["/demo/unlock", "/api/demo/unlock"]);

function noindex(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_DEMO_PATHS.has(pathname)) return noindex(NextResponse.next());

  const code = process.env.DEMO_ACCESS_CODE;
  const token = request.cookies.get(DEMO_COOKIE)?.value;
  if (code && token && (await verifyDemoToken(token, code))) {
    return noindex(NextResponse.next());
  }

  if (pathname.startsWith("/api/")) {
    return noindex(NextResponse.json({ error: "Demo access required." }, { status: 401 }));
  }
  const url = request.nextUrl.clone();
  url.pathname = "/demo/unlock";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return noindex(NextResponse.redirect(url));
}

export const config = {
  matcher: ["/demo", "/demo/:path*", "/api/demo/:path*"],
};
