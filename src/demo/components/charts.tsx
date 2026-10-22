"use client";

import { useId, useState } from "react";

// Small hand-rolled SVG charts. Each has a text summary for screen readers and
// a "View as table" toggle.

export interface Datum {
  label: string;
  value: number;
  color?: string;
}

function ChartFrame({ title, summary, unit, data, children }: { title: string; summary: string; unit: string; data: Datum[]; children: React.ReactNode }) {
  const [asTable, setAsTable] = useState(false);
  const headingId = useId();
  return (
    <figure aria-labelledby={headingId} className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <figcaption id={headingId} className="font-semibold text-ink">{title}</figcaption>
        <button type="button" onClick={() => setAsTable((v) => !v)} aria-pressed={asTable} className="text-[0.8rem] font-semibold text-brand-primary underline">
          {asTable ? "View as chart" : "View as table"}
        </button>
      </div>
      {asTable ? (
        <table className="w-full text-[0.85rem]">
          <thead>
            <tr className="text-left text-slate">
              <th scope="col" className="py-1">Item</th>
              <th scope="col" className="py-1">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-t border-border">
                <td className="py-1">{d.label}</td>
                <td className="py-1">{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div role="img" aria-label={summary}>{children}</div>
      )}
    </figure>
  );
}

export function BarChart({ title, data, unit, max }: { title: string; data: Datum[]; unit: string; max?: number }) {
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  const rowH = 34;
  const width = 320;
  const labelW = 110;
  const summary = `${title}: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}.`;
  return (
    <ChartFrame title={title} summary={summary} unit={unit} data={data}>
      <svg viewBox={`0 0 ${width} ${data.length * rowH}`} className="w-full h-auto" aria-hidden="true">
        {data.map((d, i) => {
          const w = ((width - labelW - 36) * d.value) / top;
          return (
            <g key={d.label} transform={`translate(0 ${i * rowH})`}>
              <text x={0} y={rowH / 2 + 4} fontSize="12" fill="#4A4A5C">{d.label}</text>
              <rect x={labelW} y={8} width={Math.max(2, w)} height={rowH - 16} rx={4} fill={d.color ?? "#4B2E91"} />
              <text x={labelW + w + 6} y={rowH / 2 + 4} fontSize="12" fill="#161527" fontWeight="600">{d.value}</text>
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}

export function LineChart({ title, data, unit, max = 100 }: { title: string; data: Datum[]; unit: string; max?: number }) {
  const width = 320;
  const height = 160;
  const pad = { l: 30, r: 12, t: 12, b: 28 };
  const x = (i: number) => pad.l + (i * (width - pad.l - pad.r)) / Math.max(1, data.length - 1);
  const y = (v: number) => pad.t + (height - pad.t - pad.b) * (1 - v / max);
  const summary = `${title}: ${data.map((d) => `${d.label} ${d.value}${unit === "%" ? "%" : ""}`).join(", ")}.`;
  return (
    <ChartFrame title={title} summary={summary} unit={unit} data={data}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-hidden="true">
        {[0, 50, 100].filter((t) => t <= max).map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="#E4E1EF" />
            <text x={pad.l - 6} y={y(t) + 4} fontSize="10" textAnchor="end" fill="#4A4A5C">{t}</text>
          </g>
        ))}
        <polyline fill="none" stroke="#0E9C92" strokeWidth={3} points={data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ")} />
        {data.map((d, i) => (
          <g key={d.label}>
            <circle cx={x(i)} cy={y(d.value)} r={4} fill="#0E9C92" />
            <text x={x(i)} y={y(d.value) - 8} fontSize="11" textAnchor="middle" fill="#161527" fontWeight="600">{d.value}</text>
            <text x={x(i)} y={height - 8} fontSize="10" textAnchor="middle" fill="#4A4A5C">{d.label}</text>
          </g>
        ))}
      </svg>
    </ChartFrame>
  );
}
