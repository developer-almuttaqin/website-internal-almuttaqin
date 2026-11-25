import clsx from "clsx";
import Image from "next/image";

/**
 * Logo resmi Masjid Al Muttaqin Chiba (kubah tiga), sama dengan web publik. `tone="inverse"` memakai
 * versi cream untuk latar gelap; selain itu versi maroon di mode terang dan cream di mode gelap.
 */
export function LogoMark({ className, tone = "default" }: { className?: string; tone?: "default" | "inverse" }) {
  const box = clsx("relative inline-block size-10 shrink-0", className);
  if (tone === "inverse")
    return (
      <span className={box} aria-hidden>
        <Image src="/images/brand/logo-mark-light.png" alt="" fill sizes="64px" unoptimized loading="eager" className="object-contain" />
      </span>
    );
  return (
    <span className={box} aria-hidden>
      <Image src="/images/brand/logo-mark.png" alt="" fill sizes="64px" unoptimized loading="eager" className="logo-on-light object-contain" />
      <Image src="/images/brand/logo-mark-light.png" alt="" fill sizes="64px" unoptimized loading="eager" className="logo-on-dark object-contain" />
    </span>
  );
}

/** Logo dengan nama, seperti di header web publik. */
export function BrandLockup({ name, subtitle, tone = "default" }: { name: string; subtitle?: string; tone?: "default" | "inverse" }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <LogoMark tone={tone} />
      <span className="flex min-w-0 flex-col">
        <span className={clsx("text-sm font-bold leading-tight", tone === "inverse" ? "text-hero-foreground sm:text-base" : "text-accent")}>{name}</span>
        {subtitle ? <span className={clsx("mt-0.5 truncate text-[0.62rem] font-semibold uppercase leading-normal tracking-[0.14em]", tone === "inverse" ? "text-hero-muted" : "text-muted")}>{subtitle}</span> : null}
      </span>
    </span>
  );
}
