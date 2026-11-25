import clsx from "clsx";
import {
  CalendarDays,
  CalendarRange,
  ChartPie,
  ClipboardCheck,
  DoorOpen,
  FileChartColumn,
  FileText,
  Globe,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  History,
  Inbox,
  Info,
  Landmark,
  LayoutDashboard,
  Megaphone,
  MoonStar,
  Package,
  Receipt,
  ShieldCheck,
  UserRoundPlus,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const ICONS: Record<string, LucideIcon> = {
  CalendarDays,
  CalendarRange,
  ChartPie,
  ClipboardCheck,
  DoorOpen,
  FileChartColumn,
  FileText,
  Globe,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  History,
  Inbox,
  Info,
  Landmark,
  LayoutDashboard,
  Megaphone,
  MoonStar,
  Package,
  Receipt,
  ShieldCheck,
  UserRoundPlus,
  Users,
  Wallet,
  Wrench,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Inbox;
  return <Cmp aria-hidden strokeWidth={1.5} className={clsx("size-5 shrink-0", className)} />;
}

type Variant = "primary" | "outline" | "ghost" | "danger";

export function buttonClass(variant: Variant = "primary", size: "sm" | "md" = "md") {
  return clsx(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,background-color,color,border-color,box-shadow] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "h-9 px-3.5 text-sm" : "h-11 px-5 text-sm",
    variant === "primary" && "bg-primary text-primary-foreground shadow-card hover:bg-primary-hover",
    variant === "outline" && "border border-border bg-card text-foreground hover:bg-surface",
    variant === "ghost" && "text-foreground hover:bg-surface",
    variant === "danger" && "border border-border bg-card text-danger hover:bg-surface",
  );
}

export function LinkButton({ variant, size, className, ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: "sm" | "md" }) {
  return <Link {...props} className={clsx(buttonClass(variant, size), className)} />;
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={clsx("rounded-lg border border-border bg-card p-5 shadow-card", className)} />;
}

const TONES = {
  neutral: "bg-surface-2 text-foreground",
  primary: "bg-primary-soft text-accent",
  success: "bg-surface-2 text-success",
  warning: "bg-surface-2 text-warning",
  danger: "bg-surface-2 text-danger",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[tone])}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** Tag pill kecil di atas judul section, dengan titik merah. */
export function SectionTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
      <span aria-hidden className="size-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}

/** Judul dua warna: kata kunci terakhir berwarna merah. */
export function PageHeader({ tag, title, accent, description, actions }: { tag?: string; title: string; accent?: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {tag ? <SectionTag>{tag}</SectionTag> : null}
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {title} {accent ? <span className="text-accent">{accent}</span> : null}
        </h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="no-print flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-surface text-muted">
        <Inbox aria-hidden strokeWidth={1.5} className="size-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted disabled:opacity-60";
export const textareaClass = "min-h-28 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground";
export const labelClass = "mb-1.5 block text-sm font-medium";
