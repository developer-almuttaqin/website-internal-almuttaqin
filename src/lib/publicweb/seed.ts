import { addDays, dateJst } from "../format";

type Row = Record<string, unknown>;

/**
 * Data contoh yang meniru database web publik, hanya untuk mode demo. Bentuk kolom sama dengan
 * skema web publik (supabase/migrations di repo web publik). Semua nama dan angka adalah placeholder.
 */
export function buildPublicSeed(now: Date = new Date()): Record<string, Row[]> {
  const today = dateJst(now);
  const stamp = now.toISOString();
  let n = 0;
  const base = () => ({ id: `pub-${String(++n).padStart(4, "0")}`, created_at: stamp, updated_at: stamp });
  const at = (days: number, time: string) => new Date(`${addDays(today, days)}T${time}:00+09:00`).toISOString();
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  const friday = addDays(today, (5 - weekday + 7) % 7);
  const l = (id: string, en: string, ja: string) => ({ id, en, ja });
  const item = (collection: string, item_key: string, sort_order: number, data: Row) => ({ ...base(), collection, item_key, sort_order, published: true, data });

  return {
    jumuah_schedules: [
      { ...base(), date: friday, khatib: "Ustadz A (contoh)", imam: "Ustadz A (contoh)", time: "12:30", language: "mixed", topic: l("Menjaga salat berjamaah", "Keeping the congregational prayer", "集団礼拝を守る"), note: null, published: true },
    ],
    announcements: [
      {
        ...base(),
        slug: "kerja-bakti-masjid",
        title: l("Kerja bakti masjid", "Mosque clean-up day", "モスク清掃のお知らせ"),
        excerpt: l("Mohon kehadiran jamaah untuk kerja bakti bersama.", "Please join the community clean-up.", "清掃活動へのご参加をお願いします。"),
        body: {
          id: [{ type: "p", text: "Mohon kehadiran jamaah untuk kerja bakti bersama pada Sabtu pagi. Perlengkapan disediakan." }],
          en: [{ type: "p", text: "Please join the community clean-up on Saturday morning. Supplies are provided." }],
          ja: [{ type: "p", text: "土曜日の午前に清掃活動を行います。道具は用意します。" }],
        },
        category: "general",
        pinned: false,
        status: "published",
        published_at: stamp,
        expires_at: null,
      },
    ],
    events: [
      {
        ...base(),
        slug: "kajian-bulanan",
        title: l("Kajian bulanan", "Monthly study circle", "月例勉強会"),
        excerpt: l("Kajian bulanan untuk umum.", "Monthly study circle, open to all.", "どなたでも参加できる月例勉強会。"),
        description: { id: [{ type: "p", text: "Kajian bulanan untuk umum." }], en: [{ type: "p", text: "Monthly study circle, open to all." }], ja: [{ type: "p", text: "どなたでも参加できる月例勉強会。" }] },
        category: "kajian",
        starts_at: at(9, "19:30"),
        ends_at: at(9, "21:00"),
        location: l("Ruang salat utama", "Main prayer hall", "礼拝室"),
        speaker: "Ustadz A (contoh)",
        languages: ["id"],
        cover_image: null,
        registration: { required: false },
        recurring: null,
        featured: false,
        status: "published",
      },
    ],
    room_bookings: [
      { ...base(), room_id: "multipurpose", purpose: "aqiqah", organizer_name: "Keluarga B (contoh)", organizer_contact: "080-0000-0002", starts_at: at(12, "10:00"), ends_at: at(12, "13:00"), attendees: 30, notes: "Membawa makanan sendiri", status: "requested", locale: "id" },
    ],
    donation_confirmations: [
      { ...base(), program_slug: "operational", account_id: "jpb", currency: "JPY", amount: 5123, unique_code: 123, transferred_at: today, donor_name: "Hamba Allah (contoh)", donor_contact: "080-0000-0003", on_behalf_of: null, message: null, status: "pending", matched_at: null, locale: "id" },
    ],
    recurring_donors: [
      { ...base(), full_name: "Donatur C (contoh)", contact: "080-0000-0004", monthly_amount: 3000, currency: "JPY", payment_day: 25, method: "bank", publish_name: false, consent: true, active: true, locale: "id" },
    ],
    program_registrations: [
      { ...base(), program_id: "tpa", full_name: "Orang tua D (contoh)", contact: "080-0000-0005", participant_name: "Anak D (contoh)", participant_age: 7, notes: null, status: "new", locale: "id" },
    ],
    suggestions: [
      { ...base(), kind: "facility", message: "Keran tempat wudu lantai 1 menetes.", sender_name: "Jamaah E (contoh)", sender_contact: null, status: "new", locale: "id" },
      { ...base(), kind: "question", message: "Apakah ada kelas bahasa Jepang untuk pemula?", sender_name: null, sender_contact: "jamaah@contoh.test", status: "new", locale: "id" },
    ],
    contact_messages: [
      { ...base(), full_name: "Sekolah F (contoh)", email: "sekolah@contoh.test", subject: "Kunjungan sekolah", message: "Kami ingin berkunjung bersama 20 siswa bulan depan.", locale: "ja", status: "new" },
    ],
    content_items: [
      item("rooms", "multipurpose", 1, { name: l("Ruang serbaguna", "Multipurpose room", "多目的室"), capacity: 40, description: l("Ruang untuk acara keluarga dan kajian.", "For family events and classes.", "家族行事や勉強会に。"), amenities: [], availableFor: [] }),
      item("rooms", "classroom", 2, { name: l("Ruang kelas", "Classroom", "教室"), capacity: 15, description: l("Ruang kelas kecil.", "A small classroom.", "小さな教室。"), amenities: [], availableFor: [] }),
      item("donation_accounts", "jpb", 1, { bankName: "Japan Post Bank (DEMO)", currency: "JPY", method: "bank", accountNumber: "10180-12345671", accountName: "AL MUTTAQIN (DEMO)", branch: "018", primary: true }),
      item("donation_accounts", "qris", 2, { bankName: "QRIS (DEMO)", currency: "IDR", method: "qris", accountNumber: "-", accountName: "AL MUTTAQIN (DEMO)" }),
      item("donation_programs", "operational", 1, { slug: "operational", title: l("Infaq operasional", "Operational infaq", "運営インファーク"), description: l("Listrik, kebersihan, dan perawatan masjid.", "Utilities, cleaning, and upkeep.", "光熱費、清掃、維持管理。"), status: "open", icon: "building", target: { amount: 1200000, currency: "JPY" }, raised: { amount: 350000, currency: "JPY" } }),
    ],
    site_settings: [
      {
        key: "profile",
        updated_at: stamp,
        value: {
          phone: "047-000-0000",
          whatsapp: "81470000000",
          email: "info@almuttaqinculturalcenter.org",
          postalCode: "270-0000",
          address: l("Matsudo, Chiba (alamat contoh)", "Matsudo, Chiba (sample address)", "千葉県松戸市（サンプル住所）"),
          openingHours: l("Setiap hari, dari Subuh sampai Isya", "Daily, from Fajr to Isha", "毎日、ファジュルからイシャーまで"),
          googleMapsUrl: "https://maps.google.com/",
        },
      },
    ],
    activity_log: [],
  };
}
