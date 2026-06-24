"use client";

import Link from "next/link";
import { primaryNav } from "@/lib/site-data";

export function SiteNav() {
  return (
    <nav
      aria-label="主要导航"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/65 backdrop-blur-xl"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-4 gap-2 px-3 py-3 sm:px-6">
        {primaryNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium tracking-[0.12em] text-white/80 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
