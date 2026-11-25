import type { ReactNode } from "react";
import { getLocale } from "@/lib/session";
import { getMosqueInfo } from "@/lib/mosque";
import { BrandLockup, LogoMark } from "./brand";

/** Kerangka halaman masuk dan pemasangan awal: panel maroon berpola seperti hero web publik, formulir di sisi lain. */
export async function AuthShell({ tag, titleA, titleB, subtitle, children }: { tag: string; titleA: string; titleB: string; subtitle: string; children: ReactNode }) {
  const mosque = await getMosqueInfo(await getLocale());
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="pattern-hero flex flex-col justify-between gap-10 p-8 sm:p-12">
        <BrandLockup name={mosque.name} subtitle={mosque.city} tone="inverse" />
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-hero-foreground/25 bg-hero-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <span aria-hidden className="size-1.5 rounded-full bg-hero-accent" />
            {tag}
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {titleA} <span className="text-hero-accent">{titleB}</span>
          </h1>
          <p className="mt-4 max-w-md text-hero-muted">{subtitle}</p>
        </div>
        <div className="text-xs text-hero-muted">
          <p className="font-semibold text-hero-foreground">
            {mosque.logoName} · {mosque.logoTagline}
          </p>
          <p className="mt-1">{mosque.tagline}</p>
          <p className="mt-1">pengurus-acc.online</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <LogoMark className="mb-6 size-14" />
          {children}
        </div>
      </section>
    </div>
  );
}
