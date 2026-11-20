import type { ReactNode } from "react";

export const inputClass =
  "w-full px-4 py-2.5 border border-border rounded-xl bg-cloud text-ink text-[0.9rem] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition";

export const labelClass = "block text-[0.85rem] font-semibold text-ink mb-1";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-[0.85rem] font-semibold rounded-xl hover:bg-brand-primary-700 transition-colors disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 border border-border bg-surface text-ink text-[0.82rem] font-semibold rounded-xl hover:border-brand-primary hover:text-brand-primary transition-colors";

export const linkButtonClass =
  "text-[0.8rem] font-semibold text-slate hover:text-brand-primary underline-offset-2 hover:underline";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`bg-surface rounded-2xl border border-border p-6 ${className}`}>{children}</section>;
}

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  const isError = Boolean(error);
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-6 rounded-xl px-4 py-3 text-[0.88rem] border ${
        isError ? "bg-[#FEF3F2] border-[#FDA29B] text-[#912018]" : "bg-[#ECFDF3] border-[#A6F4C5] text-[#05603A]"
      }`}
    >
      {error === "forbidden" ? "You don't have access to that page." : (error ?? ok)}
    </div>
  );
}

const AVATAR_COLORS = ["#4B2E91", "#0E9C92", "#FF8A3D", "#1E9E5A", "#D97706", "#6D4BC2"];

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-full text-white font-bold shrink-0"
      style={{ width: size, height: size, background: AVATAR_COLORS[hash % AVATAR_COLORS.length], fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "care" | "accent" | "primary" }) {
  const tones = {
    neutral: "bg-cloud text-slate border-border",
    care: "bg-[#E6F6F4] text-[#0B7A72] border-[#B3E3DF]",
    accent: "bg-[#FFF2E8] text-[#B4520F] border-[#FFD3B3]",
    primary: "bg-[#EFEAF8] text-brand-primary border-[#D6CBEF]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[0.72rem] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-[1.6rem] font-bold text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate text-[0.9rem] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
