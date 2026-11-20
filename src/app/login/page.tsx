import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Sign in — Empower",
  description: "Sign in to the Empower family and educator portal.",
};

const ERRORS: Record<string, string> = {
  no_access:
    "That Google account hasn't been invited yet. Ask your child's teacher or your Empower administrator to add your email, then try again.",
  not_configured: "Google sign-in isn't set up on this site yet. Please contact Empower.",
  cancelled: "Sign-in was cancelled.",
  state: "Your sign-in session expired. Please try again.",
  google: "We couldn't verify your Google account. Please try again.",
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; signed_out?: string }>;
}) {
  const { error, next, signed_out } = await searchParams;
  if (await getCurrentUser()) redirect("/portal");
  const href = `/api/auth/google${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[440px] mx-auto px-6">
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm text-center">
          <div className="flex justify-center mb-5">
            <LogoMark size={64} />
          </div>
          <h1 className="text-[1.5rem] font-bold text-ink tracking-tight">Welcome to Empower</h1>
          <p className="text-slate text-[0.9rem] mt-2 mb-7">
            Teachers share progress. Families celebrate every step. Sign in with the Google account you were invited
            with.
          </p>

          {error && ERRORS[error] && (
            <p role="alert" className="mb-5 rounded-xl px-4 py-3 text-[0.85rem] text-left bg-[#FEF3F2] border border-[#FDA29B] text-[#912018]">
              {ERRORS[error]}
            </p>
          )}
          {signed_out && !error && (
            <p role="status" className="mb-5 text-[0.85rem] text-slate">You&apos;ve been signed out.</p>
          )}

          {/* A plain link: the OAuth flow needs a full-page navigation */}
          <a
            href={href}
            className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 border border-border rounded-xl bg-surface text-ink font-semibold text-[0.92rem] hover:border-brand-primary hover:shadow-sm transition"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          {process.env.NODE_ENV === "development" && (
            <p className="mt-6 text-[0.75rem] text-slate">
              Dev:{" "}
              <a className="underline" href="/api/auth/dev-login?role=admin">admin</a> ·{" "}
              <a className="underline" href="/api/auth/dev-login?role=teacher&email=teacher@example.com">teacher</a> ·{" "}
              <a className="underline" href="/api/auth/dev-login?role=parent&email=parent@example.com">parent</a>
            </p>
          )}

          <p className="mt-7 text-[0.75rem] text-slate leading-snug">
            By signing in you agree to our{" "}
            <Link href="/privacy" className="underline text-brand-primary">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
