"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function safeNext(value: string | null): string {
  return value && value.startsWith("/demo") && !value.startsWith("//") ? value : "/demo";
}

function UnlockForm() {
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/demo/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "That code did not work.");
        return;
      }
      window.location.href = safeNext(params.get("next"));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <label htmlFor="demo-code" className="block font-semibold">
        Access code
      </label>
      <input
        id="demo-code"
        type="password"
        autoComplete="off"
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full border border-border rounded-lg px-3 py-2"
      />
      {error && (
        <p role="alert" className="text-[0.9rem] text-red-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="w-full bg-brand-primary text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-60">
        {busy ? "Checking…" : "Open the demo"}
      </button>
    </form>
  );
}

export default function UnlockPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-[1.6rem] font-bold text-brand-primary mb-2">Empower demo</h1>
      <p className="text-slate mb-6">Enter the access code you were given to open the demonstration environment.</p>
      <Suspense>
        <UnlockForm />
      </Suspense>
    </div>
  );
}
