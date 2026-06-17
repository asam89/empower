import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Schools — Empower",
  description:
    "Empower embeds a full special education program inside your private or independent school — attracting more families, increasing enrollment, and building inclusive excellence.",
};

const programPillars = [
  {
    title: "Identification & Assessment",
    desc: "Structured screening and assessment protocols modelled on Ontario\u2019s IPRC process, adapted for independent school governance. We identify students who need support early \u2014 before they fall behind or families look elsewhere.",
    icon: "\uD83D\uDD0D",
  },
  {
    title: "Tiered Support Model",
    desc: "A three-tier framework (universal, targeted, intensive) so every student receives the right level of support. Classroom teachers handle Tier 1 with differentiated instruction; Tier 2 adds small-group intervention; Tier 3 delivers individualized programming.",
    icon: "\uD83C\uDFAF",
  },
  {
    title: "Individualized Learning Plans",
    desc: "Formal ILPs for students with identified needs \u2014 written collaboratively with teachers, parents, and specialists. Clear goals, accommodations, and review cycles that families can see and trust.",
    icon: "\uD83D\uDCCB",
  },
  {
    title: "Specialist Staffing",
    desc: "We embed a dedicated Special Education Resource Teacher (SERT) and coordinate access to educational psychologists, speech-language pathologists, and occupational therapists. Your school gets a full clinical team without full-time overhead.",
    icon: "\uD83D\uDC65",
  },
  {
    title: "Staff Professional Development",
    desc: "Ongoing PD for your teaching team: differentiated instruction, behaviour strategies, assistive technology, and understanding exceptionalities. Every educator becomes part of the support system.",
    icon: "\uD83D\uDCDA",
  },
  {
    title: "Parent Communication & Reporting",
    desc: "Transparent, structured communication with families about their child\u2019s progress. Regular ILP reviews, parent workshops, and a dedicated point of contact. This is the experience that builds loyalty and referrals.",
    icon: "\uD83D\uDCAC",
  },
];

const integrationSteps = [
  {
    phase: "Discovery",
    timeline: "Weeks 1\u20132",
    desc: "We meet your leadership team to understand your school\u2019s culture, student population, existing supports, and goals. We review enrollment data, withdrawal patterns, and parent feedback to identify where a spec\u00A0ed program would have the greatest impact.",
    outcome: "Needs assessment report with recommendations",
  },
  {
    phase: "Program Design",
    timeline: "Weeks 3\u20135",
    desc: "Our lead consultant designs a tailored program framework: screening protocols, tiered support model, staffing plan, ILP templates, and parent communication strategy. Everything is built around your school\u2019s schedule, class sizes, and budget.",
    outcome: "Complete program framework document",
  },
  {
    phase: "Team Deployment",
    timeline: "Weeks 6\u20138",
    desc: "Empower\u2019s embedded SERT arrives on-site. We onboard your teaching staff through hands-on PD sessions, set up the assessment and ILP systems, and begin student screenings. The SERT becomes part of your school community.",
    outcome: "SERT on-site, systems live, staff trained",
  },
  {
    phase: "Full Operation",
    timeline: "Weeks 9\u201316",
    desc: "The program runs at full capacity: student support plans active, intervention groups meeting, specialist referrals flowing, and parents receiving regular updates. We track progress data from day one.",
    outcome: "Active support for all identified students",
  },
  {
    phase: "Ongoing Partnership",
    timeline: "Continuous",
    desc: "Quarterly program reviews with your leadership. We adjust staffing, update training, and refine protocols based on real outcomes. As your enrollment grows, we scale the program with you.",
    outcome: "Evolving program that grows with your school",
  },
];

const teamRoles = [
  {
    role: "Lead Consultant",
    desc: "An experienced special education leader who designs your program, leads the engagement, and stays involved as your strategic advisor. They bring 10+ years of Ontario spec\u00A0ed experience.",
  },
  {
    role: "Embedded SERT",
    desc: "A full-time or part-time Special Education Resource Teacher placed at your school. They run assessments, write ILPs, coach teachers, coordinate specialists, and serve as the daily face of the program.",
  },
  {
    role: "Clinical Specialists",
    desc: "Educational psychologists, speech-language pathologists, and occupational therapists available on a scheduled basis. We manage the referral pipeline so your staff doesn\u2019t have to.",
  },
  {
    role: "PD Facilitators",
    desc: "Trainers who deliver professional development workshops to your teaching team throughout the year \u2014 building internal capacity so your school isn\u2019t dependent on Empower long-term.",
  },
];

export default function PrivateSchoolsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-primary text-white py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-2xl">
            <span className="inline-block text-brand-accent font-semibold text-[0.85rem] tracking-wide uppercase mb-4">
              For Private &amp; Independent Schools
            </span>
            <h1 className="text-[2.2rem] md:text-[3rem] font-bold leading-tight mb-6">
              Embed a complete spec&nbsp;ed program{" "}
              <span className="text-brand-accent">inside your school</span>
            </h1>
            <p className="text-[1.05rem] text-white/85 leading-relaxed mb-8 max-w-xl">
              Families choose schools that support every learner. Empower builds
              and runs a structured special education program at your school &mdash;
              so you can attract more families, retain more students, and deliver
              on your promise of inclusive excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/program-builder"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-accent text-white font-semibold rounded-xl text-[0.95rem] hover:bg-brand-accent/90 transition-colors"
              >
                Get a Free Program Draft
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl text-[0.95rem] hover:border-white/60 transition-colors"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Business Case */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.8rem] font-bold text-brand-primary mb-3 text-center">
            The enrollment equation
          </h2>
          <p className="text-slate text-center max-w-2xl mx-auto mb-14 leading-relaxed">
            For private schools, a strong spec&nbsp;ed program isn&apos;t just the right
            thing to do &mdash; it&apos;s a growth strategy.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-surface p-7 rounded-2xl border border-border shadow-sm text-center">
              <span className="text-[2.5rem] block mb-3">&#128101;</span>
              <h3 className="text-[1.05rem] font-bold text-ink mb-2">
                Attract more families
              </h3>
              <p className="text-slate text-[0.85rem] leading-relaxed">
                Parents of children with learning differences actively search for
                schools with credible support. A structured program makes you
                their first choice.
              </p>
            </div>
            <div className="bg-surface p-7 rounded-2xl border border-border shadow-sm text-center">
              <span className="text-[2.5rem] block mb-3">&#128200;</span>
              <h3 className="text-[1.05rem] font-bold text-ink mb-2">
                Increase enrollment &amp; revenue
              </h3>
              <p className="text-slate text-[0.85rem] leading-relaxed">
                More enrolled students means more tuition revenue. That revenue
                funds a larger support team, better resources, and a program that
                keeps growing.
              </p>
            </div>
            <div className="bg-surface p-7 rounded-2xl border border-border shadow-sm text-center">
              <span className="text-[2.5rem] block mb-3">&#10084;&#65039;</span>
              <h3 className="text-[1.05rem] font-bold text-ink mb-2">
                Retain students &amp; build loyalty
              </h3>
              <p className="text-slate text-[0.85rem] leading-relaxed">
                Families leave when their child isn&apos;t supported. A real
                program keeps students enrolled year after year &mdash; and
                generates word-of-mouth referrals.
              </p>
            </div>
          </div>

          <div className="mt-12 max-w-2xl mx-auto bg-brand-accent/5 border border-brand-accent/20 rounded-xl p-6 text-center">
            <p className="text-[0.95rem] text-ink leading-relaxed font-medium">
              <span className="text-brand-accent">&#8593; Enrollment</span>{" "}
              &rarr; <span className="text-brand-accent">&#8593; Tuition revenue</span>{" "}
              &rarr; <span className="text-brand-accent">&#8593; Program resources</span>{" "}
              &rarr; <span className="text-brand-accent">&#8593; More families choose you</span>
            </p>
            <p className="text-slate text-[0.8rem] mt-2">
              It&apos;s a virtuous cycle. Empower helps you start it.
            </p>
          </div>
        </div>
      </section>

      {/* What the Program Looks Like */}
      <section className="py-20 md:py-28 bg-cloud">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.8rem] font-bold text-brand-primary mb-3 text-center">
            What the program looks like
          </h2>
          <p className="text-slate text-center max-w-2xl mx-auto mb-14 leading-relaxed">
            A complete special education program embedded inside your school, with
            six core pillars.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {programPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col"
              >
                <span className="text-[1.8rem] mb-3" role="img" aria-hidden="true">
                  {pillar.icon}
                </span>
                <h3 className="text-[1.05rem] font-bold text-ink mb-2">
                  {pillar.title}
                </h3>
                <p className="text-slate text-[0.85rem] leading-relaxed flex-1">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Process */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.8rem] font-bold text-brand-primary mb-3 text-center">
            The integration process
          </h2>
          <p className="text-slate text-center max-w-2xl mx-auto mb-14 leading-relaxed">
            We don&apos;t disrupt your school &mdash; we integrate seamlessly.
            Here&apos;s what the first few months look like.
          </p>

          <div className="space-y-6 max-w-3xl mx-auto">
            {integrationSteps.map((step, i) => (
              <div
                key={step.phase}
                className="bg-surface rounded-2xl border border-border p-6 md:p-8 shadow-sm"
              >
                <div className="flex items-start gap-4 mb-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white text-[0.85rem] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-[1.15rem] font-bold text-ink">
                      {step.phase}
                    </h3>
                    <p className="text-slate text-[0.8rem]">{step.timeline}</p>
                  </div>
                </div>
                <p className="text-slate text-[0.88rem] leading-relaxed mb-3 ml-14">
                  {step.desc}
                </p>
                <div className="ml-14 flex items-center gap-2 text-[0.8rem] text-brand-care font-medium">
                  <span aria-hidden="true">&#10003;</span>
                  {step.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Leads the Program */}
      <section className="py-20 md:py-28 bg-cloud">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.8rem] font-bold text-brand-primary mb-3 text-center">
            Who leads the program
          </h2>
          <p className="text-slate text-center max-w-2xl mx-auto mb-14 leading-relaxed">
            Empower doesn&apos;t just consult &mdash; we place real people in your
            school who become part of your community.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {teamRoles.map((member) => (
              <div
                key={member.role}
                className="bg-surface rounded-2xl border border-border p-6 shadow-sm"
              >
                <h3 className="text-[1.05rem] font-bold text-brand-primary mb-2">
                  {member.role}
                </h3>
                <p className="text-slate text-[0.85rem] leading-relaxed">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-[1.8rem] font-bold text-brand-primary mb-12">
            Why private schools choose Empower
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            {[
              {
                title: "Embedded, not outsourced",
                desc: "Our SERT is at your school every day \u2014 attending meetings, coaching teachers, building relationships with families. They\u2019re part of your team.",
              },
              {
                title: "No upfront infrastructure",
                desc: "You don\u2019t need to hire a spec\u00A0ed department or build systems from scratch. We bring the team, the tools, and the framework \u2014 ready to go.",
              },
              {
                title: "Built for independence",
                desc: "We train your staff so your school builds internal capacity over time. The goal is a self-sustaining program, not permanent dependency on Empower.",
              },
              {
                title: "Ontario-aligned",
                desc: "Our frameworks follow the Ontario special education model (IPRC, IEP, five exceptionality categories) even though private schools aren\u2019t bound by Reg\u00A0181/98. Parents trust programs that meet public standards.",
              },
              {
                title: "Scales with enrollment",
                desc: "As your student body grows, we grow with you \u2014 adding specialist hours, expanding PD, and deepening the program. No renegotiation required.",
              },
              {
                title: "Measurable outcomes",
                desc: "We track student progress, parent satisfaction, and program metrics from day one. You\u2019ll see the impact in data, not just anecdotes.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-surface p-5 rounded-2xl border border-border shadow-sm"
              >
                <h3 className="text-[0.95rem] font-bold text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-slate text-[0.82rem] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-brand-primary text-white text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.8rem] font-bold mb-4">
            Ready to build your school&apos;s spec&nbsp;ed program?
          </h2>
          <p className="text-white/75 max-w-lg mx-auto mb-8">
            Get a free AI-generated program framework in minutes, or book a call
            with our team to discuss what Empower could look like at your school.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/program-builder"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-accent text-white font-semibold rounded-xl text-[0.95rem] hover:bg-brand-accent/90 transition-colors"
            >
              Get a Free Program Draft
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl text-[0.95rem] hover:border-white/60 transition-colors"
            >
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
