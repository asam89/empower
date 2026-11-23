"use client";

import { PERSONAS, type Persona } from "../lib/personas";
import { ROLE_LABELS } from "../lib/views";
import type { Role, SchoolConfig } from "../types";
import { Avatar } from "./Avatar";

const ORDER: Role[] = ["principal", "sert", "teacher", "parent"];

export function RoleChooser({ school, onChoose }: { school: SchoolConfig; onChoose: (role: Role) => void }) {
  const staff = ORDER.map((r) => PERSONAS[r]).filter((p) => p.group === "staff");
  const family = ORDER.map((r) => PERSONAS[r]).filter((p) => p.group === "family");
  return (
    <section aria-labelledby="signin-heading" className="max-w-[1000px] mx-auto">
      <div className="text-center mb-8">
        <h1 id="signin-heading" className="text-[1.8rem] font-bold text-ink tracking-tight">Sign in to the demo</h1>
        <p className="text-slate mt-1">
          Choose who you are at {school.shortName}. Each person sees a different view, and you can switch at any time.
        </p>
      </div>

      <h2 className="text-[0.8rem] font-bold uppercase tracking-wider text-slate mb-3">School staff</h2>
      <ul className="grid md:grid-cols-3 gap-4 mb-8">
        {staff.map((p) => (
          <PersonaCard key={p.role} persona={p} color={school.accentColor} onChoose={onChoose} />
        ))}
      </ul>

      <h2 className="text-[0.8rem] font-bold uppercase tracking-wider text-slate mb-3">Families</h2>
      <ul className="grid md:grid-cols-3 gap-4">
        {family.map((p) => (
          <PersonaCard key={p.role} persona={p} color="#FF8A3D" onChoose={onChoose} />
        ))}
      </ul>
    </section>
  );
}

function PersonaCard({ persona: p, color, onChoose }: { persona: Persona; color: string; onChoose: (role: Role) => void }) {
  return (
    <li className="bg-surface border border-border rounded-2xl p-5 flex flex-col hover:border-brand-primary hover:shadow-sm transition">
      <div className="flex items-center gap-3">
        <Avatar name={p.name} color={color} size={48} />
        <div>
          <p className="font-bold text-ink leading-tight">{p.title}</p>
          <p className="text-slate text-[0.88rem]">{p.name}</p>
        </div>
      </div>
      <p className="text-ink text-[0.9rem] mt-3">{p.summary}</p>
      <ul className="mt-2 mb-4 space-y-1 text-[0.85rem] text-slate">
        {p.sees.map((s) => (
          <li key={s} className="flex gap-2">
            <span aria-hidden="true" className="text-brand-care">✓</span>
            {s}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChoose(p.role)}
        className="mt-auto w-full py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-[0.9rem] hover:bg-brand-primary-700"
      >
        Sign in as {ROLE_LABELS[p.role]}
      </button>
    </li>
  );
}
