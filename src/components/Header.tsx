"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/services", label: "Services" },
  { href: "/program-builder", label: "Program Builder" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[72px]">
        <Link
          href="/"
          className="text-brand-primary font-bold text-[1.4rem] tracking-tight"
        >
          Empower
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate text-[0.9rem] font-medium hover:text-brand-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/program-builder"
            className="ml-2 inline-flex items-center px-5 py-2.5 bg-brand-accent text-white text-[0.85rem] font-semibold rounded-xl hover:bg-brand-accent/90 transition-colors"
          >
            Build Your Program
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="md:hidden p-2 text-ink"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden bg-surface border-t border-border px-6 py-4"
        >
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-slate text-[0.95rem] font-medium py-2 hover:text-brand-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/program-builder"
                className="inline-flex items-center px-5 py-2.5 bg-brand-accent text-white text-[0.85rem] font-semibold rounded-xl mt-2"
                onClick={() => setMobileOpen(false)}
              >
                Build Your Program
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
