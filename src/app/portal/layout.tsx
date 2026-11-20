import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { displayName } from "@/lib/portal";
import { Avatar } from "@/components/portal/ui";

export const runtime = "edge";

const ROLE_LABEL = { admin: "Admin", teacher: "Teacher", parent: "Family" } as const;

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const links =
    user.role === "parent"
      ? [{ href: "/portal", label: "My children" }]
      : [
          { href: "/portal", label: "Students" },
          { href: "/portal/schools", label: "Schools" },
          ...(user.role === "admin"
            ? [
                { href: "/portal/team", label: "Team" },
                { href: "/admin", label: "Leads" },
              ]
            : []),
        ];

  return (
    <div className="min-h-full">
      <div className="bg-brand-primary text-white">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Portal" className="flex flex-wrap items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="px-3 py-1.5 rounded-lg text-[0.85rem] font-medium hover:bg-white/15">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Avatar name={displayName(user)} size={30} />
            <span className="text-[0.82rem] hidden sm:inline">
              {displayName(user)} <span className="opacity-70">· {ROLE_LABEL[user.role]}</span>
            </span>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-[0.8rem] font-semibold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
