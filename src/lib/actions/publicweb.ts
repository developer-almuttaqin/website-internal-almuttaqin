"use server";

import { z } from "zod";
import en from "../../../messages/en.json";
import id from "../../../messages/id.json";
import ja from "../../../messages/ja.json";
import { dateJst, jstLocalToIso, monthJst } from "../format";
import { canWrite } from "../permissions";
import { fillL10n, monthlyStatement, pickL10n, transparencyData, uniqueSlug, type L10n } from "../publicweb/content";
import { findSection, type PubField, type PubSection, type PubValues } from "../publicweb/sections";
import { logPublicActivity, publicStore, refreshPublicSite, type PubRow } from "../publicweb/store";
import { pullFromPublic, type SyncResult } from "../publicweb/sync";
import type { Role } from "../types";
import { ActionError, createAction, type ActionResult } from "./core";

const FINANCE: Role[] = ["direktur", "bendahara"];

/* ------------------------------ Simpan / hapus konten ------------------------------ */

function parseField(f: PubField, form: FormData): { value: unknown; invalid: boolean } {
  const raw = (name: string) => String(form.get(name) ?? "").trim();
  const done = (value: unknown, invalid = false) => ({ value, invalid: invalid || (Boolean(f.required) && (value === null || value === "")) });
  switch (f.type) {
    case "ltext":
    case "ltextarea":
    case "lblocks": {
      const max = f.type === "ltext" ? 300 : 5000;
      const value: L10n = { id: raw(`${f.name}.id`), en: raw(`${f.name}.en`), ja: raw(`${f.name}.ja`) };
      return done(fillL10n(value), Object.values(value).some((v) => v.length > max));
    }
    case "bool":
      return { value: form.get(f.name) === "on" || form.get(f.name) === "true", invalid: false };
    case "number": {
      const v = raw(f.name);
      if (!v) return done(null);
      const n = Number(v);
      return done(n, !Number.isFinite(n) || n < 0 || n > 1_000_000_000_000);
    }
    case "date": {
      const v = raw(f.name);
      return done(v || null, Boolean(v) && !/^\d{4}-\d{2}-\d{2}$/.test(v));
    }
    case "time": {
      const v = raw(f.name).slice(0, 5);
      return done(v || null, Boolean(v) && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v));
    }
    case "datetime": {
      const v = raw(f.name);
      if (!v) return done(null);
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v) ? done(jstLocalToIso(v)) : done(null, true);
    }
    case "select": {
      const v = raw(f.name);
      return done(v || null, Boolean(v) && !f.options?.includes(v));
    }
    default: {
      const v = raw(f.name);
      return done(v || null, v.length > (f.type === "textarea" ? 5000 : 300));
    }
  }
}

function getSection(key: unknown): PubSection {
  const section = typeof key === "string" ? findSection(key) : undefined;
  if (!section) throw new ActionError("NOT_FOUND", "errors.notFound");
  return section;
}

const keyText = (value: unknown) => (typeof value === "string" ? value : pickL10n(value, "id"));

const save = createAction(
  { name: "web.save", schema: z.instanceof(FormData), summary: (f) => String(f.get("_section") ?? "").slice(0, 60) },
  async (form, { user, db }) => {
    const section = getSection(form.get("_section"));
    if (!canWrite(user.role, section.module)) throw new ActionError("FORBIDDEN", "errors.forbidden");
    const rowId = String(form.get("_id") ?? "");

    const values: PubValues = {};
    const fieldErrors: Record<string, string> = {};
    for (const f of section.fields) {
      const { value, invalid } = parseField(f, form);
      if (invalid) fieldErrors[f.name] = "errors.field";
      values[f.name] = value;
    }
    if (Object.keys(fieldErrors).length) throw new ActionError("VALIDATION", "errors.validation", fieldErrors);
    const problem = section.validate?.(values);
    if (problem) throw new ActionError("VALIDATION", problem);

    const store = publicStore();
    let saved: PubRow;
    if (section.kind === "table") {
      const prev = rowId ? ((await store.list(section.source, { id: rowId }))[0] ?? null) : null;
      if (rowId && !prev) throw new ActionError("NOT_FOUND", "errors.notFound");
      const row = section.write(values, prev);
      if (!prev && section.keyFrom) {
        const taken = (await store.list(section.source)).map((r) => String(r.slug));
        row.slug = uniqueSlug(`${keyText(values[section.keyFrom])} ${dateJst().slice(0, 7)}`, taken, `${section.key}-${dateJst()}`);
      }
      saved = prev ? (await store.update(section.source, { id: rowId }, row))[0] : await store.insert(section.source, row);
    } else if (section.kind === "collection") {
      const items = await store.list("content_items", { collection: section.source });
      const prev = rowId ? (items.find((r) => String(r.id) === rowId) ?? null) : null;
      if (rowId && !prev) throw new ActionError("NOT_FOUND", "errors.notFound");
      const data = section.write(values, (prev?.data as PubRow | undefined) ?? null);
      if (prev) saved = (await store.update("content_items", { id: rowId }, { data }))[0];
      else {
        const item_key = uniqueSlug(keyText(values[section.keyFrom ?? section.titleField]), items.map((r) => String(r.item_key)), section.key);
        if (section.source === "donation_programs") data.slug = item_key;
        const sort_order = items.reduce((m, r) => Math.max(m, Number(r.sort_order) || 0), 0) + 1;
        saved = await store.insert("content_items", { collection: section.source, item_key, data, sort_order, published: true });
      }
    } else {
      const prev = (await store.list("site_settings", { key: section.source }))[0] ?? null;
      const value = section.write(values, (prev?.value as PubRow | undefined) ?? null);
      saved = prev ? (await store.update("site_settings", { key: section.source }, { value }))[0] : await store.insert("site_settings", { key: section.source, value });
    }

    // Kegiatan internal yang baru ditampilkan sebagai agenda publik mencatat rujukannya.
    const from = String(form.get("_from") ?? "");
    if (section.key === "agenda" && from && !rowId && canWrite(user.role, "kegiatan")) {
      try {
        await db.update("events", from, { public_ref: String(saved.id) });
      } catch {
        // Kegiatan sudah dihapus: agenda publik tetap tersimpan.
      }
    }

    const savedId = String(saved?.id ?? saved?.key ?? section.source);
    await logPublicActivity(rowId || section.kind === "setting" ? "update" : "create", section.source, savedId, user.full_name);
    const live = await refreshPublicSite(section.paths);
    return { id: savedId, live };
  },
);

/** Dipakai formulir konten web publik (useActionState). */
export async function savePublicRecord(_prev: ActionResult<{ id: string; live: boolean }> | null, form: FormData): Promise<ActionResult<{ id: string; live: boolean }>> {
  return save(form);
}

export const deletePublicRecord = createAction(
  { name: "web.delete", schema: z.object({ section: z.string(), id: z.string().min(1) }), summary: (i) => `${i.section}: ${i.id}` },
  async ({ section: key, id: rowId }, { user, db }) => {
    const section = getSection(key);
    if (section.kind === "setting") throw new ActionError("NOT_FOUND", "errors.notFound");
    if (!canWrite(user.role, section.module)) throw new ActionError("FORBIDDEN", "errors.forbidden");
    const store = publicStore();
    if (section.kind === "table") await store.remove(section.source, { id: rowId });
    else await store.remove("content_items", { id: rowId, collection: section.source });
    if (section.key === "agenda") {
      for (const e of (await db.list("events")).filter((e) => e.public_ref === rowId)) {
        try {
          await db.update("events", e.id, { public_ref: null });
        } catch {
          // Peran tanpa hak tulis kegiatan: rujukan dibiarkan, tidak memengaruhi web publik.
        }
      }
    }
    await logPublicActivity("delete", section.source, rowId, user.full_name);
    await refreshPublicSite(section.paths);
    return { id: rowId };
  },
);

/* ------------------------------ Sinkron formulir publik ------------------------------ */

/** Tarik peminjaman ruangan, konfirmasi donasi, dan donatur tetap dari web publik. Aman dipanggil berulang. */
export const syncPublic = createAction(
  {
    name: "web.sync",
    schema: z.object({}).optional(),
    quiet: (r) => {
      const s = r as SyncResult;
      return s.bookings + s.donations + s.donors === 0;
    },
    summary: () => "web publik",
  },
  async (): Promise<SyncResult> => pullFromPublic(),
);

/* ------------------------------ Kotak masuk ------------------------------ */

const INBOX = {
  program: { table: "program_registrations", statuses: ["new", "accepted", "waitlist", "rejected"], roles: ["direktur", "sekretaris", "pendidikan"] },
  suggestion: { table: "suggestions", statuses: ["new", "in_progress", "done", "spam"], roles: ["direktur", "sekretaris", "fasilitas"] },
  contact: { table: "contact_messages", statuses: ["new", "done"], roles: ["direktur", "sekretaris"] },
} as const satisfies Record<string, { table: string; statuses: readonly string[]; roles: readonly Role[] }>;

export const setInboxStatus = createAction(
  { name: "inbox.status", schema: z.object({ kind: z.enum(["program", "suggestion", "contact"]), id: z.string().min(1), status: z.string().min(1).max(20) }), summary: (i) => `${i.kind}: ${i.status}` },
  async ({ kind, id: rowId, status }, { user }) => {
    const def = INBOX[kind];
    if (!(def.roles as readonly Role[]).includes(user.role)) throw new ActionError("FORBIDDEN", "errors.forbidden");
    if (!(def.statuses as readonly string[]).includes(status)) throw new ActionError("VALIDATION", "errors.validation");
    const store = publicStore();
    const row = (await store.list(def.table, { id: rowId }))[0];
    if (!row) throw new ActionError("NOT_FOUND", "errors.notFound");
    if (kind === "suggestion" && user.role === "fasilitas" && row.kind !== "facility") throw new ActionError("FORBIDDEN", "errors.forbidden");
    await store.update(def.table, { id: rowId }, { status });
    return { id: rowId };
  },
);

/** Pendaftar TPA dari web publik langsung menjadi peserta TPA, tanpa diketik ulang. */
export const inboxToTpa = createAction({ name: "inbox.tpa", roles: ["pendidikan"], schema: z.object({ id: z.string().min(1) }) }, async ({ id: rowId }, { db }) => {
  const store = publicStore();
  const reg = (await store.list("program_registrations", { id: rowId }))[0];
  if (!reg) throw new ActionError("NOT_FOUND", "errors.notFound");
  if ((await db.list("tpa_students")).some((s) => s.public_ref === rowId)) throw new ActionError("CONFLICT", "web.errors.alreadyImported");
  const student = await db.insert("tpa_students", {
    full_name: String(reg.participant_name || reg.full_name).slice(0, 300),
    guardian_contact: [reg.participant_name ? String(reg.full_name) : null, String(reg.contact ?? "")].filter(Boolean).join(" / ").slice(0, 300) || null,
    class_name: null,
    active: true,
    public_ref: rowId,
  });
  await store.update("program_registrations", { id: rowId }, { status: "accepted" });
  return { id: student.id };
});

/** Saran tentang fasilitas dari jamaah menjadi laporan kerusakan untuk koordinator fasilitas. */
export const inboxToIssue = createAction({ name: "inbox.issue", roles: INBOX.suggestion.roles, schema: z.object({ id: z.string().min(1) }) }, async ({ id: rowId }, { db }) => {
  const store = publicStore();
  const s = (await store.list("suggestions", { id: rowId }))[0];
  if (!s) throw new ActionError("NOT_FOUND", "errors.notFound");
  if ((await db.list("issues")).some((i) => i.public_ref === rowId)) throw new ActionError("CONFLICT", "web.errors.alreadyImported");
  const message = String(s.message ?? "");
  const issue = await db.insert("issues", {
    title: message.length > 80 ? `${message.slice(0, 77)}...` : message,
    location: null,
    severity: "medium",
    status: "open",
    reported_on: dateJst(),
    reported_by_name: String(s.sender_name || "Jamaah (web publik)").slice(0, 300),
    notes: [message, s.sender_contact ? `Kontak: ${String(s.sender_contact)}` : null].filter(Boolean).join("\n").slice(0, 5000),
    public_ref: rowId,
  });
  await store.update("suggestions", { id: rowId }, { status: "in_progress" });
  return { id: issue.id };
});

/* ------------------------------ Laporan transparansi ------------------------------ */

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const MESSAGES = { id, en, ja } as const;
const TRANSPARENCY_PATHS = ["/transparency", "/donate", "/app/donate"];

function categoryLabel(category: string): L10n {
  const label = (m: (typeof MESSAGES)["id"]) => (m.options as Record<string, string>)[category] ?? category;
  return { id: label(MESSAGES.id), en: label(MESSAGES.en), ja: label(MESSAGES.ja) };
}

/**
 * Ringkasan kas Yen satu bulan diterbitkan sebagai laporan transparansi di web publik, langsung dari
 * buku kas internal. Hanya angka per kategori yang dikirim; rincian transaksi tetap di database internal.
 */
export const publishTransparency = createAction({ name: "transparency.publish", roles: FINANCE, schema: z.object({ month }), summary: (i) => i.month }, async ({ month: ym }, { db, user }) => {
  if (ym > monthJst()) throw new ActionError("VALIDATION", "web.errors.futureMonth");
  const [accounts, entries] = await Promise.all([db.list("accounts"), db.list("cash_entries")]);
  const statement = monthlyStatement(accounts, entries, ym, "JPY");
  const store = publicStore();
  const prev = (await store.list("content_items", { collection: "transparency_reports", item_key: ym }))[0] ?? null;
  const data = transparencyData(ym, statement, categoryLabel, (prev?.data as Record<string, unknown> | undefined) ?? null, new Date().toISOString());
  if (prev) await store.update("content_items", { id: String(prev.id) }, { data, published: true });
  else await store.insert("content_items", { collection: "transparency_reports", item_key: ym, data, sort_order: Number(ym.replace("-", "")), published: true });
  await logPublicActivity(prev ? "update" : "create", "transparency_reports", ym, user.full_name);
  return { id: ym, live: await refreshPublicSite(TRANSPARENCY_PATHS) };
});

export const unpublishTransparency = createAction({ name: "transparency.unpublish", roles: FINANCE, schema: z.object({ month }), summary: (i) => i.month }, async ({ month: ym }, { user }) => {
  const store = publicStore();
  const rows = await store.update("content_items", { collection: "transparency_reports", item_key: ym }, { published: false });
  if (!rows.length) throw new ActionError("NOT_FOUND", "errors.notFound");
  await logPublicActivity("update", "transparency_reports", ym, user.full_name);
  await refreshPublicSite(TRANSPARENCY_PATHS);
  return { id: ym };
});
