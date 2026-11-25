"use client";

import clsx from "clsx";
import { Globe, Loader2, LogOut, Menu, Moon, Printer, Sun, SunMoon, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition, type ReactNode } from "react";
import { logout, setLocale, setTheme } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/core";
import { buttonClass, inputClass } from "./ui";

/* ------------------------------ Navigasi ------------------------------ */

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" || href === "/web" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-primary-soft font-semibold text-accent" : "text-foreground hover:bg-surface",
      )}
    >
      {children}
    </Link>
  );
}

/** Di HP, sidebar menjadi drawer; tertutup otomatis saat berpindah halaman. */
export function MobileDrawer({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  return (
    <>
      <button type="button" aria-label={t("menu")} aria-expanded={open} onClick={() => setOpenAt(pathname)} className={clsx(buttonClass("outline", "sm"), "size-10 px-0 lg:hidden")}>
        <Menu aria-hidden strokeWidth={1.5} className="size-5" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t("menu")}>
          <button type="button" aria-label={t("close")} className="absolute inset-0 bg-hero/60" onClick={() => setOpenAt(null)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-background p-4 shadow-float">
            <button type="button" aria-label={t("close")} onClick={() => setOpenAt(null)} className={clsx(buttonClass("ghost", "sm"), "mb-2 size-10 self-end px-0")}>
              <X aria-hidden strokeWidth={1.5} className="size-5" />
            </button>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function TopControls({ initialTheme }: { initialTheme: "system" | "light" | "dark" }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();
  const cycle = ["system", "light", "dark"] as const;
  const [theme, setThemeState] = useState<(typeof cycle)[number]>(initialTheme);
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : SunMoon;
  const themeLabel = theme === "light" ? t("themeLight") : theme === "dark" ? t("themeDark") : t("themeSystem");

  return (
    <div className="flex items-center gap-2">
      <label className="relative flex items-center">
        <span className="sr-only">{t("language")}</span>
        <Globe aria-hidden strokeWidth={1.5} className="pointer-events-none absolute left-3 size-4 text-muted" />
        <select
          value={locale}
          disabled={pending}
          onChange={(e) => start(async () => { await setLocale(e.target.value); router.refresh(); })}
          className={clsx(inputClass, "h-10 w-auto rounded-full pl-9 pr-3")}
        >
          <option value="id">Indonesia</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
      </label>
      <button
        type="button"
        title={`${t("theme")}: ${themeLabel}`}
        aria-label={`${t("theme")}: ${themeLabel}`}
        onClick={() => {
          const next = cycle[(cycle.indexOf(theme) + 1) % cycle.length];
          setThemeState(next);
          if (next === "system") delete document.documentElement.dataset.theme;
          else document.documentElement.dataset.theme = next;
          void setTheme(next);
        }}
        className={clsx(buttonClass("outline", "sm"), "size-10 px-0")}
      >
        <ThemeIcon aria-hidden strokeWidth={1.5} className="size-5" />
      </button>
      <form action={logout}>
        <button type="submit" title={t("logout")} aria-label={t("logout")} className={clsx(buttonClass("outline", "sm"), "size-10 px-0")}>
          <LogOut aria-hidden strokeWidth={1.5} className="size-5" />
        </button>
      </form>
    </div>
  );
}

/* ------------------------------ Aksi ------------------------------ */

type Action<P> = (payload: P) => Promise<ActionResult>;

function useErrorText() {
  const t = useTranslations();
  return (key: string) => (t.has(key) ? t(key) : t("errors.internal"));
}

/** Tombol satu ketukan untuk Server Action (setujui, tolak, konfirmasi, hapus). */
export function ActionButton<P>({
  action,
  payload,
  children,
  variant = "outline",
  confirm,
  askNote,
}: {
  action: Action<P>;
  payload: P;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "danger";
  confirm?: string;
  /** Minta catatan singkat (mis. alasan penolakan) dan kirim sebagai `note`. */
  askNote?: string;
}) {
  const router = useRouter();
  const errorText = useErrorText();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        className={buttonClass(variant, "sm")}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          let data = payload;
          if (askNote) {
            const note = window.prompt(askNote);
            if (note === null) return;
            data = { ...payload, note };
          }
          setError(null);
          start(async () => {
            const result = await action(data);
            if (!result.ok) setError(errorText(result.error.message));
            else router.refresh();
          });
        }}
      >
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
        {children}
      </button>
      {error ? <span role="alert" className="text-xs text-danger">{error}</span> : null}
    </span>
  );
}

/** Formulir kecil untuk Server Action berbasis FormData (bayar, absensi, impor mutasi, surat). */
export function ActionForm({
  action,
  children,
  submitLabel,
  successText,
  redirectTo,
  className,
}: {
  action: (form: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel: string;
  /** Teks sukses; `{key}` diganti nilai dari hasil aksi. */
  successText?: string;
  /** Tujuan setelah sukses; `{id}` diganti id dari hasil aksi. */
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const errorText = useErrorText();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        setMessage(null);
        start(async () => {
          const result = await action(data);
          if (!result.ok) return setMessage({ ok: false, text: errorText(result.error.message) });
          const values = (result.data ?? {}) as Record<string, unknown>;
          const fill = (s: string) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""));
          if (redirectTo) return router.push(fill(redirectTo));
          if (successText) setMessage({ ok: true, text: fill(successText) });
          form.reset();
          router.refresh();
        });
      }}
    >
      {children}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass("primary", "sm")}>
          {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
          {submitLabel}
        </button>
        {message ? <p role={message.ok ? "status" : "alert"} className={clsx("text-sm", message.ok ? "text-success" : "text-danger")}>{message.text}</p> : null}
      </div>
    </form>
  );
}

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("outline", "sm")}>
      <Printer aria-hidden strokeWidth={1.5} className="size-4" />
      {label}
    </button>
  );
}
