export function Placeholder({ title, workstream }: { title: string; workstream: number }) {
  return (
    <section aria-labelledby="placeholder-heading" className="bg-surface border border-dashed border-border rounded-xl p-8 text-center">
      <h2 id="placeholder-heading" className="text-[1.3rem] font-bold text-brand-primary mb-2">{title}</h2>
      <p className="text-slate">Built in Workstream {workstream}.</p>
    </section>
  );
}
