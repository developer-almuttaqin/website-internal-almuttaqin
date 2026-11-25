import { addMonths } from "../format";
import type { Bill, RoomBooking } from "../types";

/** Dua rentang waktu bentrok bila saling beririsan (ujung yang bersentuhan tidak bentrok). */
export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return Date.parse(aStart) < Date.parse(bEnd) && Date.parse(bStart) < Date.parse(aEnd);
}

export function findConflict(
  candidate: Pick<RoomBooking, "room_id" | "starts_at" | "ends_at"> & { id?: string },
  bookings: RoomBooking[],
): RoomBooking | undefined {
  return bookings.find(
    (b) =>
      b.id !== candidate.id &&
      b.room_id === candidate.room_id &&
      (b.status === "approved" || b.status === "confirmed") &&
      overlaps(candidate.starts_at, candidate.ends_at, b.starts_at, b.ends_at),
  );
}

export function nextDue(bill: Pick<Bill, "next_due" | "frequency">): string {
  const step = bill.frequency === "monthly" ? 1 : bill.frequency === "quarterly" ? 3 : 12;
  return addMonths(bill.next_due, step);
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** Nomor surat: 007/ACC/UND/XI/2026. Urutan dihitung per tahun dari nomor yang sudah ada. */
export function letterNumber(existing: string[], code: string, issuedOn: string): string {
  const [year, month] = issuedOn.split("-");
  const max = existing
    .filter((n) => n.endsWith(`/${year}`))
    .reduce((m, n) => Math.max(m, parseInt(n.split("/")[0], 10) || 0), 0);
  return `${String(max + 1).padStart(3, "0")}/ACC/${code.toUpperCase()}/${ROMAN[Number(month) - 1]}/${year}`;
}

/** Nama isian di dalam templat surat, ditulis {{nama_isian}}. */
export function placeholders(body: string): string[] {
  const seen = new Set<string>();
  for (const m of body.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)) seen.add(m[1]);
  return [...seen];
}

export function renderLetter(body: string, data: Record<string, string>): string {
  return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => data[key] ?? "");
}

export function referenceCode(kind: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `AM-${kind}-${[...bytes].map((b) => alphabet[b % alphabet.length]).join("")}`;
}
