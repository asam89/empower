import { DEMO_TODAY } from "../../config/school";
import { CALENDAR } from "../../fixtures/calendar";
import { PROGRAM } from "../../fixtures/program";
import { STAFF } from "../../fixtures/staff";
import type { RosterFilter } from "../../lib/filters";
import { formatDate } from "../../lib/calendar";
import {
  bandSplit,
  cohort,
  goalsOnTrack,
  hasUpcomingReview,
  needsAttention,
  onTrackTrend,
  parentMeetingsHeld,
  referralsInProgress,
  screeningCompletion,
  seats,
  specialistHours,
  tierCounts,
} from "../../lib/metrics";
import type { SchoolConfig, Student } from "../../types";
import { BarChart, LineChart } from "../charts";

const TREND_CHECKPOINTS = [
  { label: "Oct", date: "2026-10-30" },
  { label: "Nov", date: "2026-11-27" },
  { label: "Dec", date: "2026-12-18" },
  { label: "Jan", date: DEMO_TODAY },
];

interface Props {
  school: SchoolConfig;
  students: Student[];
  onFilter: (filter: RosterFilter) => void;
  onOpenStudent: (id: string) => void;
}

function Tile({ label, value, detail, onClick }: { label: string; value: string; detail?: string; onClick: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="w-full h-full text-left bg-surface border border-border rounded-xl p-4 hover:border-brand-primary">
        <span className="block text-[1.6rem] font-bold text-ink leading-tight">{value}</span>
        <span className="block text-[0.85rem] font-semibold text-ink">{label}</span>
        {detail && <span className="block text-[0.8rem] text-slate mt-1">{detail}</span>}
      </button>
    </li>
  );
}

export function Dashboard({ school, students, onFilter, onOpenStudent }: Props) {
  const program = cohort(students);
  const s = seats(students, school);
  const tiers = tierCounts(students);
  const screening = screeningCompletion(PROGRAM);
  const onTrack = goalsOnTrack(students, DEMO_TODAY, CALENDAR);
  const inDevelopment = program.filter((st) => st.iep?.status === "in_development").length;
  const reviewsDue = program.filter((st) => hasUpcomingReview(st, DEMO_TODAY)).length;
  const referrals = referralsInProgress(students);
  const meetings = parentMeetingsHeld(students, DEMO_TODAY, CALENDAR);
  const attention = needsAttention(students, DEMO_TODAY, CALENDAR);
  const hours = specialistHours(PROGRAM, STAFF);
  const split = bandSplit(students, DEMO_TODAY, CALENDAR);

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="dashboard-heading" className="text-[1.4rem] font-bold text-brand-primary">Program at a glance</h2>
        <p className="text-[0.85rem] text-slate">As of {formatDate(DEMO_TODAY)} · {CALENDAR.schoolYear}</p>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Headline figures">
        <Tile label="Program seats filled" value={`${s.filled} of ${s.capacity}`} detail={`${s.waitlist} on the waitlist`} onClick={() => onFilter("in-program")} />
        <Tile label="Students supported by tier" value={`${tiers[3]} · ${tiers[2]} · ${tiers[1]}`} detail="Tier 3 · Tier 2 · Tier 1" onClick={() => onFilter("tier-3")} />
        <Tile label="Fall screening complete" value={`${screening.fallPercent}%`} detail={`Winter screening ${screening.winterPercent}% so far`} onClick={() => onFilter("tier-1")} />
        <Tile label="IEPs active" value={String(program.filter((st) => st.iep).length)} detail={`${inDevelopment} in development`} onClick={() => onFilter("iep-in-development")} />
        <Tile label="IEP reviews due in 30 days" value={String(reviewsDue)} onClick={() => onFilter("review-due")} />
        <Tile label="Goals on track" value={`${onTrack.percent}%`} detail={`${onTrack.onTrack} of ${onTrack.total} goals`} onClick={() => onFilter("flat-progress")} />
        <Tile label="Referrals in progress" value={String(referrals.length)} onClick={() => onFilter("referral")} />
        <Tile label="Parent meetings this term" value={String(meetings)} onClick={() => onFilter("in-program")} />
      </ul>

      <div className="grid md:grid-cols-2 gap-4">
        <section aria-labelledby="attention-heading" className="bg-surface border border-border rounded-xl p-4">
          <h3 id="attention-heading" className="font-semibold text-ink mb-3">Needs attention ({attention.length})</h3>
          <ul className="space-y-2 max-h-[320px] overflow-y-auto">
            {attention.map((a, i) => (
              <li key={`${a.studentId}-${a.kind}-${i}`}>
                <button type="button" onClick={() => onOpenStudent(a.studentId)} className="w-full text-left rounded-lg border border-border px-3 py-2 hover:border-brand-primary">
                  <span className={`inline-block text-[0.7rem] font-bold uppercase tracking-wide mr-2 ${a.kind === "iep_overdue" ? "text-red-700" : a.kind === "iep_due_soon" ? "text-warning" : "text-brand-primary"}`}>
                    {a.kind === "iep_overdue" ? "Overdue" : a.kind === "iep_due_soon" ? "Due soon" : a.kind === "progress_flat" ? "Progress" : "Referral"}
                  </span>
                  <span className="font-semibold">{a.studentName}</span>
                  <span className="block text-[0.85rem] text-slate">{a.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <div className="space-y-4">
          <BarChart
            title="Students by tier"
            unit="Students"
            data={[
              { label: "Tier 3", value: tiers[3], color: "#4B2E91" },
              { label: "Tier 2", value: tiers[2], color: "#0E9C92" },
              { label: "Tier 1", value: tiers[1], color: "#FF8A3D" },
            ]}
          />
          <LineChart title="Goals on track this term (%)" unit="%" data={onTrackTrend(students, TREND_CHECKPOINTS, CALENDAR)} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <BarChart
          title="Specialist hours used this term"
          unit="Hours used"
          max={Math.max(...hours.map((h) => h.scheduled))}
          data={hours.map((h) => ({ label: h.role.replace("Speech-Language Pathologist", "Speech-language").replace("Educational Psychologist", "Psychologist").replace("Occupational Therapist", "OT"), value: h.used }))}
        />
        <section aria-labelledby="split-heading" className="bg-surface border border-border rounded-xl p-4">
          <h3 id="split-heading" className="font-semibold text-ink mb-3">Elementary and secondary</h3>
          <table className="w-full text-[0.85rem]">
            <thead>
              <tr className="text-left text-slate">
                <th scope="col" className="py-1">Panel</th>
                <th scope="col" className="py-1">Students</th>
                <th scope="col" className="py-1">Goals on track</th>
              </tr>
            </thead>
            <tbody>
              {split.map((b) => (
                <tr key={b.band} className="border-t border-border">
                  <td className="py-1 capitalize">{b.band}</td>
                  <td className="py-1">{b.students}</td>
                  <td className="py-1">{b.goalsOnTrack.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[0.8rem] text-slate mt-3">Specialist hours scheduled this term: {hours.map((h) => `${h.name} ${h.used} of ${h.scheduled}`).join(" · ")}.</p>
        </section>
        <section aria-labelledby="pd-heading" className="bg-surface border border-border rounded-xl p-4">
          <h3 id="pd-heading" className="font-semibold text-ink mb-3">Staff PD delivered ({PROGRAM.pdSessions.length})</h3>
          <ul className="space-y-2 text-[0.85rem]">
            {PROGRAM.pdSessions.map((p) => (
              <li key={p.date}>
                <span className="font-semibold">{formatDate(p.date)}</span> · {p.title} <span className="text-slate">({p.attendees} staff)</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="text-[0.8rem] text-slate">Sample data. Every figure is calculated from the fictional student records in this demo.</p>
    </section>
  );
}
