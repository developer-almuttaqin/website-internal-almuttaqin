import type { Currency, Locale } from "./types";

export const TZ = "Asia/Tokyo";

const INTL_LOCALE: Record<Locale, string> = { id: "id-ID", en: "en-US", ja: "ja-JP" };

export function formatMoney(amount: number, currency: Currency, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale]).format(n);
}

/** Tanggal 'YYYY-MM-DD' atau ISO menjadi teks tanggal dalam zona Asia/Tokyo. */
export function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return "-";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+09:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: "medium", timeZone: TZ }).format(d);
}

export function formatDateTime(value: string | null | undefined, locale: Locale): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TZ,
  }).format(d);
}

/** 'YYYY-MM-DD' hari ini (atau tanggal tertentu) menurut Asia/Tokyo. */
export function dateJst(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function monthJst(d: Date = new Date()): string {
  return dateJst(d).slice(0, 7);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function addMonths(date: string, months: number): string {
  const [y, m, day] = date.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  const last = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return `${ny}-${String(nm).padStart(2, "0")}-${String(Math.min(day, last)).padStart(2, "0")}`;
}

export function prevMonth(ym: string): string {
  return addMonths(`${ym}-01`, -1).slice(0, 7);
}

/** Nilai input datetime-local (tanpa zona) dianggap waktu Asia/Tokyo. */
export function jstLocalToIso(local: string): string {
  return new Date(`${local.length === 16 ? `${local}:00` : local}+09:00`).toISOString();
}

export function isoToJstLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return parts.replace(" ", "T");
}
