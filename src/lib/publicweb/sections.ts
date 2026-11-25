import { dateJst } from "../format";
import type { Module } from "../permissions";
import { excerptL10n, readBlocksText, readL10n, writeBlocks, type L10n } from "./content";

/**
 * Bagian web publik yang bisa diubah dari web internal. Setiap bagian menunjuk ke satu tempat di
 * database web publik: sebuah tabel, sebuah koleksi di `content_items`, atau satu pengaturan di
 * `site_settings`. Menambah isian cukup dengan menambah kolom di sini.
 */
export type PubFieldType = "text" | "textarea" | "number" | "date" | "time" | "datetime" | "select" | "bool" | "ltext" | "ltextarea" | "lblocks";

export interface PubField {
  name: string;
  type: PubFieldType;
  required?: boolean;
  options?: readonly string[];
  /** Tampil di daftar. */
  list?: boolean;
  /** Nilai awal formulir baru. */
  initial?: string;
}

export type PubValues = Record<string, unknown>;
type Row = Record<string, unknown>;

export interface PubSection {
  /** Segmen URL: /web/<key>. */
  key: string;
  module: Module;
  kind: "table" | "collection" | "setting";
  /** Nama tabel, nama koleksi di content_items, atau kunci di site_settings. */
  source: string;
  icon: string;
  titleField: string;
  fields: PubField[];
  sort?: [string, "asc" | "desc"];
  /** Halaman web publik yang disegarkan setelah disimpan (tanpa awalan bahasa). */
  paths: string[];
  /** Halaman web publik untuk tombol "Lihat di web". */
  publicPath: string;
  /** Kolom sumber slug / kunci item saat membuat baru. */
  keyFrom?: string;
  /** Nilai logis untuk formulir dan daftar dari baris tersimpan (untuk koleksi/pengaturan: isi `data`/`value`). */
  read?: (stored: Row) => PubValues;
  /** Baris yang disimpan dari nilai formulir; `prev` adalah baris lama saat mengubah. */
  write: (values: PubValues, prev: Row | null) => Row;
  /** Kunci pesan kesalahan bila nilai tidak masuk akal. */
  validate?: (values: PubValues) => string | null;
}

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const l = (v: unknown) => (v as L10n | null) ?? null;
/** Kolom opsional di koleksi: dihapus bila kosong, karena tipe web publik memakai `undefined`, bukan null. */
function optional(target: Row, values: PubValues, names: string[]) {
  for (const name of names) {
    if (values[name] === null || values[name] === undefined || values[name] === "") delete target[name];
    else target[name] = values[name];
  }
  return target;
}

export const PUB_SECTIONS: PubSection[] = [
  {
    key: "jumat",
    module: "jumat",
    kind: "table",
    source: "jumuah_schedules",
    icon: "MoonStar",
    titleField: "date",
    sort: ["date", "desc"],
    paths: ["", "/jumuah", "/prayer-times", "/app", "/app/prayer"],
    publicPath: "/jumuah",
    fields: [
      { name: "date", type: "date", required: true, list: true },
      { name: "time", type: "time", required: true, list: true, initial: "12:30" },
      { name: "khatib", type: "text", required: true, list: true },
      { name: "imam", type: "text", required: true, list: true },
      { name: "language", type: "select", options: ["mixed", "id", "ja", "en", "ar"], required: true, initial: "mixed" },
      { name: "topic", type: "ltext", list: true },
      { name: "note", type: "ltext" },
      { name: "published", type: "bool", list: true, initial: "true" },
    ],
    write: (v) => ({ date: v.date, time: v.time, khatib: v.khatib, imam: v.imam, language: v.language, topic: l(v.topic), note: l(v.note), published: Boolean(v.published) }),
    validate: (v) => (new Date(`${String(v.date)}T00:00:00Z`).getUTCDay() === 5 ? null : "web.errors.notFriday"),
  },
  {
    key: "pengumuman",
    module: "pengumuman",
    kind: "table",
    source: "announcements",
    icon: "Megaphone",
    titleField: "title",
    sort: ["created_at", "desc"],
    paths: ["", "/news", "/app", "/app/info"],
    publicPath: "/",
    keyFrom: "title",
    fields: [
      { name: "title", type: "ltext", required: true, list: true },
      { name: "body", type: "lblocks", required: true },
      { name: "category", type: "select", options: ["general", "prayer", "event", "donation", "urgent"], required: true, list: true, initial: "general" },
      { name: "status", type: "select", options: ["published", "draft", "archived"], required: true, list: true, initial: "published" },
      { name: "pinned", type: "bool", list: true },
      { name: "expires_on", type: "date", list: true },
    ],
    read: (r) => ({ ...r, body: readBlocksText(r.body), expires_on: typeof r.expires_at === "string" ? dateJst(new Date(r.expires_at)) : null }),
    write: (v, prev) => ({
      title: v.title,
      excerpt: excerptL10n(v.body as L10n) ?? {},
      body: writeBlocks(v.body as L10n, prev?.body),
      category: v.category,
      status: v.status,
      pinned: Boolean(v.pinned),
      // Berlaku sampai akhir hari itu menurut waktu Jepang.
      expires_at: v.expires_on ? new Date(`${String(v.expires_on)}T23:59:59+09:00`).toISOString() : null,
      published_at: v.status === "published" ? (prev?.published_at ?? new Date().toISOString()) : (prev?.published_at ?? null),
    }),
  },
  {
    key: "agenda",
    module: "agenda",
    kind: "table",
    source: "events",
    icon: "CalendarRange",
    titleField: "title",
    sort: ["starts_at", "desc"],
    paths: ["", "/events", "/app", "/app/agenda"],
    publicPath: "/events",
    keyFrom: "title",
    fields: [
      { name: "title", type: "ltext", required: true, list: true },
      { name: "category", type: "select", options: ["kajian", "tpa", "muallaf", "community", "culture", "ramadan", "eid", "class", "open-mosque"], required: true, list: true, initial: "kajian" },
      { name: "starts_at", type: "datetime", required: true, list: true },
      { name: "ends_at", type: "datetime", required: true },
      { name: "location", type: "ltext", required: true, list: true },
      { name: "speaker", type: "text" },
      { name: "description", type: "lblocks" },
      { name: "status", type: "select", options: ["published", "draft", "archived"], required: true, list: true, initial: "published" },
      { name: "featured", type: "bool" },
    ],
    read: (r) => ({ ...r, description: readBlocksText(r.description) }),
    write: (v, prev) => {
      const description = (v.description as L10n | null) ?? { id: "", en: "", ja: "" };
      return {
        title: v.title,
        excerpt: excerptL10n(description) ?? v.title,
        description: writeBlocks(description, prev?.description),
        category: v.category,
        starts_at: v.starts_at,
        ends_at: v.ends_at,
        location: v.location,
        speaker: text(v.speaker),
        status: v.status,
        featured: Boolean(v.featured),
        languages: prev?.languages ?? ["id"],
        registration: prev?.registration ?? { required: false },
      };
    },
    validate: (v) => (Date.parse(String(v.ends_at)) > Date.parse(String(v.starts_at)) ? null : "errors.timeRange"),
  },
  {
    key: "rekening",
    module: "rekening",
    kind: "collection",
    source: "donation_accounts",
    icon: "Landmark",
    titleField: "bankName",
    paths: ["/donate", "/app/donate"],
    publicPath: "/donate",
    keyFrom: "bankName",
    fields: [
      { name: "bankName", type: "text", required: true, list: true },
      { name: "currency", type: "select", options: ["JPY", "IDR"], required: true, list: true },
      { name: "method", type: "select", options: ["bank", "qris", "ewallet"], required: true, list: true },
      { name: "accountNumber", type: "text", required: true, list: true },
      { name: "accountName", type: "text", required: true, list: true },
      { name: "branch", type: "text" },
      { name: "branchCode", type: "text" },
      { name: "accountType", type: "text" },
      { name: "primary", type: "bool" },
      { name: "note", type: "ltext" },
    ],
    write: (v, prev) =>
      optional({ ...(prev ?? {}), bankName: v.bankName, currency: v.currency, method: v.method, accountNumber: v.accountNumber, accountName: v.accountName, primary: Boolean(v.primary) }, v, ["branch", "branchCode", "accountType", "note"]),
  },
  {
    key: "program-donasi",
    module: "programdonasi",
    kind: "collection",
    source: "donation_programs",
    icon: "HandCoins",
    titleField: "title",
    paths: ["", "/donate", "/app/donate"],
    publicPath: "/donate",
    keyFrom: "title",
    fields: [
      { name: "title", type: "ltext", required: true, list: true },
      { name: "status", type: "select", options: ["open", "closed", "completed"], required: true, list: true, initial: "open" },
      { name: "target", type: "number", list: true },
      { name: "raised", type: "number", list: true },
      { name: "description", type: "ltextarea", required: true },
    ],
    read: (d) => ({ ...d, target: (d.target as { amount?: number } | undefined)?.amount ?? null, raised: (d.raised as { amount?: number } | undefined)?.amount ?? null }),
    write: (v, prev) => {
      const yen = (n: unknown) => (typeof n === "number" ? { amount: n, currency: "JPY" } : null);
      return optional({ ...(prev ?? {}), title: v.title, description: v.description, status: v.status, icon: prev?.icon ?? "heart" }, { target: yen(v.target), raised: yen(v.raised) }, ["target", "raised"]);
    },
  },
  {
    key: "profil",
    module: "profil",
    kind: "setting",
    source: "profile",
    icon: "Info",
    titleField: "phone",
    paths: ["", "/contact", "/about", "/app/info"],
    publicPath: "/contact",
    fields: [
      { name: "phone", type: "text" },
      { name: "whatsapp", type: "text" },
      { name: "email", type: "text" },
      { name: "postalCode", type: "text" },
      { name: "address", type: "ltext" },
      { name: "openingHours", type: "ltext" },
      { name: "googleMapsUrl", type: "text" },
    ],
    // Hanya isian yang diisi yang menimpa nilai lama; yang dikosongkan dibiarkan apa adanya.
    write: (v, prev) => ({ ...(prev ?? {}), ...Object.fromEntries(Object.entries(v).filter(([, value]) => value !== null && value !== "")) }),
  },
];

export function findSection(key: string): PubSection | undefined {
  return PUB_SECTIONS.find((s) => s.key === key);
}

/** Nilai formulir datar (`title.id`, `title.en`, ...) dari nilai logis sebuah baris. */
export function toFormValues(section: PubSection, values: PubValues, isoToLocal: (iso: string) => string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of section.fields) {
    const v = values[f.name];
    if (f.type === "ltext" || f.type === "ltextarea" || f.type === "lblocks") {
      const t = readL10n(v);
      // Terjemahan yang sama persis dengan teks Indonesia berarti "ikut Indonesia": ditampilkan kosong
      // supaya saat teks Indonesia diubah, bahasa lain ikut berubah dan tidak tertinggal versi lama.
      if (t.en === t.id) t.en = "";
      if (t.ja === t.id) t.ja = "";
      out[`${f.name}.id`] = t.id;
      out[`${f.name}.en`] = t.en;
      out[`${f.name}.ja`] = t.ja;
    } else if (f.type === "datetime") out[f.name] = typeof v === "string" && v ? isoToLocal(v) : "";
    else if (f.type === "date") out[f.name] = typeof v === "string" ? v.slice(0, 10) : "";
    else if (f.type === "bool") out[f.name] = v ? "true" : "false";
    else out[f.name] = v === null || v === undefined ? "" : String(v);
  }
  return out;
}
