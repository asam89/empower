"use client";

import { useId, useState } from "react";
import { formatDate } from "../lib/calendar";
import { aimValue } from "../lib/progress";
import type { Goal, SchoolCalendar } from "../types";

// Progress-monitoring chart for one goal: weekly points, baseline, aim line,
// target and phase changes (when the support plan changed). The "family"
// variant drops the aim line and uses plainer labels.

const W = 560;
const H = 230;
const PAD = { l: 44, r: 16, t: 18, b: 34 };

const ms = (d: string) => Date.parse(`${d}T12:00:00Z`);
const shortDate = (d: string) =>
  new Date(ms(d)).toLocaleDateString("en-CA", { timeZone: "UTC", month: "short", day: "numeric" });

interface Props {
  goal: Goal;
  cal: SchoolCalendar;
  asOf: string;
  variant?: "staff" | "family";
}

export function ProgressChart({ goal, cal, asOf, variant = "staff" }: Props) {
  const [asTable, setAsTable] = useState(false);
  const titleId = useId();
  const staff = variant === "staff";
  const points = goal.points;

  // X runs from the goal start to two weeks past the newest point.
  const lastDate = points.length ? points[points.length - 1].date : asOf;
  const endMs = Math.max(ms(lastDate), ms(asOf)) + 14 * 86400000;
  const endDate = new Date(endMs).toISOString().slice(0, 10);
  const startMs = ms(goal.startDate);
  const x = (d: string) => PAD.l + ((ms(d) - startMs) / (endMs - startMs)) * (W - PAD.l - PAD.r);

  const aimAt = (d: string) => aimValue(goal, d, cal);
  const values = [goal.baseline, goal.target, ...points.map((p) => p.value)];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = Math.max(1, (hi - lo) * 0.12);
  const yMin = Math.max(0, Math.floor(lo - pad));
  const yMax = Math.ceil(hi + pad);
  const y = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);
  const ticks = [yMin, Math.round((yMin + yMax) / 2), yMax];
  const higherIsBetter = goal.target >= goal.baseline;
  const below = (date: string, v: number) => (higherIsBetter ? v < aimAt(date) : v > aimAt(date));

  // Aim line sampled at each point date so it follows school days, not calendar days.
  const aimDates = [goal.startDate, ...points.map((p) => p.date), endDate];
  const latest = points[points.length - 1];
  const summary = latest
    ? `${goal.measure}: baseline ${goal.baseline}, latest ${latest.value} on ${formatDate(latest.date)}, goal ${goal.target} ${goal.unit}. ${points.length} data points.`
    : `${goal.measure}: no data yet. Baseline ${goal.baseline}, goal ${goal.target} ${goal.unit}.`;

  return (
    <figure aria-labelledby={titleId} className="mt-3">
      <div className="flex items-center justify-between gap-2 mb-1">
        <figcaption id={titleId} className="text-[0.78rem] text-slate">
          {staff ? goal.measure : "Each dot is one weekly check-in"} ({goal.unit})
        </figcaption>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          aria-pressed={asTable}
          className="text-[0.78rem] font-semibold text-brand-primary underline shrink-0"
        >
          {asTable ? "View as chart" : "View as table"}
        </button>
      </div>
      {asTable ? (
        <table className="w-full text-[0.82rem]">
          <thead>
            <tr className="text-left text-slate">
              <th scope="col" className="py-1">Week of</th>
              <th scope="col" className="py-1">Result</th>
              {staff && <th scope="col" className="py-1">Aim line</th>}
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.date} className="border-t border-border">
                <td className="py-1">{formatDate(p.date)}</td>
                <td className="py-1">{p.value}</td>
                {staff && <td className="py-1">{Math.round(aimAt(p.date) * 10) / 10}</td>}
              </tr>
            ))}
          </tbody>
          {goal.phaseChanges.length > 0 && (
            <caption className="caption-bottom text-left text-[0.75rem] text-slate pt-2">
              {goal.phaseChanges.map((pc) => `Support changed ${formatDate(pc.date)}: ${pc.label}`).join(" · ")}
            </caption>
          )}
        </table>
      ) : (
        <div role="img" aria-label={summary}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-hidden="true">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="#E4E1EF" />
                <text x={PAD.l - 8} y={y(t) + 4} fontSize="11" textAnchor="end" fill="#4A4A5C">{t}</text>
              </g>
            ))}

            {/* Target */}
            <line x1={PAD.l} x2={W - PAD.r} y1={y(goal.target)} y2={y(goal.target)} stroke="#FF8A3D" strokeWidth={2} strokeDasharray="6 5" />
            <text x={W - PAD.r} y={y(goal.target) - 6} fontSize="11" textAnchor="end" fill="#B4520F" fontWeight="600">
              Goal {goal.target}
            </text>

            {/* Phase changes: when the support plan changed */}
            {goal.phaseChanges.map((pc) => (
              <g key={pc.date}>
                <title>{`${formatDate(pc.date)}: ${pc.label}`}</title>
                <line x1={x(pc.date)} x2={x(pc.date)} y1={PAD.t} y2={H - PAD.b} stroke="#4A4A5C" strokeDasharray="3 4" />
                <text x={x(pc.date) + 4} y={H - PAD.b - 6} fontSize="10" fill="#4A4A5C">
                  {staff ? "Support changed" : "New support started"}
                </text>
              </g>
            ))}

            {/* Aim line (staff only) */}
            {staff && (
              <polyline
                fill="none"
                stroke="#4B2E91"
                strokeOpacity={0.45}
                strokeWidth={2}
                points={aimDates.map((d) => `${x(d)},${y(aimAt(d))}`).join(" ")}
              />
            )}

            {/* Baseline */}
            <circle cx={x(goal.startDate)} cy={y(goal.baseline)} r={4} fill="#fff" stroke="#4A4A5C" strokeWidth={2} />

            {/* Data */}
            <polyline fill="none" stroke="#0E9C92" strokeWidth={2.5} points={points.map((p) => `${x(p.date)},${y(p.value)}`).join(" ")} />
            {points.map((p, i) => {
              const warn = staff && below(p.date, p.value);
              const isLast = i === points.length - 1;
              return (
                <g key={p.date}>
                  <circle cx={x(p.date)} cy={y(p.value)} r={isLast ? 5.5 : 4} fill={warn ? "#D97706" : "#0E9C92"} stroke="#fff" strokeWidth={1.5} />
                  {isLast && (
                    <text x={x(p.date)} y={y(p.value) - 10} fontSize="12" textAnchor="middle" fill="#161527" fontWeight="700">{p.value}</text>
                  )}
                </g>
              );
            })}

            {/* X labels: start, middle, latest */}
            {[goal.startDate, points[Math.floor(points.length / 2)]?.date, lastDate]
              .filter((d, i, a): d is string => !!d && a.indexOf(d) === i)
              .map((d) => (
                <text key={d} x={x(d)} y={H - 12} fontSize="11" textAnchor="middle" fill="#4A4A5C">{shortDate(d)}</text>
              ))}
          </svg>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.72rem] text-slate mt-1" aria-hidden="true">
            <li><span className="inline-block w-3 h-0.5 align-middle mr-1 bg-[#0E9C92]" />Weekly result</li>
            <li><span className="inline-block w-3 align-middle mr-1 border-t-2 border-dashed border-[#FF8A3D]" />Goal</li>
            {staff && <li><span className="inline-block w-3 h-0.5 align-middle mr-1 bg-[#4B2E91] opacity-50" />Aim line</li>}
            {staff && <li><span className="inline-block w-2 h-2 rounded-full align-middle mr-1 bg-[#D97706]" />Below aim line</li>}
            <li><span className="inline-block w-2 h-2 rounded-full align-middle mr-1 border-2 border-slate" />Starting point</li>
          </ul>
        </div>
      )}
    </figure>
  );
}
