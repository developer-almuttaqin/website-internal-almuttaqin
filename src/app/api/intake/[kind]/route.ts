import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, isDemo } from "@/lib/db";
import { findConflict, referenceCode } from "@/lib/logic/misc";
import type { RoomBooking, TableName } from "@/lib/types";

/**
 * Pintu masuk data dari web publik (almuttaqinculturalcenter.org): formulir donasi dan
 * peminjaman ruangan langsung disimpan di web internal. Wajib memakai token rahasia bersama.
 */
const donation = z.object({
  reference_code: z.string().trim().max(40).optional(),
  donor_name: z.string().trim().max(100).nullish(),
  kana_name: z.string().trim().max(100).nullish(),
  contact: z.string().trim().max(100).nullish(),
  program: z.string().trim().max(100).nullish(),
  amount: z.number().positive().max(1_000_000_000),
  currency: z.enum(["JPY", "IDR"]),
  channel: z.enum(["qris", "yucho"]),
});

const booking = z.object({
  room_id: z.string().min(1),
  purpose: z.string().trim().min(1).max(200),
  organizer_name: z.string().trim().min(1).max(100),
  contact: z.string().trim().max(100).nullish(),
  attendees: z.number().int().positive().max(1000).nullish(),
  starts_at: z.iso.datetime({ offset: true }),
  ends_at: z.iso.datetime({ offset: true }),
});

function authorized(request: Request): boolean {
  const token = process.env.INTAKE_TOKEN;
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token || token.length < 24 || given.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(token));
}

/** Permintaan dari web publik tidak punya sesi pengurus, jadi memakai service role di sisi server. */
async function insert<T extends Record<string, unknown>>(table: TableName, row: T): Promise<{ id: string }> {
  if (isDemo) return db.insert(table, row as never);
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data, error } = await admin.from(table).insert(row).select("id").single();
  if (error) throw new Error(error.message);
  return data as { id: string };
}

async function listBookings(): Promise<RoomBooking[]> {
  if (isDemo) return db.list("room_bookings");
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data } = await admin.from("room_bookings").select("*").in("status", ["approved", "confirmed"]);
  return (data ?? []) as RoomBooking[];
}

export async function POST(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  const { kind } = await params;
  const body: unknown = await request.json().catch(() => null);

  if (kind === "donations") {
    const input = donation.safeParse(body);
    if (!input.success) return NextResponse.json({ ok: false, error: "VALIDATION" }, { status: 400 });
    const reference_code = input.data.reference_code || referenceCode("INF");
    const row = await insert("donations", {
      ...input.data,
      reference_code,
      donor_name: input.data.donor_name ?? null,
      kana_name: input.data.kana_name ?? null,
      contact: input.data.contact ?? null,
      program: input.data.program ?? null,
      status: "pending",
      submitted_at: new Date().toISOString(),
      matched_line_id: null,
      matched_at: null,
      notes: null,
    });
    return NextResponse.json({ ok: true, data: { id: row.id, reference_code } }, { status: 201 });
  }

  if (kind === "room-bookings") {
    const input = booking.safeParse(body);
    if (!input.success || Date.parse(input.data.ends_at) <= Date.parse(input.data.starts_at)) return NextResponse.json({ ok: false, error: "VALIDATION" }, { status: 400 });
    if (findConflict(input.data, await listBookings())) return NextResponse.json({ ok: false, error: "CONFLICT" }, { status: 409 });
    const row = await insert("room_bookings", {
      ...input.data,
      contact: input.data.contact ?? null,
      attendees: input.data.attendees ?? null,
      status: "requested",
      decision_note: null,
      decided_by: null,
      source: "public",
    });
    return NextResponse.json({ ok: true, data: { id: row.id } }, { status: 201 });
  }

  return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
}
