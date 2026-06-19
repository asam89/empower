"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ORG_TYPES = ["Public", "Private", "Independent"];
const BOARDS = ["TDSB", "YRDSB", "DDSB", "PDSB", "Other", "N/A"];
const ENROLMENT_RANGES = [
  "Under 200",
  "200–500",
  "500–1,000",
  "1,000–2,000",
  "2,000+",
];
const GRADE_OPTIONS = [
  "JK–3",
  "JK–6",
  "JK–8",
  "4–8",
  "7–8",
  "9–12",
  "JK–12",
  "Other",
];
const IDENTIFIED_RANGES = [
  "Under 20",
  "20–50",
  "50–100",
  "100–200",
  "200+",
  "Unknown",
];
const EXCEPTIONALITIES = [
  "Behaviour",
  "Communication",
  "Intellectual",
  "Physical",
  "Multiple",
];
const BUDGET_OPTIONS = [
  "Under $50K",
  "$50K–$100K",
  "$100K–$250K",
  "$250K–$500K",
  "$500K+",
  "Not sure",
];

interface FormState {
  orgName: string;
  orgType: string;
  board: string;
  enrolmentRange: string;
  gradeRange: string;
  identifiedRange: string;
  exceptionalities: string[];
  currentStaffing: string;
  currentResources: string;
  challenges: string;
  budgetRange: string;
  goals: string;
  contactEmail: string;
  consent: boolean;
}

const initialForm: FormState = {
  orgName: "",
  orgType: "",
  board: "",
  enrolmentRange: "",
  gradeRange: "",
  identifiedRange: "",
  exceptionalities: [],
  currentStaffing: "",
  currentResources: "",
  challenges: "",
  budgetRange: "",
  goals: "",
  contactEmail: "",
  consent: false,
};

export default function ProgramBuilderPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [plan, setPlan] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: keyof FormState, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleExceptionality(val: string) {
    setForm((prev) => ({
      ...prev,
      exceptionalities: prev.exceptionalities.includes(val)
        ? prev.exceptionalities.filter((e) => e !== val)
        : [...prev.exceptionalities, val],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    setPlan("");

    try {
      const res = await fetch("/api/program-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // Non-streaming error responses (validation, rate limit, etc.)
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to generate program. Please try again.");
        }
        // Fallback for non-streaming JSON response
        setPlan(data.plan);
        setStatus("success");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to generate program. Please try again.");
      }

      // Streaming SSE response
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream available.");

      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "text") {
                accumulated += event.text;
                setPlan(accumulated);
                setStatus("success");
              } else if (event.type === "error") {
                throw new Error(event.error || "Stream error.");
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== "Stream error.") {
                // JSON parse error — skip
              } else {
                throw parseErr;
              }
            }
          }
        }
      }

      if (!accumulated) {
        throw new Error("AI returned an empty response. Please try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function copyPlan() {
    navigator.clipboard.writeText(plan);
  }

  function downloadPlan() {
    const blob = new Blob([plan], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.orgName || "empower"}-program-framework.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // If we have a plan, show the result
  if (status === "success" && plan) {
    return (
      <>
        <section className="bg-brand-primary text-white py-10">
          <div className="max-w-[1200px] mx-auto px-6">
            <h1 className="text-[1.8rem] md:text-[2.2rem] font-bold mb-2">
              Your Program Framework
            </h1>
            <p className="text-white/80 text-[0.95rem]">
              Generated for {form.orgName}
            </p>
          </div>
        </section>

        <section className="py-10 md:py-16">
          <div className="max-w-[900px] mx-auto px-6">
            {/* Disclaimer */}
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-8 text-[0.85rem] text-ink">
              <strong className="text-warning">Important:</strong> This is a{" "}
              <strong>non-binding draft</strong> generated by AI. It is a starting
              point to be validated, refined, and tailored on-site by Empower&apos;s
              specialist team. It does not constitute compliance, legal, or
              regulatory advice.
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={copyPlan}
                className="px-5 py-2.5 bg-brand-primary text-white font-semibold rounded-xl text-[0.85rem] hover:bg-brand-primary-700 transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={downloadPlan}
                className="px-5 py-2.5 bg-brand-care text-white font-semibold rounded-xl text-[0.85rem] hover:bg-brand-care/90 transition-colors"
              >
                Download Markdown
              </button>
              <button
                onClick={() => {
                  setStatus("idle");
                  setPlan("");
                }}
                className="px-5 py-2.5 border border-border text-ink font-semibold rounded-xl text-[0.85rem] hover:bg-cloud transition-colors"
              >
                Build Another
              </button>
            </div>

            {/* Rendered plan */}
            <div className="bg-surface rounded-2xl border border-border p-8 md:p-10 shadow-sm plan-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {plan}
              </ReactMarkdown>
            </div>

            <div className="mt-8 text-center">
              <p className="text-slate text-[0.9rem] mb-4">
                Want Empower&apos;s team to refine and implement this program?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-accent text-white font-semibold rounded-xl text-[0.95rem] hover:bg-brand-accent/90 transition-colors"
              >
                Contact Us to Get Started
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="bg-brand-primary text-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-[2.2rem] md:text-[2.8rem] font-bold mb-4">
            AI Program Builder
          </h1>
          <p className="text-white/80 max-w-xl text-[1.05rem]">
            Answer a few questions about your school and receive an AI-generated
            draft special education program framework &mdash; grounded in the
            Ontario special education framework.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-[720px] mx-auto px-6">
          {/* Disclaimer */}
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-8 text-[0.85rem] text-ink">
            <strong className="text-warning">Note:</strong> This tool collects{" "}
            <strong>school-level data only</strong>. Do not enter any individual
            student names, Ontario Education Numbers (OEN), or personal diagnoses.
            The generated framework is a draft starting point, not compliance advice.
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-surface rounded-2xl border border-border p-8 shadow-sm space-y-6"
          >
            <h2 className="text-[1.2rem] font-bold text-brand-primary">
              School Profile
            </h2>

            {/* Org Name */}
            <div>
              <label htmlFor="orgName" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Organization Name <span className="text-brand-accent">*</span>
              </label>
              <input
                id="orgName"
                type="text"
                required
                value={form.orgName}
                onChange={(e) => set("orgName", e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              />
            </div>

            {/* Org Type */}
            <div>
              <label htmlFor="orgType" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Type
              </label>
              <select
                id="orgType"
                value={form.orgType}
                onChange={(e) => set("orgType", e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              >
                <option value="">Select type</option>
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Board */}
            <div>
              <label htmlFor="board" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Board
              </label>
              <select
                id="board"
                value={form.board}
                onChange={(e) => set("board", e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              >
                <option value="">Select board</option>
                {BOARDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Enrolment */}
              <div>
                <label htmlFor="enrolmentRange" className="block text-[0.85rem] font-semibold text-ink mb-1">
                  Total Enrolment
                </label>
                <select
                  id="enrolmentRange"
                  value={form.enrolmentRange}
                  onChange={(e) => set("enrolmentRange", e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                >
                  <option value="">Select range</option>
                  {ENROLMENT_RANGES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Grade Range */}
              <div>
                <label htmlFor="gradeRange" className="block text-[0.85rem] font-semibold text-ink mb-1">
                  Grade Range
                </label>
                <select
                  id="gradeRange"
                  value={form.gradeRange}
                  onChange={(e) => set("gradeRange", e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                >
                  <option value="">Select range</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Identified needs */}
            <div>
              <label htmlFor="identifiedRange" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Approx. Students with Identified Needs
              </label>
              <select
                id="identifiedRange"
                value={form.identifiedRange}
                onChange={(e) => set("identifiedRange", e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              >
                <option value="">Select range</option>
                {IDENTIFIED_RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Exceptionalities multi-select */}
            <fieldset>
              <legend className="text-[0.85rem] font-semibold text-ink mb-2">
                Exceptionality Areas Present
              </legend>
              <div className="flex flex-wrap gap-3">
                {EXCEPTIONALITIES.map((ex) => (
                  <label key={ex} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.exceptionalities.includes(ex)}
                      onChange={() => toggleExceptionality(ex)}
                      className="w-4 h-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-[0.85rem] text-ink">{ex}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <h2 className="text-[1.2rem] font-bold text-brand-primary pt-2">
              Current Situation
            </h2>

            {/* Current staffing */}
            <div>
              <label htmlFor="currentStaffing" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Current Special Education Staffing
              </label>
              <textarea
                id="currentStaffing"
                rows={2}
                value={form.currentStaffing}
                onChange={(e) => set("currentStaffing", e.target.value)}
                placeholder="e.g., 1 SERT, 3 EAs, no dedicated psych access"
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-y"
              />
            </div>

            {/* Current resources */}
            <div>
              <label htmlFor="currentResources" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Existing Programs &amp; Resources
              </label>
              <textarea
                id="currentResources"
                rows={2}
                value={form.currentResources}
                onChange={(e) => set("currentResources", e.target.value)}
                placeholder="e.g., Reading Recovery, resource room, assistive tech available"
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-y"
              />
            </div>

            {/* Challenges */}
            <div>
              <label htmlFor="challenges" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Top Challenges
              </label>
              <textarea
                id="challenges"
                rows={3}
                value={form.challenges}
                onChange={(e) => set("challenges", e.target.value)}
                placeholder="e.g., Inconsistent IEP process, staff training gaps, parent communication"
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-y"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Budget */}
              <div>
                <label htmlFor="budgetRange" className="block text-[0.85rem] font-semibold text-ink mb-1">
                  Budget Range <span className="text-slate text-[0.8rem] font-normal">(optional)</span>
                </label>
                <select
                  id="budgetRange"
                  value={form.budgetRange}
                  onChange={(e) => set("budgetRange", e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                >
                  <option value="">Select range</option>
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Contact Email */}
              <div>
                <label htmlFor="contactEmail" className="block text-[0.85rem] font-semibold text-ink mb-1">
                  Contact Email <span className="text-brand-accent">*</span>
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  required
                  value={form.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                />
              </div>
            </div>

            {/* Goals */}
            <div>
              <label htmlFor="goals" className="block text-[0.85rem] font-semibold text-ink mb-1">
                Primary Goals
              </label>
              <textarea
                id="goals"
                rows={3}
                value={form.goals}
                onChange={(e) => set("goals", e.target.value)}
                placeholder="e.g., Build a compliant spec ed program from scratch, improve IEP quality, reduce EA turnover"
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-y"
              />
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-[0.82rem] text-slate leading-snug">
                I confirm this form contains <strong>school-level data only</strong>{" "}
                (no individual student information) and consent to Empower processing
                this data per our{" "}
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
              className="w-full py-3.5 bg-brand-accent text-white font-semibold rounded-xl text-[0.95rem] hover:bg-brand-accent/90 transition-colors disabled:opacity-60"
            >
              {status === "submitting"
                ? "Generating your program framework\u2026"
                : "Generate Program Framework"}
            </button>

            {status === "submitting" && (
              <p className="text-center text-slate text-[0.85rem]">
                This may take up to 30 seconds. The AI is crafting a detailed
                framework based on your school&apos;s profile.
              </p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
