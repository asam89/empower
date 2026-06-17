import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — Empower",
  description:
    "Empower delivers program design, IPRC/IEP process setup, staffing models, professional development, parent engagement, and Ontario compliance for special education.",
};

const services = [
  {
    title: "Program Design",
    desc: "A complete special education program framework tailored to your school\u2019s size, population, and goals \u2014 aligned with Ontario\u2019s five exceptionality categories and tiered support models.",
    color: "bg-brand-primary",
  },
  {
    title: "IPRC & IEP Process Setup",
    desc: "We design and implement Identification, Placement and Review Committee workflows and Individual Education Plan development processes that meet Education Act and Reg 181/98 expectations.",
    color: "bg-brand-care",
  },
  {
    title: "Staffing Models",
    desc: "Recommendations for Special Education Resource Teachers (SERTs), Educational Assistants, and specialist access (psychology, speech-language pathology) with clear role definitions and coordination structures.",
    color: "bg-brand-primary",
  },
  {
    title: "Staff Professional Development",
    desc: "Targeted PD sessions for educators and support staff on differentiated instruction, behaviour strategies, assistive technology, and special education best practices.",
    color: "bg-brand-accent",
  },
  {
    title: "Parent & Community Engagement",
    desc: "Strategies for meaningful parent/guardian involvement, SEAC (Special Education Advisory Committee) engagement, and transparent communication frameworks.",
    color: "bg-brand-care",
  },
  {
    title: "Ontario Compliance",
    desc: "Compliance audit and checklist covering the Education Act, Regulation 181/98, relevant Policy/Program Memoranda (PPMs), and accessibility standards. Peace of mind for your administration.",
    color: "bg-brand-primary",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="bg-brand-primary text-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-[2.2rem] md:text-[2.8rem] font-bold mb-4">
            Our services
          </h1>
          <p className="text-white/80 max-w-xl text-[1.05rem]">
            Empower delivers end-to-end special education program services. We
            bring the expertise; you keep your focus on students.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col"
              >
                <div
                  className={`w-10 h-10 ${svc.color} rounded-lg mb-4`}
                  aria-hidden="true"
                />
                <h2 className="text-[1.1rem] font-bold text-ink mb-2">
                  {svc.title}
                </h2>
                <p className="text-slate text-[0.88rem] leading-relaxed flex-1">
                  {svc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[1.5rem] font-bold text-brand-primary mb-4">
            Want a preview of your program?
          </h2>
          <p className="text-slate mb-8 max-w-lg mx-auto">
            Our AI Program Builder generates a draft special education framework
            based on your school&apos;s profile. It&apos;s free and takes just a
            few minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/program-builder"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-accent text-white font-semibold rounded-xl text-[0.95rem] hover:bg-brand-accent/90 transition-colors"
            >
              Build Your Program
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
