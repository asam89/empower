import Link from "next/link";

const boards = ["TDSB", "YRDSB", "DDSB", "PDSB"];

const steps = [
  {
    num: "01",
    title: "Assess",
    desc: "We evaluate your school\u2019s current special education landscape, staffing, and student needs.",
    color: "text-brand-care",
  },
  {
    num: "02",
    title: "Design",
    desc: "Our team builds a structured, Ontario-aligned program framework tailored to your school.",
    color: "text-brand-primary",
  },
  {
    num: "03",
    title: "Implement",
    desc: "We deploy on-site specialists to bring the program to life alongside your staff.",
    color: "text-brand-accent",
  },
  {
    num: "04",
    title: "Support",
    desc: "Ongoing professional development, monitoring, and compliance guidance to sustain success.",
    color: "text-brand-care",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-primary text-white py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="text-[2.5rem] md:text-[3.2rem] font-bold leading-tight mb-6">
              Special education programs that{" "}
              <span className="text-brand-accent">empower every learner</span>
            </h1>
            <p className="text-[1.1rem] text-white/85 leading-relaxed mb-8 max-w-xl">
              Empower partners with Ontario schools and school boards to design,
              implement, and sustain compliant special education programs &mdash;
              so every student gets the support they deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/program-builder"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-accent text-white font-semibold rounded-xl text-[0.95rem] hover:bg-brand-accent/90 transition-colors"
              >
                Try the AI Program Builder
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl text-[0.95rem] hover:border-white/60 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div>
              <h2 className="text-[1.8rem] font-bold text-brand-primary mb-4">
                The challenge
              </h2>
              <p className="text-slate leading-relaxed">
                Many Ontario schools struggle with special education: inconsistent
                IPRC processes, under-resourced IEP development, staffing gaps, and
                compliance uncertainty. Students with exceptionalities deserve
                structured, expert-led support &mdash; but building that in-house is
                costly and complex.
              </p>
            </div>
            <div>
              <h2 className="text-[1.8rem] font-bold text-brand-primary mb-4">
                The Empower solution
              </h2>
              <p className="text-slate leading-relaxed">
                Empower deploys a specialist team that comes on-site and structures
                a complete special education program for your school. We handle
                program design, IPRC/IEP setup, staffing models, staff PD, parent
                engagement, and Ontario compliance &mdash; special education as a
                service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 md:py-28 bg-cloud">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.8rem] font-bold text-brand-primary mb-3 text-center">
            A stronger spec&nbsp;ed program grows your school
          </h2>
          <p className="text-slate text-center max-w-2xl mx-auto mb-14 leading-relaxed">
            When families know their children will be supported, they enrol &mdash;
            and stay. Empower helps you build the program that makes that possible.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Public schools */}
            <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary text-[1.3rem]">
                  🏫
                </span>
                <h3 className="text-[1.15rem] font-semibold">Public schools</h3>
              </div>
              <p className="text-slate leading-relaxed mb-5">
                In Ontario&apos;s funding model, <strong className="text-ink">more students means more
                per-pupil funding</strong> from the province. A well-structured special
                education program attracts families who need that support &mdash;
                increasing your head count and the resources that flow with it.
              </p>
              <div className="flex items-center gap-2 text-[0.85rem] font-medium text-brand-primary bg-brand-primary/5 rounded-lg px-4 py-3">
                <span className="text-[1.1rem]">&#8593;</span>
                Enrolment &rarr; funding &rarr; capacity to serve every learner
              </div>
            </div>

            {/* Private schools */}
            <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-accent/10 text-brand-accent text-[1.3rem]">
                  🌟
                </span>
                <h3 className="text-[1.15rem] font-semibold">Private &amp; independent schools</h3>
              </div>
              <p className="text-slate leading-relaxed mb-5">
                Families choosing private education expect excellence &mdash;
                including for children with learning differences.
                <strong className="text-ink"> More enrolled students means more tuition
                revenue and a larger support team.</strong> A credible spec&nbsp;ed
                program becomes a genuine differentiator.
              </p>
              <div className="flex items-center gap-2 text-[0.85rem] font-medium text-brand-accent bg-brand-accent/5 rounded-lg px-4 py-3">
                <span className="text-[1.1rem]">&#8593;</span>
                Enrolment &rarr; revenue &rarr; resources to support every child
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.8rem] font-bold text-brand-primary mb-3 text-center">
            Why schools choose Empower
          </h2>
          <p className="text-slate text-center max-w-2xl mx-auto mb-14 leading-relaxed">
            We don&apos;t just advise &mdash; we build and run your program with you.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🎯",
                title: "End-to-end delivery",
                desc: "From assessment to implementation, we own the entire program lifecycle — not just a report.",
              },
              {
                icon: "🇲",
                title: "Ontario expertise",
                desc: "IPRC, IEP, Reg\u00A0181/98, the five exceptionality categories — we know the framework inside out.",
              },
              {
                icon: "👥",
                title: "On-site specialists",
                desc: "Our team works alongside your staff, not from a remote office. Real presence, real results.",
              },
              {
                icon: "⚡",
                title: "AI-powered design",
                desc: "Our Program Builder generates a structured draft framework in minutes, accelerating the engagement.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-surface p-6 rounded-2xl border border-border shadow-sm text-center"
              >
                <span className="text-[2rem] block mb-3">{item.icon}</span>
                <h3 className="text-[1rem] font-semibold mb-2">{item.title}</h3>
                <p className="text-slate text-[0.85rem] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boards served */}
      <section className="py-16 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-[1.5rem] font-bold text-brand-primary mb-2">
            Serving Ontario&apos;s school boards
          </h2>
          <p className="text-slate mb-8 text-[0.95rem]">
            Public and private schools welcome
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {boards.map((board) => (
              <span
                key={board}
                className="px-6 py-3 bg-cloud border border-border rounded-xl text-brand-primary font-semibold text-[0.9rem]"
              >
                {board}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.8rem] font-bold text-brand-primary mb-12 text-center">
            How it works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-surface p-6 rounded-2xl border border-border shadow-sm"
              >
                <span className={`text-[2rem] font-bold ${step.color}`}>
                  {step.num}
                </span>
                <h3 className="text-[1.15rem] font-semibold mt-2 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate text-[0.9rem] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/how-it-works"
              className="text-brand-primary font-semibold text-[0.95rem] hover:underline"
            >
              Learn more about our process &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="py-20 bg-brand-primary text-white">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-[1.8rem] font-bold mb-4">
            Trusted by schools across Ontario
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-10 text-[0.95rem]">
            Testimonials and case studies coming soon. We&apos;re currently onboarding
            our first partner schools.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              "Program compliance confidence",
              "Reduced admin burden",
              "Better outcomes for students",
            ].map((item) => (
              <div
                key={item}
                className="bg-white/10 p-5 rounded-xl text-[0.9rem] font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-[1.8rem] font-bold text-brand-primary mb-4">
            Ready to build a better program?
          </h2>
          <p className="text-slate max-w-lg mx-auto mb-8">
            Use our AI Program Builder to get a free draft framework, or reach out
            to discuss how Empower can support your school.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/program-builder"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-accent text-white font-semibold rounded-xl text-[0.95rem] hover:bg-brand-accent/90 transition-colors"
            >
              Try the Program Builder
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-primary text-white font-semibold rounded-xl text-[0.95rem] hover:bg-brand-primary-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
