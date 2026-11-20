import type { Student } from "../../types";

export function ParentPreview({ student }: { student: Student }) {
  return (
    <section aria-labelledby="parent-heading" className="bg-surface border border-border rounded-xl p-6">
      <h2 id="parent-heading" className="text-[1.4rem] font-bold text-ink mb-2">{student.name.split(" ")[0]}&apos;s program</h2>
      <p className="text-[1rem] leading-relaxed">{student.parentSummary.en}</p>
      <p className="text-[0.85rem] text-slate mt-4">The full parent hub is built in Workstream 5.</p>
    </section>
  );
}
