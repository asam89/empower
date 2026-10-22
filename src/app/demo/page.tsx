import { Suspense } from "react";
import { DemoApp } from "@/demo/components/DemoApp";

export default function DemoPage() {
  return (
    <Suspense fallback={<p className="max-w-[1200px] mx-auto px-6 py-10 text-slate">Loading the demo…</p>}>
      <DemoApp />
    </Suspense>
  );
}
