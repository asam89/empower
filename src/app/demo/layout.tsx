import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Empower demo environment",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cloud min-h-full">
      <div role="note" data-testid="demo-banner" className="bg-brand-accent text-ink text-center font-semibold text-[0.9rem] px-4 py-2">
        Demonstration environment. All students and data are fictional.
      </div>
      {children}
    </div>
  );
}
