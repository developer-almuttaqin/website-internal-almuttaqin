"use server";

import { z } from "zod";
import { jstLocalToIso } from "../format";
import { dedupeHash } from "../logic/cash";
import { findConflict, referenceCode } from "../logic/misc";
import { canWrite, type Module } from "../permissions";
import { pushBookingStatus, pushDonationStatus, pushDonorInactive } from "../publicweb/sync";
import { RESOURCES, scopeRows, type FieldDef, type ResourceDef } from "../resources";
import { saveUpload } from "../storage";
import type { AnyRow } from "../types";
import { ActionError, createAction, type ActionContext, type ActionResult } from "./core";

const emptyToNull = (v: unknown) => (v === "" || v == null ? null : v);

function fieldSchema(f: FieldDef): z.ZodType {
  let s: z.ZodType;
  switch (f.type) {
    case "number":
    case "money":
      s = z.coerce.number().min(0).max(1_000_000_000_000);
      break;
    case "date":
      s = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
      break;
    case "datetime":
      s = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
        .transform(jstLocalToIso);
      break;
    case "select":
      s = z.enum(f.options as [string, ...string[]]);
      break;
    case "bool":
      return z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
    case "textarea":
      s = z.string().trim().max(5000);
      break;
    default:
      s = z.string().trim().max(300);
  }
  return f.required ? z.preprocess(emptyToNull, s) : z.preprocess(emptyToNull, s.nullable());
}

function resourceSchema(res: ResourceDef) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of res.fields) if (!f.readOnly && f.type !== "file") shape[f.name] = fieldSchema(f);
  return z.object(shape);
}

function getResource(key: unknown): ResourceDef {
  const res = typeof key === "string" ? RESOURCES[key as Module] : undefined;
  if (!res) throw new ActionError("NOT_FOUND", "errors.notFound");
  return res;
}

/** Aturan khusus tiap modul sebelum data disimpan. */
async function prepare(res: ResourceDef, values: Record<string, unknown>, existing: AnyRow | null, { user, db }: ActionContext) {
  switch (res.key) {
    case "kas": {
      if (existing && existing.source !== "manual" && existing.source !== "import") throw new ActionError("CONFLICT", "errors.lockedEntry");
      const account = await db.get("accounts", String(values.account_id));
      if (!account) throw new ActionError("VALIDATION", "errors.validation");
      values.currency = account.currency;
      values.dedupe_hash = dedupeHash(values as never);
      if (!existing) Object.assign(values, { source: "manual", ref_id: null, created_by: user.id });
      break;
    }
    case "pengajuan": {
      if (existing && (existing.status !== "submitted" || existing.requested_by !== user.id)) throw new ActionError("CONFLICT", "errors.lockedRequest");
      if (!existing)
        Object.assign(values, {
          status: "submitted",
          requested_by: user.id,
          requested_by_name: user.full_name,
          bill_id: null,
          decided_by: null,
          decided_at: null,
          decision_note: null,
          paid_by: null,
          paid_at: null,
          account_id: null,
          receipt_path: null,
          cash_entry_id: null,
        });
      break;
    }
    case "ruangan": {
      const starts_at = String(values.starts_at);
      const ends_at = String(values.ends_at);
      if (Date.parse(ends_at) <= Date.parse(starts_at)) throw new ActionError("VALIDATION", "errors.timeRange");
      const conflict = findConflict({ id: existing?.id, room_id: String(values.room_id), starts_at, ends_at }, await db.list("room_bookings"));
      if (conflict) throw new ActionError("CONFLICT", "errors.roomConflict");
      // Perubahan jadwal mengembalikan status ke "diajukan" agar disetujui ulang oleh direktur.
      Object.assign(values, { status: "requested", decided_by: null, decision_note: null, source: existing?.source ?? "internal" });
      break;
    }
    case "muallaf": {
      if (user.role === "pembimbing") {
        if (existing && existing.mentor_id !== user.id) throw new ActionError("FORBIDDEN", "errors.forbidden");
        values.mentor_id = user.id;
      }
      break;
    }
    case "donasi": {
      if (existing && existing.status !== "pending") throw new ActionError("CONFLICT", "errors.lockedEntry");
      if (!existing) Object.assign(values, { reference_code: referenceCode("INF"), status: "pending", matched_line_id: null, matched_at: null });
      break;
    }
    case "templat":
      values.code = String(values.code).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      break;
  }
}

const save = createAction(
  { name: "record.save", schema: z.instanceof(FormData), summary: (f) => `${String(f.get("_resource"))}: ${String(f.get(getResource(f.get("_resource")).titleField) ?? "")}`.slice(0, 200) },
  async (form, ctx) => {
    const res = getResource(form.get("_resource"));
    if (!canWrite(ctx.user.role, res.key)) throw new ActionError("FORBIDDEN", "errors.forbidden");
    const id = String(form.get("_id") ?? "");
    const parsed = resourceSchema(res).safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) {
      throw new ActionError("VALIDATION", "errors.validation", Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), "errors.field"])));
    }
    const values: Record<string, unknown> = { ...parsed.data };
    const existing = id ? ((await ctx.db.get(res.table, id)) as AnyRow | null) : null;
    if (id && (!existing || !scopeRows(res.key, ctx.user, [existing]).length)) throw new ActionError("NOT_FOUND", "errors.notFound");
    await prepare(res, values, existing, ctx);
    for (const f of res.fields) {
      if (f.type !== "file") continue;
      const path = await saveUpload(form.get(f.name), res.key);
      if (path) values[f.name] = path;
      else if (!existing) values[f.name] = null;
    }
    const row = existing ? await ctx.db.update(res.table, id, values as never) : await ctx.db.insert(res.table, values as never);
    return { id: row.id };
  },
);

/** Dipakai formulir generik (useActionState). */
export async function saveRecord(_prev: ActionResult<{ id: string }> | null, form: FormData): Promise<ActionResult<{ id: string }>> {
  const result = await save(form);
  return result;
}

const removeSchema = z.object({ resource: z.string(), id: z.string().min(1) });

export const deleteRecord = createAction({ name: "record.delete", schema: removeSchema, summary: (i) => `${i.resource}: ${i.id}` }, async ({ resource, id }, ctx) => {
  const res = getResource(resource);
  if (!canWrite(ctx.user.role, res.key)) throw new ActionError("FORBIDDEN", "errors.forbidden");
  const existing = (await ctx.db.get(res.table, id)) as AnyRow | null;
  if (!existing || !scopeRows(res.key, ctx.user, [existing]).length) throw new ActionError("NOT_FOUND", "errors.notFound");
  if (res.key === "kas" && existing.source !== "manual" && existing.source !== "import") throw new ActionError("CONFLICT", "errors.lockedEntry");
  if (res.key === "pengajuan" && (existing.status !== "submitted" || existing.requested_by !== ctx.user.id)) throw new ActionError("CONFLICT", "errors.lockedRequest");
  if (res.key === "donasi" && existing.status === "matched") throw new ActionError("CONFLICT", "errors.lockedEntry");
  await ctx.db.remove(res.table, id);
  // Formulir asal web publik yang dihapus ditandai di sana agar tidak ditarik lagi saat sinkron.
  if (res.key === "ruangan") await pushBookingStatus(existing.public_ref as string | null, "cancelled");
  if (res.key === "donasi") await pushDonationStatus(existing.public_ref as string | null, "rejected");
  if (res.key === "donatur") await pushDonorInactive(existing.public_ref as string | null);
  return { id };
});
