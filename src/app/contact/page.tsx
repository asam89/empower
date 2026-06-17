"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

interface FormData {
  name: string;
  role: string;
  org: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
}

const initial: FormData = {
  name: "",
  role: "",
  org: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
};

export default function ContactPage() {
  const [form, setForm] = useState<FormData>(initial);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setForm(initial);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <section className="py-20 md:py-28">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="bg-surface rounded-2xl border border-border p-10 shadow-sm">
            <div className="w-16 h-16 bg-success/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-success text-[1.5rem]">&#10003;</span>
            </div>
            <h1 className="text-[1.5rem] font-bold text-brand-primary mb-3">
              Message sent
            </h1>
            <p className="text-slate mb-6">
              Thank you for reaching out. We&apos;ll be in touch shortly.
            </p>
            <Link
              href="/"
              className="text-brand-primary font-semibold hover:underline"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-brand-primary text-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-[2.2rem] md:text-[2.8rem] font-bold mb-4">
            Contact us
          </h1>
          <p className="text-white/80 max-w-xl text-[1.05rem]">
            Have questions about our services? Want to discuss how Empower can help
            your school? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[640px] mx-auto px-6">
          <form
            onSubmit={handleSubmit}
            className="bg-surface rounded-2xl border border-border p-8 shadow-sm space-y-5"
          >
            <div>
              <label htmlFor="name" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Name <span className="text-brand-accent">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Role / Title
              </label>
              <input
                id="role"
                type="text"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="org" className="block text-[0.85rem] font-semibold text-ink mb-1">
                School or Board <span className="text-brand-accent">*</span>
              </label>
              <input
                id="org"
                type="text"
                required
                value={form.org}
                onChange={(e) => set("org", e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Email <span className="text-brand-accent">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Phone <span className="text-slate text-[0.8rem] font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Message <span className="text-brand-accent">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition resize-y"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-[0.82rem] text-slate leading-snug">
                I consent to Empower collecting and using this information to respond
                to my inquiry. See our{" "}
                <Link href="/privacy" className="text-brand-primary underline">
                  Privacy Policy
                </Link>
                . <span className="text-brand-accent">*</span>
              </span>
            </label>

            {status === "error" && (
              <div
                role="alert"
                className="text-[0.85rem] text-red-600 bg-red-50 px-4 py-2.5 rounded-xl"
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full py-3 bg-brand-primary text-white font-semibold rounded-xl text-[0.9rem] hover:bg-brand-primary-700 transition-colors disabled:opacity-60"
            >
              {status === "submitting" ? "Sending\u2026" : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
