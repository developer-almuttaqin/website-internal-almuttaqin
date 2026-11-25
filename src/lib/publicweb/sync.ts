import "server-only";
import { systemDb } from "../db";
import type { Room } from "../types";
import { pickL10n } from "./content";
import { publicStore, publicWebMode, type PubRow } from "./store";

export interface SyncResult {
  bookings: number;
  donations: number;
  donors: number;
}

const PURPOSE: Record<string, string> = { wedding: "Pernikahan", aqiqah: "Aqiqah", seminar: "Seminar", meeting: "Rapat", other: "Lainnya" };
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const DAY = 86_400_000;

/**
 * Tarik formulir dari database web publik ke database internal, satu kali per formulir
 * (kolom `public_ref` + indeks unik mencegah ganda): permintaan peminjaman ruangan untuk disetujui
 * direktur, konfirmasi donasi untuk dicocokkan bendahara dengan mutasi, dan pendaftar donatur tetap.
 * Berjalan sebagai pekerjaan sistem; formulir publik tetap tersimpan di database web publik.
 */
export async function pullFromPublic(): Promise<SyncResult> {
  const result: SyncResult = { bookings: 0, donations: 0, donors: 0 };
  if (publicWebMode === "off") return result;
  const store = publicStore();
  const db = systemDb;

  /* --- peminjaman ruangan --- */
  const [pubBookings, bookings] = await Promise.all([store.list("room_bookings"), db.list("room_bookings")]);
  const haveBooking = new Set(bookings.map((b) => b.public_ref).filter(Boolean));
  const freshBookings = pubBookings.filter(
    (b) => (b.status === "requested" || b.status === "approved") && !haveBooking.has(String(b.id)) && Date.parse(String(b.ends_at)) > Date.now() - 30 * DAY,
  );
  if (freshBookings.length) {
    const [pubRooms, rooms] = await Promise.all([store.list("content_items", { collection: "rooms" }), db.list("rooms")]);
    const roomFor = async (key: string): Promise<Room> => {
      const linked = rooms.find((r) => r.public_key === key);
      if (linked) return linked;
      const data = (pubRooms.find((r) => r.item_key === key)?.data ?? {}) as Record<string, unknown>;
      const name = pickL10n(data.name, "id") || key;
      const sameName = rooms.find((r) => !r.public_key && r.name.trim().toLowerCase() === name.toLowerCase());
      const room = sameName ? await db.update("rooms", sameName.id, { public_key: key }) : await db.insert("rooms", { name, capacity: Number(data.capacity) || 0, public_key: key });
      if (sameName) rooms.splice(rooms.indexOf(sameName), 1, room);
      else rooms.push(room);
      return room;
    };
    for (const b of freshBookings) {
      try {
        const room = await roomFor(String(b.room_id));
        const purpose = [PURPOSE[String(b.purpose)] ?? String(b.purpose), str(b.notes)].filter(Boolean).join(": ").slice(0, 200);
        await db.insert("room_bookings", {
          room_id: room.id,
          purpose,
          organizer_name: String(b.organizer_name),
          contact: str(b.organizer_contact),
          attendees: Number(b.attendees) || null,
          starts_at: new Date(String(b.starts_at)).toISOString(),
          ends_at: new Date(String(b.ends_at)).toISOString(),
          status: b.status === "approved" ? "approved" : "requested",
          decision_note: null,
          decided_by: null,
          source: "public",
          public_ref: String(b.id),
        });
        result.bookings++;
      } catch (err) {
        console.error("[sinkron web publik] peminjaman", b.id, err instanceof Error ? err.message : err);
      }
    }
  }

  /* --- konfirmasi donasi --- */
  const [pubDonations, donations] = await Promise.all([store.list("donation_confirmations", { status: "pending" }), db.list("donations")]);
  const haveDonation = new Set(donations.map((d) => d.public_ref).filter(Boolean));
  for (const d of pubDonations) {
    if (haveDonation.has(String(d.id))) continue;
    const currency = d.currency === "IDR" ? "IDR" : "JPY";
    const transferred = /^\d{4}-\d{2}-\d{2}$/.test(String(d.transferred_at)) ? new Date(`${String(d.transferred_at)}T12:00:00+09:00`) : new Date(String(d.created_at));
    try {
      await db.insert("donations", {
        reference_code: `AM-WEB-${String(d.id).replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase()}`,
        donor_name: str(d.donor_name),
        kana_name: null,
        contact: str(d.donor_contact),
        program: str(d.program_slug),
        // Nominal di web publik sudah termasuk kode unik, sama dengan yang muncul di mutasi rekening.
        amount: Number(d.amount),
        currency,
        channel: currency === "IDR" ? "qris" : "yucho",
        status: "pending",
        submitted_at: transferred.toISOString(),
        matched_line_id: null,
        matched_at: null,
        notes: [str(d.on_behalf_of) ? `Atas nama: ${str(d.on_behalf_of)}` : null, str(d.message)].filter(Boolean).join(" | ").slice(0, 1000) || null,
        public_ref: String(d.id),
      });
      result.donations++;
    } catch (err) {
      console.error("[sinkron web publik] donasi", d.id, err instanceof Error ? err.message : err);
    }
  }

  /* --- donatur tetap --- */
  const [pubDonors, donors] = await Promise.all([store.list("recurring_donors", { active: true }), db.list("recurring_donors")]);
  const haveDonor = new Set(donors.map((d) => d.public_ref).filter(Boolean));
  for (const d of pubDonors) {
    if (haveDonor.has(String(d.id))) continue;
    const currency = d.currency === "IDR" ? "IDR" : "JPY";
    try {
      await db.insert("recurring_donors", {
        full_name: String(d.full_name),
        contact: str(d.contact),
        amount: Number(d.monthly_amount) || 0,
        currency,
        method: currency === "IDR" ? "qris" : "yucho",
        pay_day: Number(d.payment_day) || null,
        last_paid_on: null,
        active: true,
        notes: "Mendaftar lewat web publik",
        public_ref: String(d.id),
      });
      result.donors++;
    } catch (err) {
      console.error("[sinkron web publik] donatur", d.id, err instanceof Error ? err.message : err);
    }
  }
  return result;
}

/** Kirim balik keputusan pengurus ke baris asal di web publik. Gagal di sini tidak membatalkan keputusan. */
async function pushStatus(table: string, publicRef: string | null | undefined, patch: PubRow): Promise<void> {
  if (!publicRef || publicWebMode === "off") return;
  try {
    await publicStore().update(table, { id: publicRef }, patch);
  } catch (err) {
    console.error(`[web publik] gagal memperbarui ${table} ${publicRef}:`, err instanceof Error ? err.message : err);
  }
}

export function pushBookingStatus(publicRef: string | null | undefined, status: "approved" | "rejected" | "cancelled"): Promise<void> {
  return pushStatus("room_bookings", publicRef, { status });
}

export function pushDonationStatus(publicRef: string | null | undefined, status: "matched" | "rejected"): Promise<void> {
  return pushStatus("donation_confirmations", publicRef, status === "matched" ? { status, matched_at: new Date().toISOString() } : { status });
}

/** Donatur tetap asal web publik yang dihapus pengurus dinonaktifkan di sana agar tidak ditarik lagi. */
export function pushDonorInactive(publicRef: string | null | undefined): Promise<void> {
  return pushStatus("recurring_donors", publicRef, { active: false });
}
