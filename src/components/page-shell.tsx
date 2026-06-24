"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { SiteNav } from "./site-nav";

type PageShellProps = {
  title: string;
  kicker: string;
  description: string;
  children: ReactNode;
};

export function PageShell({ title, kicker, description, children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,178,102,0.16),_transparent_30%),linear-gradient(180deg,_#101010_0%,_#050505_100%)] pb-24 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-medium tracking-[0.14em] text-white/65">
            候鸟逐日
          </Link>
          <p className="text-xs tracking-[0.18em] text-white/45">{kicker}</p>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{description}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/6 p-5 text-sm leading-7 text-white/70 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur">
            {children}
          </div>
        </section>
      </div>
      <SiteNav />
    </main>
  );
}
