import type { Module } from "./permissions";
import type { AnyRow, Profile, TableName } from "./types";

export type FieldType = "text" | "textarea" | "number" | "money" | "date" | "datetime" | "select" | "ref" | "bool" | "file";

export interface FieldDef {
  name: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  /** Tabel rujukan untuk type "ref" dan kolom yang ditampilkan. */
  ref?: TableName;
  refLabel?: string;
  /** Tampil di daftar (selain di formulir). */
  list?: boolean;
  /** Hanya tampil di daftar; diatur oleh sistem, bukan lewat formulir. */
  readOnly?: boolean;
}

export interface ResourceDef {
  key: Module;
  table: TableName;
  titleField: string;
  fields: FieldDef[];
  sort: [string, "asc" | "desc"];
  /** Kolom mata uang untuk field bertipe money. */
  currencyField?: string;
}

export const EXPENSE_CATEGORIES = ["utilities", "rent", "maintenance", "equipment", "education", "program", "social", "insurance", "other_expense"] as const;
export const CASH_CATEGORIES = ["infaq_box", "donation", "zakat", "other_income", ...EXPENSE_CATEGORIES] as const;
const CURRENCY = ["JPY", "IDR"] as const;
const METHOD = ["qris", "yucho", "cash"] as const;

export const RESOURCES: Partial<Record<Module, ResourceDef>> = {
  kas: {
    key: "kas",
    table: "cash_entries",
    titleField: "description",
    sort: ["entry_date", "desc"],
    currencyField: "currency",
    fields: [
      { name: "entry_date", type: "date", required: true, list: true },
      { name: "description", type: "text", required: true, list: true },
      { name: "account_id", type: "ref", ref: "accounts", refLabel: "name", required: true, list: true },
      { name: "type", type: "select", options: ["in", "out"], required: true, list: true },
      { name: "category", type: "select", options: CASH_CATEGORIES, required: true, list: true },
      { name: "amount", type: "money", required: true, list: true },
      { name: "budget_id", type: "ref", ref: "budgets", refLabel: "program" },
      { name: "proof_path", type: "file", list: true },
    ],
  },
  akun: {
    key: "akun",
    table: "accounts",
    titleField: "name",
    sort: ["name", "asc"],
    currencyField: "currency",
    fields: [
      { name: "name", type: "text", required: true, list: true },
      { name: "currency", type: "select", options: CURRENCY, required: true, list: true },
      { name: "kind", type: "select", options: ["bank", "cash", "qris"], required: true, list: true },
      { name: "opening_balance", type: "money", required: true, list: true },
    ],
  },
  pengajuan: {
    key: "pengajuan",
    table: "expense_requests",
    titleField: "title",
    sort: ["created_at", "desc"],
    currencyField: "currency",
    fields: [
      { name: "title", type: "text", required: true, list: true },
      { name: "category", type: "select", options: EXPENSE_CATEGORIES, required: true, list: true },
      { name: "amount", type: "money", required: true, list: true },
      { name: "currency", type: "select", options: CURRENCY, required: true },
      { name: "budget_id", type: "ref", ref: "budgets", refLabel: "program" },
      { name: "needed_by", type: "date" },
      { name: "notes", type: "textarea" },
      { name: "requested_by_name", type: "text", list: true, readOnly: true },
      { name: "status", type: "select", options: ["submitted", "approved", "rejected", "paid"], list: true, readOnly: true },
    ],
  },
  anggaran: {
    key: "anggaran",
    table: "budgets",
    titleField: "program",
    sort: ["program", "asc"],
    currencyField: "currency",
    fields: [
      { name: "program", type: "text", required: true, list: true },
      { name: "year", type: "number", required: true, list: true },
      { name: "currency", type: "select", options: CURRENCY, required: true },
      { name: "amount", type: "money", required: true, list: true },
      { name: "notes", type: "textarea" },
    ],
  },
  tagihan: {
    key: "tagihan",
    table: "bills",
    titleField: "name",
    sort: ["next_due", "asc"],
    currencyField: "currency",
    fields: [
      { name: "name", type: "text", required: true, list: true },
      { name: "category", type: "select", options: EXPENSE_CATEGORIES, required: true },
      { name: "vendor", type: "text", list: true },
      { name: "amount", type: "money", required: true, list: true },
      { name: "currency", type: "select", options: CURRENCY, required: true },
      { name: "frequency", type: "select", options: ["monthly", "quarterly", "yearly"], required: true, list: true },
      { name: "next_due", type: "date", required: true, list: true },
      { name: "active", type: "bool" },
      { name: "notes", type: "textarea" },
    ],
  },
  donasi: {
    key: "donasi",
    table: "donations",
    titleField: "donor_name",
    sort: ["submitted_at", "desc"],
    currencyField: "currency",
    fields: [
      { name: "reference_code", type: "text", list: true, readOnly: true },
      { name: "donor_name", type: "text", list: true },
      { name: "kana_name", type: "text" },
      { name: "contact", type: "text" },
      { name: "program", type: "text", list: true },
      { name: "amount", type: "money", required: true, list: true },
      { name: "currency", type: "select", options: CURRENCY, required: true },
      { name: "channel", type: "select", options: METHOD, required: true, list: true },
      { name: "submitted_at", type: "datetime", required: true, list: true },
      { name: "status", type: "select", options: ["pending", "matched", "expired", "rejected"], list: true, readOnly: true },
      { name: "notes", type: "textarea" },
    ],
  },
  donatur: {
    key: "donatur",
    table: "recurring_donors",
    titleField: "full_name",
    sort: ["full_name", "asc"],
    currencyField: "currency",
    fields: [
      { name: "full_name", type: "text", required: true, list: true },
      { name: "contact", type: "text" },
      { name: "amount", type: "money", required: true, list: true },
      { name: "currency", type: "select", options: CURRENCY, required: true },
      { name: "method", type: "select", options: METHOD, required: true, list: true },
      { name: "pay_day", type: "number", list: true },
      { name: "last_paid_on", type: "date", list: true },
      { name: "active", type: "bool" },
      { name: "notes", type: "textarea" },
    ],
  },
  inventaris: {
    key: "inventaris",
    table: "inventory_items",
    titleField: "name",
    sort: ["name", "asc"],
    fields: [
      { name: "code", type: "text", list: true },
      { name: "name", type: "text", required: true, list: true },
      { name: "category", type: "select", options: ["electronics", "furniture", "kitchen", "worship", "other"], required: true },
      { name: "location", type: "text", required: true, list: true },
      { name: "quantity", type: "number", required: true, list: true },
      { name: "condition", type: "select", options: ["good", "needs_repair", "broken", "lost"], required: true, list: true },
      { name: "acquired_on", type: "date" },
      { name: "photo_path", type: "file", list: true },
      { name: "notes", type: "textarea" },
    ],
  },
  jamaah: {
    key: "jamaah",
    table: "congregants",
    titleField: "full_name",
    sort: ["full_name", "asc"],
    fields: [
      { name: "full_name", type: "text", required: true, list: true },
      { name: "contact", type: "text", list: true },
      { name: "city", type: "text", list: true },
      { name: "nationality", type: "text", list: true },
      { name: "consent_news", type: "bool", list: true },
      { name: "notes", type: "textarea" },
    ],
  },
  muallaf: {
    key: "muallaf",
    table: "muallaf",
    titleField: "full_name",
    sort: ["shahada_date", "desc"],
    fields: [
      { name: "full_name", type: "text", required: true, list: true },
      { name: "contact", type: "text" },
      { name: "shahada_date", type: "date", list: true },
      { name: "mentor_id", type: "ref", ref: "profiles", refLabel: "full_name", list: true },
      { name: "status", type: "select", options: ["active", "independent", "inactive"], required: true, list: true },
      { name: "needs", type: "textarea" },
      { name: "progress_notes", type: "textarea" },
    ],
  },
  ruangan: {
    key: "ruangan",
    table: "room_bookings",
    titleField: "purpose",
    sort: ["starts_at", "asc"],
    fields: [
      { name: "purpose", type: "text", required: true, list: true },
      { name: "room_id", type: "ref", ref: "rooms", refLabel: "name", required: true, list: true },
      { name: "organizer_name", type: "text", required: true, list: true },
      { name: "contact", type: "text" },
      { name: "attendees", type: "number" },
      { name: "starts_at", type: "datetime", required: true, list: true },
      { name: "ends_at", type: "datetime", required: true, list: true },
      { name: "status", type: "select", options: ["requested", "approved", "declined", "confirmed"], list: true, readOnly: true },
    ],
  },
  kerusakan: {
    key: "kerusakan",
    table: "issues",
    titleField: "title",
    sort: ["reported_on", "desc"],
    fields: [
      { name: "title", type: "text", required: true, list: true },
      { name: "location", type: "text", list: true },
      { name: "severity", type: "select", options: ["low", "medium", "high"], required: true, list: true },
      { name: "status", type: "select", options: ["open", "in_progress", "done"], required: true, list: true },
      { name: "reported_on", type: "date", required: true, list: true },
      { name: "reported_by_name", type: "text" },
      { name: "notes", type: "textarea" },
    ],
  },
  kegiatan: {
    key: "kegiatan",
    table: "events",
    titleField: "title",
    sort: ["starts_at", "asc"],
    fields: [
      { name: "title", type: "text", required: true, list: true },
      { name: "kind", type: "select", options: ["jumuah", "kajian", "class", "meeting", "other"], required: true, list: true },
      { name: "starts_at", type: "datetime", required: true, list: true },
      { name: "location", type: "text", list: true },
      { name: "officer", type: "text", list: true },
      { name: "notes", type: "textarea" },
    ],
  },
  tpa: {
    key: "tpa",
    table: "tpa_students",
    titleField: "full_name",
    sort: ["full_name", "asc"],
    fields: [
      { name: "full_name", type: "text", required: true, list: true },
      { name: "class_name", type: "text", list: true },
      { name: "guardian_contact", type: "text", list: true },
      { name: "active", type: "bool", list: true },
    ],
  },
  templat: {
    key: "templat",
    table: "letter_templates",
    titleField: "name",
    sort: ["name", "asc"],
    fields: [
      { name: "code", type: "text", required: true, list: true },
      { name: "name", type: "text", required: true, list: true },
      { name: "body", type: "textarea", required: true },
    ],
  },
};

/** Batas baris yang boleh dilihat peran tertentu (selain hak baca modul). */
export function scopeRows<T extends AnyRow>(key: Module, user: Pick<Profile, "id" | "role">, rows: T[]): T[] {
  if (key === "muallaf" && user.role === "pembimbing") return rows.filter((r) => r.mentor_id === user.id);
  if (key === "pengajuan" && user.role !== "direktur" && user.role !== "bendahara") return rows.filter((r) => r.requested_by === user.id);
  return rows;
}

export const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "primary"> = {
  submitted: "warning",
  requested: "warning",
  pending: "warning",
  open: "danger",
  in_progress: "warning",
  needs_repair: "warning",
  approved: "primary",
  confirmed: "success",
  paid: "success",
  matched: "success",
  done: "success",
  good: "success",
  active: "success",
  independent: "primary",
  rejected: "danger",
  declined: "danger",
  broken: "danger",
  lost: "danger",
  high: "danger",
  medium: "warning",
  in: "success",
  out: "neutral",
};
