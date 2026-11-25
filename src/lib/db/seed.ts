import { addDays, addMonths, dateJst } from "../format";
import { dedupeHash } from "../logic/cash";
import type { Tables } from "../types";

export type DemoData = { [K in keyof Tables]: Tables[K][] };

/** Data contoh untuk mode demo. Semua nama dan angka adalah placeholder. */
export function buildSeed(now: Date = new Date()): DemoData {
  const today = dateJst(now);
  const created_at = now.toISOString();
  const at = (days: number, time: string) => new Date(`${addDays(today, days)}T${time}:00+09:00`).toISOString();
  let n = 0;
  const id = (prefix: string) => `${prefix}-${String(++n).padStart(4, "0")}`;
  const base = (prefix: string) => ({ id: id(prefix), created_at });

  const profiles: DemoData["profiles"] = [
    { id: "u-direktur", created_at, full_name: "Direktur (contoh)", email: "direktur@pengurus-acc.online", role: "direktur", active: true },
    { id: "u-bendahara", created_at, full_name: "Bendahara (contoh)", email: "bendahara@pengurus-acc.online", role: "bendahara", active: true },
    { id: "u-sekretaris", created_at, full_name: "Sekretaris (contoh)", email: "sekretaris@pengurus-acc.online", role: "sekretaris", active: true },
    { id: "u-ibadah", created_at, full_name: "Koordinator Ibadah (contoh)", email: "ibadah@pengurus-acc.online", role: "ibadah", active: true },
    { id: "u-pendidikan", created_at, full_name: "Koordinator Pendidikan (contoh)", email: "pendidikan@pengurus-acc.online", role: "pendidikan", active: true },
    { id: "u-fasilitas", created_at, full_name: "Koordinator Fasilitas (contoh)", email: "fasilitas@pengurus-acc.online", role: "fasilitas", active: true },
    { id: "u-pembimbing", created_at, full_name: "Pembimbing Muallaf (contoh)", email: "pembimbing@pengurus-acc.online", role: "pembimbing", active: true },
  ];

  const accounts: DemoData["accounts"] = [
    { id: "acc-yucho", created_at, name: "Japan Post Bank (DEMO)", currency: "JPY", kind: "bank", opening_balance: 350000 },
    { id: "acc-tunai", created_at, name: "Kas tunai masjid", currency: "JPY", kind: "cash", opening_balance: 42000 },
    { id: "acc-qris", created_at, name: "Rekening Indonesia / QRIS (DEMO)", currency: "IDR", kind: "qris", opening_balance: 5000000 },
  ];

  const year = Number(today.slice(0, 4));
  const budgets: DemoData["budgets"] = [
    { id: "bud-ops", created_at, program: "Operasional masjid", year, currency: "JPY", amount: 1200000, notes: null },
    { id: "bud-tpa", created_at, program: "TPA anak", year, currency: "JPY", amount: 300000, notes: null },
    { id: "bud-ramadan", created_at, program: "Ramadan", year, currency: "JPY", amount: 500000, notes: null },
    { id: "bud-sosial", created_at, program: "Bantuan sosial Indonesia", year, currency: "IDR", amount: 30000000, notes: null },
  ];

  const cash = (
    days: number,
    account_id: string,
    type: "in" | "out",
    category: string,
    amount: number,
    description: string,
    budget_id: string | null = null,
  ): Tables["cash_entries"] => {
    const entry_date = addDays(today, days);
    const currency = accounts.find((a) => a.id === account_id)!.currency;
    return {
      ...base("cash"),
      entry_date,
      account_id,
      currency,
      type,
      category,
      amount,
      description,
      proof_path: null,
      budget_id,
      source: "manual",
      ref_id: null,
      dedupe_hash: dedupeHash({ entry_date, account_id, type, amount, description }),
      created_by: "u-bendahara",
    };
  };
  const cash_entries: DemoData["cash_entries"] = [
    cash(-40, "acc-tunai", "in", "infaq_box", 61500, "Kotak infaq Jumat"),
    cash(-38, "acc-yucho", "out", "utilities", 18400, "Listrik bulan lalu", "bud-ops"),
    cash(-33, "acc-tunai", "in", "infaq_box", 54200, "Kotak infaq Jumat"),
    cash(-31, "acc-yucho", "in", "donation", 30000, "Donasi transfer"),
    cash(-30, "acc-qris", "in", "donation", 750000, "Donasi QRIS"),
    cash(-12, "acc-tunai", "in", "infaq_box", 68300, "Kotak infaq Jumat"),
    cash(-10, "acc-yucho", "out", "utilities", 19850, "Listrik", "bud-ops"),
    cash(-9, "acc-yucho", "out", "utilities", 6200, "Air", "bud-ops"),
    cash(-8, "acc-yucho", "in", "donation", 50000, "Donasi transfer"),
    cash(-6, "acc-tunai", "out", "education", 12800, "Buku Iqra dan alat tulis TPA", "bud-tpa"),
    cash(-5, "acc-tunai", "in", "infaq_box", 72100, "Kotak infaq Jumat"),
    cash(-4, "acc-qris", "in", "donation", 1250000, "Donasi QRIS"),
    cash(-3, "acc-qris", "out", "social", 2000000, "Santunan keluarga dhuafa", "bud-sosial"),
    cash(-2, "acc-tunai", "out", "maintenance", 8900, "Perlengkapan kebersihan", "bud-ops"),
  ];

  const bills: DemoData["bills"] = [
    { ...base("bill"), name: "Listrik", category: "utilities", vendor: "TEPCO", amount: 20000, currency: "JPY", frequency: "monthly", next_due: addDays(today, 4), active: true, notes: null },
    { ...base("bill"), name: "Air", category: "utilities", vendor: "Dinas air Matsudo", amount: 6500, currency: "JPY", frequency: "monthly", next_due: addDays(today, 9), active: true, notes: null },
    { ...base("bill"), name: "Internet", category: "utilities", vendor: "Penyedia internet", amount: 5500, currency: "JPY", frequency: "monthly", next_due: addDays(today, 16), active: true, notes: null },
    { ...base("bill"), name: "Sewa lahan parkir", category: "rent", vendor: "Pemilik lahan", amount: 30000, currency: "JPY", frequency: "monthly", next_due: addDays(today, -2), active: true, notes: null },
    { ...base("bill"), name: "Asuransi gedung", category: "insurance", vendor: "Perusahaan asuransi", amount: 84000, currency: "JPY", frequency: "yearly", next_due: addMonths(today, 3), active: true, notes: null },
  ];

  const expense = (
    title: string,
    category: string,
    amount: number,
    status: Tables["expense_requests"]["status"],
    requested_by: string,
    budget_id: string | null,
    days: number,
  ): Tables["expense_requests"] => ({
    ...base("exp"),
    created_at: at(days, "10:00"),
    title,
    category,
    amount,
    currency: "JPY",
    budget_id,
    bill_id: null,
    needed_by: addDays(today, days + 10),
    notes: null,
    status,
    requested_by,
    requested_by_name: profiles.find((p) => p.id === requested_by)!.full_name,
    decided_by: status === "submitted" ? null : "u-direktur",
    decided_at: status === "submitted" ? null : at(days + 1, "09:00"),
    decision_note: status === "rejected" ? "Tunda sampai bulan depan" : null,
    paid_by: null,
    paid_at: null,
    account_id: null,
    receipt_path: null,
    cash_entry_id: null,
  });
  const expense_requests: DemoData["expense_requests"] = [
    expense("Perbaikan AC ruang salat", "maintenance", 45000, "submitted", "u-fasilitas", "bud-ops", -1),
    expense("Konsumsi kajian bulanan", "program", 12000, "submitted", "u-ibadah", "bud-ops", -2),
    expense("Buku Iqra untuk kelas baru", "education", 9600, "submitted", "u-pendidikan", "bud-tpa", -3),
    expense("Karpet tambahan ruang serbaguna", "equipment", 38000, "approved", "u-fasilitas", "bud-ops", -6),
    expense("Proyektor kedua", "equipment", 65000, "rejected", "u-sekretaris", null, -9),
  ];

  const donations: DemoData["donations"] = [
    { ...base("don"), reference_code: "AM-INF-7K2Q9X", donor_name: "Hamba Allah", kana_name: null, contact: null, program: "Infaq operasional", amount: 100027, currency: "IDR", channel: "qris", status: "pending", submitted_at: at(-1, "20:10"), matched_line_id: null, matched_at: null, notes: null },
    { ...base("don"), reference_code: "AM-INF-3M8RWD", donor_name: "Budi Santoso", kana_name: null, contact: "budi@example.com", program: "Infaq operasional", amount: 250418, currency: "IDR", channel: "qris", status: "pending", submitted_at: at(-2, "08:30"), matched_line_id: null, matched_at: null, notes: null },
    { ...base("don"), reference_code: "AM-INF-9PLA4C", donor_name: "Tanaka Yusuf", kana_name: "タナカ ユスフ", contact: null, program: "Infaq operasional", amount: 10000, currency: "JPY", channel: "yucho", status: "pending", submitted_at: at(-2, "12:00"), matched_line_id: null, matched_at: null, notes: null },
    { ...base("don"), reference_code: "AM-INF-5HT2ZB", donor_name: "Sato Aisha", kana_name: "サトウ アイシャ", contact: null, program: "TPA anak", amount: 3000, currency: "JPY", channel: "yucho", status: "pending", submitted_at: at(-3, "19:45"), matched_line_id: null, matched_at: null, notes: null },
  ];

  const recurring_donors: DemoData["recurring_donors"] = [
    { ...base("rd"), full_name: "Ahmad Fauzi", contact: "090-0000-0001", amount: 5000, currency: "JPY", method: "yucho", pay_day: 5, last_paid_on: addDays(today, -3), active: true, notes: null },
    { ...base("rd"), full_name: "Siti Rahma", contact: "090-0000-0002", amount: 3000, currency: "JPY", method: "cash", pay_day: 1, last_paid_on: addMonths(today, -1), active: true, notes: null },
    { ...base("rd"), full_name: "Keluarga Hidayat", contact: "0812-0000-0003", amount: 200000, currency: "IDR", method: "qris", pay_day: 10, last_paid_on: addMonths(today, -2), active: true, notes: null },
  ];

  const inv = (code: string, name: string, category: string, location: string, quantity: number, condition: Tables["inventory_items"]["condition"]): Tables["inventory_items"] => ({
    ...base("inv"),
    code,
    name,
    category,
    location,
    quantity,
    condition,
    acquired_on: null,
    photo_path: null,
    notes: null,
  });
  const inventory_items: DemoData["inventory_items"] = [
    inv("INV-001", "Sound system utama", "electronics", "Ruang salat", 1, "good"),
    inv("INV-002", "Mikrofon nirkabel", "electronics", "Ruang salat", 2, "needs_repair"),
    inv("INV-003", "Karpet sajadah gulung", "furniture", "Ruang salat", 12, "good"),
    inv("INV-004", "AC dinding", "electronics", "Ruang salat", 2, "needs_repair"),
    inv("INV-005", "Proyektor", "electronics", "Ruang serbaguna", 1, "good"),
    inv("INV-006", "Meja lipat", "furniture", "Ruang serbaguna", 8, "good"),
    inv("INV-007", "Rice cooker besar", "kitchen", "Dapur", 2, "broken"),
    inv("INV-008", "Rak sepatu", "furniture", "Pintu masuk", 3, "good"),
  ];

  const congregants: DemoData["congregants"] = [
    { ...base("jm"), full_name: "Ahmad Fauzi", contact: "090-0000-0001", city: "Matsudo", nationality: "Indonesia", consent_news: true, notes: null },
    { ...base("jm"), full_name: "Siti Rahma", contact: "090-0000-0002", city: "Kashiwa", nationality: "Indonesia", consent_news: true, notes: null },
    { ...base("jm"), full_name: "Tanaka Yusuf", contact: "090-0000-0004", city: "Matsudo", nationality: "Jepang", consent_news: false, notes: null },
    { ...base("jm"), full_name: "Rahman Karim", contact: "090-0000-0005", city: "Ichikawa", nationality: "Bangladesh", consent_news: true, notes: null },
  ];

  const muallaf: DemoData["muallaf"] = [
    { ...base("mu"), full_name: "Sato Aisha", contact: "090-0000-0006", shahada_date: addMonths(today, -2), mentor_id: "u-pembimbing", needs: "Belajar salat dan bacaan Al-Fatihah", progress_notes: "Sudah hafal gerakan salat.", status: "active" },
    { ...base("mu"), full_name: "Suzuki Kenji", contact: "090-0000-0007", shahada_date: addMonths(today, -7), mentor_id: "u-pembimbing", needs: "Pendampingan Ramadan pertama", progress_notes: null, status: "active" },
    { ...base("mu"), full_name: "Yamada Maryam", contact: null, shahada_date: addMonths(today, -14), mentor_id: null, needs: null, progress_notes: "Sudah mandiri, rutin ikut kajian.", status: "independent" },
  ];

  const rooms: DemoData["rooms"] = [
    { id: "room-serbaguna", created_at, name: "Ruang serbaguna", capacity: 40 },
    { id: "room-kelas", created_at, name: "Ruang kelas", capacity: 15 },
  ];

  const room_bookings: DemoData["room_bookings"] = [
    { ...base("rb"), room_id: "room-serbaguna", purpose: "Akad nikah", organizer_name: "Keluarga Hidayat", contact: "090-0000-0008", attendees: 30, starts_at: at(6, "10:00"), ends_at: at(6, "13:00"), status: "requested", decision_note: null, decided_by: null, source: "public" },
    { ...base("rb"), room_id: "room-kelas", purpose: "Kunjungan sekolah dasar", organizer_name: "SD Matsudo (contoh)", contact: "047-000-0000", attendees: 14, starts_at: at(8, "14:00"), ends_at: at(8, "15:30"), status: "approved", decision_note: null, decided_by: "u-direktur", source: "public" },
    { ...base("rb"), room_id: "room-serbaguna", purpose: "Rapat pengurus bulanan", organizer_name: "Sekretaris", contact: null, attendees: 7, starts_at: at(3, "19:30"), ends_at: at(3, "21:00"), status: "confirmed", decision_note: null, decided_by: "u-direktur", source: "internal" },
  ];

  const issues: DemoData["issues"] = [
    { ...base("is"), title: "AC ruang salat tidak dingin", location: "Ruang salat", severity: "high", status: "open", reported_on: addDays(today, -4), reported_by_name: "Jamaah", notes: null },
    { ...base("is"), title: "Keran tempat wudu bocor", location: "Tempat wudu pria", severity: "medium", status: "in_progress", reported_on: addDays(today, -7), reported_by_name: "Koordinator Fasilitas", notes: "Menunggu suku cadang." },
    { ...base("is"), title: "Lampu tangga redup", location: "Tangga", severity: "low", status: "done", reported_on: addDays(today, -15), reported_by_name: "Jamaah", notes: null },
  ];

  const dow = new Date(`${today}T00:00:00Z`).getUTCDay();
  const toFriday = (5 - dow + 7) % 7;
  const events: DemoData["events"] = [
    { ...base("ev"), title: "Salat Jumat", kind: "jumuah", starts_at: at(toFriday, "12:30"), location: "Ruang salat", officer: "Khatib: Ust. Abdullah (contoh)", notes: null },
    { ...base("ev"), title: "Kajian tafsir pekanan", kind: "kajian", starts_at: at(1, "19:30"), location: "Ruang salat", officer: "Ust. Abdullah (contoh)", notes: null },
    { ...base("ev"), title: "TPA anak", kind: "class", starts_at: at(2, "10:00"), location: "Ruang kelas", officer: "Koordinator Pendidikan", notes: null },
    { ...base("ev"), title: "Rapat pengurus bulanan", kind: "meeting", starts_at: at(3, "19:30"), location: "Ruang serbaguna", officer: "Sekretaris", notes: null },
  ];

  const tpa_students: DemoData["tpa_students"] = [
    { id: "st-1", created_at, full_name: "Aisyah", guardian_contact: "090-0000-0011", class_name: "Iqra 1", active: true },
    { id: "st-2", created_at, full_name: "Bilal", guardian_contact: "090-0000-0012", class_name: "Iqra 1", active: true },
    { id: "st-3", created_at, full_name: "Fatimah", guardian_contact: "090-0000-0013", class_name: "Iqra 3", active: true },
    { id: "st-4", created_at, full_name: "Hamzah", guardian_contact: "090-0000-0014", class_name: "Al-Qur'an", active: true },
  ];

  const letter_templates: DemoData["letter_templates"] = [
    {
      id: "tpl-undangan",
      created_at,
      code: "UND",
      name: "Undangan kegiatan",
      body: "Kepada Yth.\n{{penerima}}\ndi tempat\n\nAssalamu'alaikum warahmatullahi wabarakatuh.\n\nDengan hormat, kami mengundang Bapak/Ibu untuk menghadiri {{nama_kegiatan}} yang akan diselenggarakan pada:\n\nHari, tanggal : {{hari_tanggal}}\nWaktu         : {{waktu}}\nTempat        : {{tempat}}\n\nDemikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.\n\nWassalamu'alaikum warahmatullahi wabarakatuh.",
    },
    {
      id: "tpl-keterangan",
      created_at,
      code: "KET",
      name: "Surat keterangan",
      body: "Yang bertanda tangan di bawah ini, pengurus Al Muttaqin Cultural Center, menerangkan bahwa:\n\nNama   : {{nama}}\nAlamat : {{alamat}}\n\nadalah benar {{keterangan}}.\n\nSurat keterangan ini dibuat untuk {{keperluan}} dan dapat dipergunakan sebagaimana mestinya.",
    },
    {
      id: "tpl-muallaf",
      created_at,
      code: "MLF",
      name: "Keterangan muallaf",
      body: "Yang bertanda tangan di bawah ini, pengurus Al Muttaqin Cultural Center, menerangkan bahwa:\n\nNama            : {{nama}}\nKewarganegaraan : {{kewarganegaraan}}\n\ntelah mengucapkan dua kalimat syahadat di Al Muttaqin Cultural Center, Matsudo, Chiba, pada tanggal {{tanggal_syahadah}}, disaksikan oleh {{saksi_1}} dan {{saksi_2}}.\n\nDemikian surat keterangan ini dibuat dengan sebenar-benarnya.",
    },
    {
      id: "tpl-ruangan",
      created_at,
      code: "RNG",
      name: "Persetujuan peminjaman ruangan",
      body: "Kepada Yth.\n{{pemohon}}\n\nMenanggapi permohonan peminjaman ruangan, dengan ini kami menyetujui pemakaian {{ruangan}} pada {{hari_tanggal}} pukul {{waktu}} untuk keperluan {{keperluan}}.\n\nPemohon wajib menjaga kebersihan, mengosongkan ruangan saat waktu salat berjamaah, dan mengembalikan perlengkapan ke tempat semula.",
    },
  ];

  return {
    profiles,
    accounts,
    budgets,
    cash_entries,
    expense_requests,
    bills,
    donations,
    statement_imports: [],
    statement_lines: [],
    recurring_donors,
    inventory_items,
    congregants,
    muallaf,
    rooms,
    room_bookings,
    issues,
    events,
    tpa_students,
    tpa_attendance: [],
    letter_templates,
    letters: [],
    activity_logs: [],
  };
}
