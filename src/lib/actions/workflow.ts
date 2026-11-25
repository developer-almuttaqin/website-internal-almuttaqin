"use server";

import { createHash } from "node:crypto";
import { z } from "zod";
import { dateJst } from "../format";
import { dedupeHash } from "../logic/cash";
import { cellText, decodeText, guessColumns, parseAmount, parseCsv, parseDate, splitHeader, type Cell } from "../logic/importer";
import { autoMatch } from "../logic/matching";
import { findConflict, letterNumber, nextDue, placeholders, referenceCode, renderLetter } from "../logic/misc";
import { APPROVER, PAYER, canWrite } from "../permissions";
import { pushBookingStatus, pushDonationStatus } from "../publicweb/sync";
import { CASH_CATEGORIES } from "../resources";
import { saveUpload } from "../storage";
import type { Db } from "../db";
import type { Donation, Profile, StatementLine } from "../types";
import { ActionError, createAction, type ActionResult } from "./core";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const idOnly = z.object({ id: z.string().min(1) });

/* ------------------------------ Pengeluaran ------------------------------ */

/** Hanya direktur yang bisa menyetujui atau menolak pengeluaran. */
export const decideExpense = createAction(
  {
    name: "expense.decide",
    roles: [APPROVER],
    schema: z.object({ id: z.string().min(1), decision: z.enum(["approved", "rejected"]), note: z.string().trim().max(500).optional() }),
    summary: (i) => i.decision,
  },
  async ({ id, decision, note }, { db, user }) => {
    const req = await db.get("expense_requests", id);
    if (!req) throw new ActionError("NOT_FOUND", "errors.notFound");
    if (req.status !== "submitted") throw new ActionError("CONFLICT", "errors.alreadyDecided");
    await db.update("expense_requests", id, { status: decision, decided_by: user.id, decided_at: new Date().toISOString(), decision_note: note || null });
    return { id };
  },
);

/** Bendahara membayar pengajuan yang sudah disetujui; otomatis masuk buku kas dan anggaran. */
export const payExpense = createAction({ name: "expense.pay", roles: [PAYER], schema: z.instanceof(FormData), summary: (f) => String(f.get("id")) }, async (form, { db, user }) => {
  const input = z.object({ id: z.string().min(1), account_id: z.string().min(1), paid_on: dateStr }).safeParse(Object.fromEntries(form.entries()));
  if (!input.success) throw new ActionError("VALIDATION", "errors.validation");
  const req = await db.get("expense_requests", input.data.id);
  const account = await db.get("accounts", input.data.account_id);
  if (!req || !account) throw new ActionError("NOT_FOUND", "errors.notFound");
  if (req.status !== "approved") throw new ActionError("CONFLICT", "errors.notApproved");
  if (account.currency !== req.currency) throw new ActionError("VALIDATION", "errors.currencyMismatch");
  const receipt = await saveUpload(form.get("receipt"), "kuitansi");
  const entryBase = { entry_date: input.data.paid_on, account_id: account.id, type: "out" as const, amount: Number(req.amount), description: req.title };
  const entry = await db.insert("cash_entries", {
    ...entryBase,
    currency: req.currency,
    category: req.category,
    proof_path: receipt,
    budget_id: req.budget_id,
    source: "expense",
    ref_id: req.id,
    dedupe_hash: dedupeHash(entryBase),
    created_by: user.id,
  });
  await db.update("expense_requests", req.id, { status: "paid", paid_by: user.id, paid_at: new Date().toISOString(), account_id: account.id, receipt_path: receipt, cash_entry_id: entry.id });
  if (req.bill_id) {
    const bill = await db.get("bills", req.bill_id);
    if (bill) await db.update("bills", bill.id, { next_due: nextDue(bill) });
  }
  return { id: req.id };
});

/** Tagihan rutin langsung menjadi pengajuan pembayaran ke direktur. */
export const billToExpense = createAction({ name: "bill.request", roles: [PAYER], schema: idOnly }, async ({ id }, { db, user }) => {
  const bill = await db.get("bills", id);
  if (!bill) throw new ActionError("NOT_FOUND", "errors.notFound");
  const open = (await db.list("expense_requests")).some((r) => r.bill_id === id && (r.status === "submitted" || r.status === "approved"));
  if (open) throw new ActionError("CONFLICT", "errors.billAlreadyRequested");
  const row = await db.insert("expense_requests", {
    title: `${bill.name} (${bill.next_due.slice(0, 7)})`,
    category: bill.category,
    amount: Number(bill.amount),
    currency: bill.currency,
    budget_id: null,
    bill_id: bill.id,
    needed_by: bill.next_due,
    notes: bill.vendor,
    status: "submitted",
    requested_by: user.id,
    requested_by_name: user.full_name,
    decided_by: null,
    decided_at: null,
    decision_note: null,
    paid_by: null,
    paid_at: null,
    account_id: null,
    receipt_path: null,
    cash_entry_id: null,
  });
  return { id: row.id };
});

/* ------------------------------ Ruangan ------------------------------ */

export const decideBooking = createAction(
  {
    name: "booking.decide",
    roles: [APPROVER],
    schema: z.object({ id: z.string().min(1), decision: z.enum(["approved", "declined"]), note: z.string().trim().max(500).optional() }),
    summary: (i) => i.decision,
  },
  async ({ id, decision, note }, { db, user }) => {
    const booking = await db.get("room_bookings", id);
    if (!booking) throw new ActionError("NOT_FOUND", "errors.notFound");
    if (booking.status !== "requested") throw new ActionError("CONFLICT", "errors.alreadyDecided");
    if (decision === "approved" && findConflict(booking, await db.list("room_bookings"))) throw new ActionError("CONFLICT", "errors.roomConflict");
    await db.update("room_bookings", id, { status: decision, decided_by: user.id, decision_note: note || null });
    // Permintaan dari web publik: keputusan direktur dikirim balik ke database web publik.
    await pushBookingStatus(booking.public_ref, decision === "approved" ? "approved" : "rejected");
    return { id };
  },
);

/** Koordinator fasilitas mengonfirmasi jadwal setelah disetujui direktur. */
export const confirmBooking = createAction({ name: "booking.confirm", roles: ["fasilitas"], schema: idOnly }, async ({ id }, { db }) => {
  const booking = await db.get("room_bookings", id);
  if (!booking) throw new ActionError("NOT_FOUND", "errors.notFound");
  if (booking.status !== "approved") throw new ActionError("CONFLICT", "errors.notApproved");
  await db.update("room_bookings", id, { status: "confirmed" });
  return { id };
});

/* ------------------------------ Donatur tetap & TPA ------------------------------ */

export const markDonorPaid = createAction({ name: "donor.paid", roles: [PAYER], schema: idOnly }, async ({ id }, { db }) => {
  await db.update("recurring_donors", id, { last_paid_on: dateJst() });
  return { id };
});

export const saveAttendance = createAction({ name: "attendance.save", roles: ["pendidikan"], schema: z.instanceof(FormData), summary: (f) => String(f.get("date")) }, async (form, { db }) => {
  const date = dateStr.safeParse(form.get("date"));
  if (!date.success) throw new ActionError("VALIDATION", "errors.validation");
  const existing = (await db.list("tpa_attendance")).filter((a) => a.date === date.data);
  const statuses = z.enum(["present", "permit", "sick", "absent"]);
  let count = 0;
  for (const student of await db.list("tpa_students")) {
    const status = statuses.safeParse(form.get(`status_${student.id}`));
    if (!status.success) continue;
    const prev = existing.find((a) => a.student_id === student.id);
    if (prev) await db.update("tpa_attendance", prev.id, { status: status.data });
    else await db.insert("tpa_attendance", { student_id: student.id, date: date.data, status: status.data });
    count++;
  }
  return { count };
});

/* ------------------------------ Surat ------------------------------ */

export const createLetter = createAction({ name: "letter.create", roles: ["sekretaris"], schema: z.instanceof(FormData), summary: (f) => String(f.get("subject")) }, async (form, { db, user }) => {
  const input = z.object({ template_id: z.string().min(1), subject: z.string().trim().min(1).max(200), issued_on: dateStr }).safeParse(Object.fromEntries(form.entries()));
  if (!input.success) throw new ActionError("VALIDATION", "errors.validation");
  const template = await db.get("letter_templates", input.data.template_id);
  if (!template) throw new ActionError("NOT_FOUND", "errors.notFound");
  const data: Record<string, string> = {};
  for (const key of placeholders(template.body)) data[key] = String(form.get(`f_${key}`) ?? "").trim().slice(0, 500);
  const number = letterNumber((await db.list("letters")).map((l) => l.number), template.code, input.data.issued_on);
  const row = await db.insert("letters", { template_id: template.id, number, subject: input.data.subject, data, body: renderLetter(template.body, data), issued_on: input.data.issued_on, created_by: user.id });
  return { id: row.id };
});

/* ------------------------------ Impor ------------------------------ */

async function readTable(file: unknown): Promise<{ rows: Cell[][]; hash: string; name: string }> {
  if (!(file instanceof File) || file.size === 0) throw new ActionError("VALIDATION", "errors.fileRequired");
  if (file.size > 5 * 1024 * 1024) throw new ActionError("VALIDATION", "errors.fileSize");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  let rows: Cell[][];
  if (/\.xlsx$/i.test(file.name)) {
    const { readSheet } = await import("read-excel-file/node");
    rows = (await readSheet(Buffer.from(bytes))) as Cell[][];
  } else if (/\.(csv|txt)$/i.test(file.name)) {
    rows = parseCsv(decodeText(bytes));
  } else throw new ActionError("VALIDATION", "errors.importType");
  if (rows.length < 2) throw new ActionError("VALIDATION", "errors.importEmpty");
  return { rows, hash, name: file.name.slice(0, 120) };
}

export interface ParsedFile {
  headers: string[];
  rows: string[][];
  guess: Partial<Record<string, number>>;
}

/** Langkah 1 impor kas: baca file Excel/CSV, kembalikan kolom dan baris untuk dipetakan. */
export const parseCashFile = createAction({ name: "cash.parse", roles: [PAYER], schema: z.instanceof(FormData) }, async (form): Promise<ParsedFile> => {
  const { rows } = await readTable(form.get("file"));
  const { headers, body } = splitHeader(rows);
  return { headers, rows: body.slice(0, 2000).map((r) => headers.map((_, i) => cellText(r[i]))), guess: guessColumns(headers) };
});

const cashRow = z.object({
  entry_date: z.string(),
  type: z.enum(["in", "out"]),
  amount: z.number().positive(),
  description: z.string().trim().min(1).max(300),
  category: z.enum(CASH_CATEGORIES),
});

/** Langkah 2 impor kas: simpan baris yang valid, tolak data ganda. */
export const importCashRows = createAction(
  { name: "cash.import", roles: [PAYER], schema: z.object({ account_id: z.string().min(1), rows: z.array(z.unknown()).min(1).max(2000) }), summary: (i) => `${i.rows.length} baris` },
  async ({ account_id, rows }, { db, user }) => {
    const account = await db.get("accounts", account_id);
    if (!account) throw new ActionError("NOT_FOUND", "errors.notFound");
    const seen = new Set((await db.list("cash_entries")).map((e) => e.dedupe_hash));
    const toInsert = [];
    let duplicates = 0;
    let invalid = 0;
    for (const raw of rows) {
      const parsed = cashRow.safeParse(raw);
      const entry_date = parsed.success ? parseDate(parsed.data.entry_date) : null;
      if (!parsed.success || !entry_date) {
        invalid++;
        continue;
      }
      const base = { entry_date, account_id, type: parsed.data.type, amount: parsed.data.amount, description: parsed.data.description };
      const hash = dedupeHash(base);
      if (seen.has(hash)) {
        duplicates++;
        continue;
      }
      seen.add(hash);
      toInsert.push({ ...base, currency: account.currency, category: parsed.data.category, proof_path: null, budget_id: null, source: "import" as const, ref_id: null, dedupe_hash: hash, created_by: user.id });
    }
    await db.insertMany("cash_entries", toInsert);
    return { inserted: toInsert.length, duplicates, invalid };
  },
);

async function applyMatch(db: Db, line: StatementLine, donation: Donation, user: Profile) {
  await db.update("donations", donation.id, { status: "matched", matched_line_id: line.id, matched_at: new Date().toISOString() });
  await db.update("statement_lines", line.id, { status: "matched", donation_id: donation.id });
  const base = {
    entry_date: line.occurred_on,
    account_id: line.account_id,
    type: "in" as const,
    amount: Number(line.amount),
    description: `Donasi ${donation.reference_code} ${donation.donor_name ?? "Hamba Allah"}`.trim(),
  };
  // Donasi baru dihitung sebagai pemasukan setelah cocok dengan mutasi rekening.
  await db.insert("cash_entries", { ...base, currency: line.currency, category: "donation", proof_path: null, budget_id: null, source: "donation", ref_id: donation.id, dedupe_hash: dedupeHash(base), created_by: user.id });
  await pushDonationStatus(donation.public_ref, "matched");
}

/** Impor laporan QRIS / CSV Japan Post Bank, tolak file ganda, lalu cocokkan otomatis. */
export const importStatement = createAction({ name: "statement.import", roles: [PAYER], schema: z.instanceof(FormData), summary: (f) => String(f.get("source")) }, async (form, { db, user }) => {
  const input = z.object({ source: z.enum(["qris_report", "yucho_csv"]), account_id: z.string().min(1) }).safeParse(Object.fromEntries(form.entries()));
  if (!input.success) throw new ActionError("VALIDATION", "errors.validation");
  const account = await db.get("accounts", input.data.account_id);
  if (!account) throw new ActionError("NOT_FOUND", "errors.notFound");
  const { rows, hash, name } = await readTable(form.get("file"));
  if ((await db.list("statement_imports")).some((i) => i.file_hash === hash)) throw new ActionError("CONFLICT", "errors.duplicateFile");

  const { headers, body } = splitHeader(rows);
  const col = guessColumns(headers);
  if (col.date == null || (col.amount == null && col.amount_in == null)) throw new ActionError("VALIDATION", "errors.importColumns");
  const parsed = body
    .map((r) => {
      const occurred_on = parseDate(r[col.date!]);
      const amount = parseAmount(r[col.amount_in ?? col.amount!]);
      if (!occurred_on || amount == null || amount <= 0) return null; // hanya baris kredit (uang masuk)
      const sender = col.name != null ? cellText(r[col.name]) : "";
      const description = col.description != null ? cellText(r[col.description]) : "";
      return { occurred_on, amount, sender_name: sender || null, description: description || null };
    })
    .filter((r) => r !== null);
  if (!parsed.length) throw new ActionError("VALIDATION", "errors.importEmpty");

  const imp = await db.insert("statement_imports", { source: input.data.source, account_id: account.id, file_name: name, file_hash: hash, row_count: parsed.length, matched_count: 0, imported_by: user.id });
  const lines = await db.insertMany(
    "statement_lines",
    parsed.map((p) => ({ ...p, import_id: imp.id, account_id: account.id, currency: account.currency, status: "unmatched" as const, donation_id: null })),
  );
  const donations = await db.list("donations");
  const matches = autoMatch(lines, donations);
  for (const m of matches) await applyMatch(db, lines[m.lineIndex], donations.find((d) => d.id === m.donationId)!, user);
  await db.update("statement_imports", imp.id, { matched_count: matches.length });
  return { id: imp.id, rows: lines.length, matched: matches.length };
});

export const matchLine = createAction({ name: "statement.match", roles: [PAYER], schema: z.object({ lineId: z.string().min(1), donationId: z.string().min(1) }) }, async ({ lineId, donationId }, { db, user }) => {
  const line = await db.get("statement_lines", lineId);
  const donation = await db.get("donations", donationId);
  if (!line || !donation) throw new ActionError("NOT_FOUND", "errors.notFound");
  if (line.status !== "unmatched" || donation.status !== "pending") throw new ActionError("CONFLICT", "errors.alreadyMatched");
  if (line.currency !== donation.currency) throw new ActionError("VALIDATION", "errors.currencyMismatch");
  await applyMatch(db, line, donation, user);
  return { id: line.id };
});

/** Baris kredit tanpa formulir dicatat sebagai donasi "Hamba Allah", atau diabaikan bila bukan donasi. */
export const resolveLine = createAction({ name: "statement.resolve", roles: [PAYER], schema: z.object({ lineId: z.string().min(1), as: z.enum(["anonymous", "ignored"]) }), summary: (i) => i.as }, async ({ lineId, as }, { db, user }) => {
  const line = await db.get("statement_lines", lineId);
  if (!line) throw new ActionError("NOT_FOUND", "errors.notFound");
  if (line.status !== "unmatched") throw new ActionError("CONFLICT", "errors.alreadyMatched");
  if (as === "ignored") {
    await db.update("statement_lines", line.id, { status: "ignored" });
    return { id: line.id };
  }
  const donation = await db.insert("donations", {
    reference_code: referenceCode("INF"),
    donor_name: line.sender_name || "Hamba Allah",
    kana_name: null,
    contact: null,
    program: null,
    amount: Number(line.amount),
    currency: line.currency,
    channel: line.currency === "IDR" ? "qris" : "yucho",
    status: "pending",
    submitted_at: new Date(`${line.occurred_on}T00:00:00+09:00`).toISOString(),
    matched_line_id: null,
    matched_at: null,
    notes: null,
  });
  await applyMatch(db, line, donation, user);
  return { id: line.id };
});

export const markDonation = createAction({ name: "donation.mark", roles: [PAYER], schema: z.object({ id: z.string().min(1), status: z.enum(["rejected", "expired"]) }), summary: (i) => i.status }, async ({ id, status }, { db }) => {
  const donation = await db.get("donations", id);
  if (!donation) throw new ActionError("NOT_FOUND", "errors.notFound");
  if (donation.status !== "pending") throw new ActionError("CONFLICT", "errors.alreadyMatched");
  await db.update("donations", id, { status });
  if (status === "rejected") await pushDonationStatus(donation.public_ref, "rejected");
  return { id };
});

/** Ubah status laporan kerusakan tanpa membuka formulir. */
export const setIssueStatus = createAction({ name: "issue.status", schema: z.object({ id: z.string().min(1), status: z.enum(["open", "in_progress", "done"]) }), summary: (i) => i.status }, async ({ id, status }, { db, user }) => {
  if (!canWrite(user.role, "kerusakan")) throw new ActionError("FORBIDDEN", "errors.forbidden");
  await db.update("issues", id, { status });
  return { id };
});

export type { ActionResult };
