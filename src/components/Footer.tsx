import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink text-cloud py-16" role="contentinfo">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="font-bold text-[1.2rem] text-white mb-3">Empower</p>
            <p className="text-[0.85rem] text-cloud/70 leading-relaxed">
              Special education program consulting for Ontario schools and school
              boards. Structured programs that serve every learner.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-[0.9rem]">Quick Links</p>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/how-it-works", label: "How It Works" },
                { href: "/services", label: "Services" },
                { href: "/program-builder", label: "Program Builder" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cloud/70 text-[0.85rem] hover:text-brand-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-[0.9rem]">
              Boards We Serve
            </p>
            <ul className="flex flex-col gap-1 text-cloud/70 text-[0.85rem]">
              <li>Toronto District School Board (TDSB)</li>
              <li>York Region DSB (YRDSB)</li>
              <li>Durham DSB (DDSB)</li>
              <li>Peel DSB (PDSB)</li>
              <li>Public &amp; Private Schools</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[0.8rem] text-cloud/50">
          <p>&copy; {new Date().getFullYear()} Empower. All rights reserved.</p>
          <Link href="/privacy" className="hover:text-cloud transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
