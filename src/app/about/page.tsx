import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Empower",
  description:
    "Meet the Empower team: special education specialists dedicated to building effective, compliant programs for Ontario schools.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-primary text-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-[2.2rem] md:text-[2.8rem] font-bold mb-4">
            About Empower
          </h1>
          <p className="text-white/80 max-w-xl text-[1.05rem]">
            We believe every school can deliver exceptional special education. Our
            mission is to make that possible.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div>
              <h2 className="text-[1.5rem] font-bold text-brand-primary mb-4">
                Our mission
              </h2>
              <p className="text-slate leading-relaxed mb-6">
                Empower exists to close the gap between what Ontario&apos;s special
                education framework promises and what schools can realistically
                deliver. Too many schools lack the in-house expertise to build
                structured programs that meet compliance requirements while
                genuinely serving students with exceptionalities.
              </p>
              <p className="text-slate leading-relaxed">
                We bring a team of special education specialists directly into your
                school — assessing needs, designing a comprehensive program,
                training your staff, and staying on as long-term partners. The
                result: a program that works for your students, your staff, and
                your community.
              </p>
            </div>
            <div>
              <h2 className="text-[1.5rem] font-bold text-brand-primary mb-4">
                Why Empower
              </h2>
              <ul className="space-y-4">
                {[
                  "Deep expertise in Ontario special education policy and practice",
                  "On-site, hands-on approach \u2014 not just reports and recommendations",
                  "Programs grounded in the IPRC process, IEP development, and tiered support models",
                  "Commitment to WCAG accessibility in everything we do",
                  "AI-powered tools to accelerate program design while maintaining human oversight",
                  "Serving TDSB, YRDSB, DDSB, PDSB, and private schools across Ontario",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[0.9rem] text-ink"
                  >
                    <span
                      className="text-brand-care mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    >
                      &#10003;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team placeholder */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.5rem] font-bold text-brand-primary mb-8 text-center">
            Our team
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Team Member",
                role: "Special Education Lead",
              },
              {
                name: "Team Member",
                role: "Program Consultant",
              },
              {
                name: "Team Member",
                role: "Compliance Specialist",
              },
            ].map((member, i) => (
              <div
                key={i}
                className="bg-cloud rounded-2xl border border-border p-6 text-center"
              >
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-brand-primary text-[1.5rem] font-bold">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-ink">{member.name}</h3>
                <p className="text-slate text-[0.85rem]">{member.role}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-slate text-[0.85rem] mt-6">
            Team bios and photos coming soon.
          </p>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.5rem] font-bold text-brand-primary mb-4">
            Let&apos;s build something great together
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-primary text-white font-semibold rounded-xl text-[0.95rem] hover:bg-brand-primary-700 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
