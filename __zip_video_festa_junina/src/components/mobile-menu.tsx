"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export type MobileMenuLink = {
  href: string;
  label: string;
};

export function MobileMenu({ links }: { links: MobileMenuLink[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm ring-1 ring-amber-200"
        aria-expanded={isOpen}
        aria-controls="mobile-site-menu"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        Menu
      </button>

      {isOpen ? (
        <div
          id="mobile-site-menu"
          className="absolute inset-x-3 top-[4.25rem] z-50 rounded-3xl border border-amber-200 bg-amber-50 p-3 shadow-xl"
        >
          <nav className="grid gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                prefetch={false}
                className="rounded-2xl bg-white px-4 py-3 text-base font-black text-green-950 shadow-sm transition hover:bg-amber-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
