import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { requireDB } from "@/lib/db";
import { tableCounts } from "@/lib/backup";
import { displayName, formatDate } from "@/lib/portal";
import { Card, PageTitle, buttonClass } from "@/components/portal/ui";

export const runtime = "edge";
export const metadata: Metadata = { title: "Backups — Empower" };

const TABLE_LABELS: Record<string, string> = {
  users: "People (staff & families)",
  students: "Students",
  updates: "Progress updates",
  update_comments: "Replies",
  guardians: "Family links",
  student_staff: "Teacher assignments",
  schools: "Schools",
  milestones: "Program milestones",
  clients: "Program Builder schools",
  intakes: "Program Builder intakes",
  program_plans: "Generated program plans",
  leads: "Contact-form leads",
  audit_log: "Audit log",
};

interface DownloadRow {
  created_at: string;
  name: string | null;
  email: string | null;
}

export default async function BackupsPage() {
  await requireUser(["admin"]);
  const db = requireDB();
  const [counts, { results: history }] = await Promise.all([
    tableCounts(db),
    db
      .prepare(
        `SELECT a.created_at, u.name, u.email FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
          WHERE a.action = 'backup.download' ORDER BY a.id DESC LIMIT 10`
      )
      .all<DownloadRow>(),
  ]);
  const label = (name: string) => TABLE_LABELS[name] ?? name;
  counts.sort((a, b) => label(a.name).localeCompare(label(b.name)));
  const total = counts.reduce((sum, c) => sum + c.rows, 0);

  return (
    <>
      <PageTitle
        title="Backups"
        subtitle="Download a copy of everything in the database, and see when backups were taken."
        actions={
          // A plain link: the browser saves the file the endpoint returns.
          <a href="/api/admin/backup" className={buttonClass} download>
            ⬇ Download backup
          </a>
        }
      />

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <Card className="p-0 overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex items-baseline justify-between">
            <h2 className="font-bold text-ink">What a backup contains</h2>
            <span className="text-[0.8rem] text-slate">{total.toLocaleString("en-CA")} records</span>
          </div>
          <table className="w-full text-[0.86rem]">
            <thead>
              <tr className="text-left text-slate border-y border-border bg-cloud">
                <th className="px-6 py-2 font-semibold">Data</th>
                <th className="px-6 py-2 font-semibold text-right">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {counts.map((c) => (
                <tr key={c.name}>
                  <td className="px-6 py-2.5 text-ink">
                    {label(c.name)}
                    <span className="text-slate text-[0.75rem] ml-2">{c.name}</span>
                  </td>
                  <td className="px-6 py-2.5 text-right tabular-nums">{c.rows.toLocaleString("en-CA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-6 py-4 text-[0.78rem] text-slate border-t border-border">
            Sign-in sessions are never included, so a backup file can&apos;t be used to sign in. Store downloaded files
            somewhere private: they contain student names and family contact emails.
          </p>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="font-bold text-ink mb-2">Automatic nightly backups</h2>
            <p className="text-[0.85rem] text-slate">
              Every night a full export of the database is saved and kept for 30 days. Admins can also run one at any
              time from GitHub: <strong>Actions → Nightly database backup → Run workflow</strong>.
            </p>
            <a
              href="https://github.com/asam89/empower/actions/workflows/backup.yml"
              className="inline-block mt-3 text-[0.85rem] font-semibold text-brand-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              View nightly backups →
            </a>
          </Card>

          <Card>
            <h2 className="font-bold text-ink mb-3">Recent downloads</h2>
            {history.length === 0 ? (
              <p className="text-[0.85rem] text-slate">No backups downloaded yet.</p>
            ) : (
              <ul className="space-y-2 text-[0.85rem]">
                {history.map((h, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="text-ink truncate">
                      {h.email ? displayName({ name: h.name, email: h.email }) : "Admin (password login)"}
                    </span>
                    <span className="text-slate shrink-0">{formatDate(h.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
