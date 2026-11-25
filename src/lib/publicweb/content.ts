/**
 * Bentuk konten web publik (almuttaqinculturalcenter.org): teks tiga bahasa { ja, en, id } dan
 * isi panjang berupa blok. Fungsi di sini murni (tanpa akses database) agar mudah diuji.
 */
export const PUB_LOCALES = ["id", "en", "ja"] as const;
export type PubLocale = (typeof PUB_LOCALES)[number];
export type L10n = Record<PubLocale, string>;

export type ContentBlock =
  | { type: "p" | "h2" | "h3"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; title?: string; text: string; tone?: string }
  | { type: "arabic"; text: string; translation?: string };
export type L10nBlocks = Record<PubLocale, ContentBlock[]>;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Baca teks tiga bahasa dari nilai apa pun; bahasa yang tidak ada menjadi teks kosong. */
export function readL10n(value: unknown): L10n {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return { id: str(v.id), en: str(v.en), ja: str(v.ja) };
}

/**
 * Pengurus cukup menulis satu bahasa: bahasa yang dikosongkan diisi dari bahasa Indonesia
 * (lalu Inggris, lalu Jepang) supaya pengunjung tidak melihat bagian kosong. Null bila semua kosong.
 */
export function fillL10n(value: L10n): L10n | null {
  const fallback = value.id || value.en || value.ja;
  if (!fallback) return null;
  return { id: value.id || fallback, en: value.en || fallback, ja: value.ja || fallback };
}

/** Teks untuk bahasa antarmuka; jatuh ke Indonesia, Inggris, lalu Jepang. */
export function pickL10n(value: unknown, locale: string): string {
  const v = readL10n(value);
  return v[locale as PubLocale] || v.id || v.en || v.ja;
}

/** Teks polos menjadi blok: baris kosong memisahkan paragraf, baris berawalan "- " menjadi daftar. */
export function textToBlocks(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const chunk of text.replace(/\r\n?/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every((l) => /^[-*]\s+/.test(l))) blocks.push({ type: "ul", items: lines.map((l) => l.replace(/^[-*]\s+/, "")) });
    else blocks.push({ type: "p", text: lines.join("\n") });
  }
  return blocks;
}

export function blocksToText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  return (blocks as ContentBlock[])
    .map((b) => {
      if (!b || typeof b !== "object") return "";
      if ("items" in b) return (b.items ?? []).map((i) => `- ${i}`).join("\n");
      if (b.type === "callout") return [b.title, b.text].filter(Boolean).join("\n");
      return b.text ?? "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export function readBlocksText(value: unknown): L10n {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return { id: blocksToText(v.id), en: blocksToText(v.en), ja: blocksToText(v.ja) };
}

/**
 * Isi panjang dari tiga kolom teks. Bila teks sebuah bahasa tidak diubah, blok aslinya dipertahankan
 * agar format yang dibuat di panel admin web publik (judul, kutipan, sorotan) tidak hilang.
 */
export function writeBlocks(text: L10n, previous: unknown): L10nBlocks {
  const prev = (previous && typeof previous === "object" ? previous : {}) as Record<string, unknown>;
  const filled = fillL10n(text) ?? { id: "", en: "", ja: "" };
  const out = {} as L10nBlocks;
  for (const l of PUB_LOCALES) {
    const before = Array.isArray(prev[l]) ? (prev[l] as ContentBlock[]) : null;
    out[l] = before && blocksToText(before) === filled[l] ? before : textToBlocks(filled[l]);
  }
  return out;
}

/** Ringkasan satu kalimat dari isi, dipakai bila pengurus tidak menulis ringkasan sendiri. */
export function excerptOf(text: string, max = 160): string {
  const flat = text.replace(/^- /gm, "").replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 30)).trimEnd()}...`;
}

export function excerptL10n(body: L10n): L10n | null {
  const filled = fillL10n(body);
  return filled ? { id: excerptOf(filled.id), en: excerptOf(filled.en), ja: excerptOf(filled.ja) } : null;
}

/** Slug URL huruf kecil a-z, 0-9, dan tanda hubung; teks non-Latin menghasilkan teks kosong. */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export function uniqueSlug(text: string, taken: Iterable<string>, fallback = "item"): string {
  const used = new Set(taken);
  const base = slugify(text) || fallback;
  if (!used.has(base)) return base;
  for (let i = 2; ; i++) if (!used.has(`${base}-${i}`)) return `${base}-${i}`;
}

/* ------------------------------ Laporan transparansi ------------------------------ */

export interface StatementLineItem {
  category: string;
  amount: number;
}

export interface MonthlyStatement {
  opening: number;
  closing: number;
  income: StatementLineItem[];
  expense: StatementLineItem[];
}

interface AccountLike {
  id: string;
  currency: string;
  opening_balance: number;
}
interface EntryLike {
  account_id: string;
  currency: string;
  entry_date: string;
  type: "in" | "out";
  category: string;
  amount: number;
}

/**
 * Ringkasan satu bulan untuk SATU mata uang: saldo awal, pemasukan dan pengeluaran per kategori,
 * saldo akhir. Yen dan Rupiah tidak pernah dijumlahkan.
 */
export function monthlyStatement(accounts: AccountLike[], entries: EntryLike[], month: string, currency: string): MonthlyStatement {
  const accountIds = new Set(accounts.filter((a) => a.currency === currency).map((a) => a.id));
  let opening = accounts.filter((a) => a.currency === currency).reduce((s, a) => s + (Number(a.opening_balance) || 0), 0);
  const income = new Map<string, number>();
  const expense = new Map<string, number>();
  for (const e of entries) {
    if (e.currency !== currency || !accountIds.has(e.account_id)) continue;
    const ym = e.entry_date.slice(0, 7);
    const amount = Number(e.amount) || 0;
    if (ym < month) opening += e.type === "in" ? amount : -amount;
    else if (ym === month) {
      const map = e.type === "in" ? income : expense;
      map.set(e.category, (map.get(e.category) ?? 0) + amount);
    }
  }
  const list = (m: Map<string, number>) => [...m].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  const sum = (m: Map<string, number>) => [...m.values()].reduce((s, n) => s + n, 0);
  return { opening, closing: opening + sum(income) - sum(expense), income: list(income), expense: list(expense) };
}

const INTL: Record<PubLocale, string> = { id: "id-ID", en: "en-US", ja: "ja-JP" };

export function monthLabel(month: string, locale: PubLocale): string {
  return new Intl.DateTimeFormat(INTL[locale], { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
}

/** Bentuk `TransparencyReport` web publik (koleksi transparency_reports) dari ringkasan kas internal. */
export function transparencyData(
  month: string,
  statement: MonthlyStatement,
  categoryLabel: (category: string) => L10n,
  previous: Record<string, unknown> | null,
  publishedAt: string,
): Record<string, unknown> {
  const lines = (items: StatementLineItem[]) => items.map((i) => ({ label: categoryLabel(i.category), amount: i.amount }));
  return {
    ...(previous ?? {}),
    period: month,
    currency: "JPY",
    title: {
      id: `Laporan keuangan ${monthLabel(month, "id")}`,
      en: `Financial report, ${monthLabel(month, "en")}`,
      ja: `${monthLabel(month, "ja")} 会計報告`,
    },
    openingBalance: statement.opening,
    closingBalance: statement.closing,
    income: lines(statement.income),
    expense: lines(statement.expense),
    publishedAt: typeof previous?.publishedAt === "string" ? previous.publishedAt : publishedAt,
  };
}
