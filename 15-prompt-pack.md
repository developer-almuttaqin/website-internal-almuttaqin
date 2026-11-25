# PRD-15 · Prompt Pack untuk Claude

Dua puluh empat prompt di bawah disusun berurutan dari repo kosong sampai launch web publik Al Muttaqin Cultural Center. Jalankan satu prompt per sesi Claude Code, dan baru lanjut setelah prompt sebelumnya lulus cek selesai.

## 1. Cara memakai

1.  Simpan setiap tab dokumen ini sebagai Markdown di `docs/prd/` (nama file mengikuti Master PRD bagian 10) dan letakkan `CLAUDE.md` dari Master PRD di root repo.

2.  Untuk setiap prompt, buka sesi baru Claude Code di folder repo, tempel templat pembuka, lalu tempel prompt Pxx.

3.  Bila Claude bertanya hal yang tidak dijawab PRD, putuskan, lalu catat keputusannya di `docs/prd/13-konten-keputusan.md` agar sesi berikutnya konsisten.

4.  Setelah selesai, jalankan `npm run lint && npm run typecheck && npm run test && npm run build`, cek di lebar 360 px dan 1280 px, commit, lalu ubah status tiket di PRD-11.

5.  Bila ada error, pakai templat perbaikan bug di bagian akhir.

## 2. Templat pembuka sesi

```text
Kamu adalah senior full-stack engineer yang membangun web publik Al Muttaqin Cultural Center
(almuttaqinculturalcenter.org): situs tiga bahasa, App Jamaah (PWA), dan admin konten.
Ikuti CLAUDE.md di root repo.

Sebelum menulis kode:
1. Baca docs/prd/00-master.md dan semua file PRD yang disebut di prompt.
2. Periksa kode yang sudah ada agar tidak membuat ulang komponen atau helper.
3. Tulis rencana singkat (5-10 poin: file yang dibuat/diubah), lalu langsung kerjakan.
4. Jangan mengerjakan di luar cakupan prompt; catat ide tambahan di docs/TODO.md.
5. Akhiri dengan: daftar file, cara menguji, dan hal yang perlu keputusan manusia.

Prompt sesi ini:
[TEMPEL PROMPT Pxx DI SINI]
```

## 3. Daftar prompt

| Prompt  | Hasil                                                                                       | Tiket              |
|---------|---------------------------------------------------------------------------------------------|--------------------|
| P00–P05 | Setup, design system, database, kontrak action, tiga bahasa, auth admin                     | T-003, T-010–T-013 |
| P06–P11 | Layout situs, jadwal salat, beranda, halaman konten, admin konten                           | T-020–T-032, T-063 |
| P12–P15 | Donasi, admin donasi & impor mutasi, agenda & formulir, peminjaman ruangan & program budaya | T-040–T-054        |
| P16–P21 | Kajian, App Jamaah, PWA & notifikasi, panduan, pencarian & admin sisa, gateway opsional     | T-060–T-074        |
| P22–P24 | SEO & keamanan, testing & CI, UAT & polesan                                                 | T-080–T-093        |

## 4. Fondasi (P00–P05)

### P00 · Setup proyek (T-003)

```text
Konteks: docs/prd/00-master.md, docs/prd/10-bahasa-seo-deploy.md

1. Pastikan proyek Next.js (App Router, TypeScript strict, Tailwind CSS v4, folder src/) berjalan.
2. Pasang: @supabase/supabase-js, @supabase/ssr, next-intl, zod, react-hook-form, @hookform/resolvers,
   lucide-react, motion, embla-carousel-react, adhan, @serwist/next, serwist, clsx, tailwind-merge,
   date-fns, date-fns-tz. Dev: vitest, @testing-library/react, @playwright/test. Inisialisasi shadcn/ui.
3. Buat struktur folder persis Master PRD bagian 6.2, ditambah src/lib/payments/, src/lib/donations/,
   dan src/components/signature/ (komponen elemen pembeda).
4. Jalankan supabase init. Buat .env.example berisi: NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_URL,
   NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_VAPID_PUBLIC_KEY,
   VAPID_PRIVATE_KEY, RESEND_API_KEY, NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY,
   YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID, PAYMENT_GATEWAY_ENABLED=false, MIDTRANS_SERVER_KEY,
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SYNC_OUTBOX_TOKEN,
   REVALIDATE_SECRET.
5. src/lib/env.ts: validasi env dengan Zod (dipisah server dan public); build gagal bila variabel wajib kosong.
6. Skrip npm: dev, build, start, lint, typecheck, test, test:e2e, db:types.
7. .github/workflows/ci.yml: install, lint, typecheck, test, build.
8. Halaman sementara /[locale] bertuliskan "Al Muttaqin Cultural Center" agar build lulus.

Jangan membuat fitur apa pun. Selesai: build lulus; tampilkan pohon folder dan daftar dependensi.
```

### P01 · Design system & elemen pembeda (T-010, T-063 bagian visual)

```text
Konteks: docs/prd/01-design-system.md (termasuk bagian 7A), gambar referensi UI di docs/ref/.

1. Token di src/app/globals.css: CSS variables light & dark persis tabel PRD-01, dipetakan ke @theme
   Tailwind v4 (warna, radius, bayangan, font).
2. Font lewat next/font: Plus Jakarta Sans, Noto Sans JP (hanya locale ja), Amiri.
3. Komponen dasar src/components/ui (shadcn dikustomisasi): Button (primary, outline, ghost, pill, icon),
   Badge, Card, Input, Textarea, Select, Tabs, Sheet, Dialog, Toast, Skeleton, Tooltip.
4. Komponen pola referensi src/components/shared: SectionTag, Heading (prop accent = kata berwarna merah),
   IconBadge, FeatureChip, StatCard (count-up), NumberedServiceRow, ProgramCard + QuotaBar, CarouselNav
   (Embla), StoryCard, ContactPanel, SocialCard (logo brand dari simple-icons), InstallCard, EmptyState.
5. Elemen pembeda src/components/signature:
   - PatternBackground: SVG berulang perpaduan bintang 8 sudut dan asanoha, opasitas 4-6%, prop tone;
   - TriScriptLabel: label Arab · Jepang · bahasa aktif (di layar sempit cukup Arab + bahasa aktif);
   - DayArc: busur SVG Subuh-Isya dengan titik tiap salat dan titik "sekarang" (props times & now);
   - BentoGrid: grid 12 kolom di desktop, menumpuk di HP sesuai prop order;
   - FloatingBottomNav: navigasi bawah pill mengambang, indikator aktif merah, aman untuk notch iOS;
   - NavbarPill: sticky, blur latar, berubah terang saat di-scroll;
   - ThemeController: terang / gelap / ikuti perangkat / otomatis malam (logika jadwal disambung di P07).
6. Halaman /dev/ui memamerkan semua komponen di mode terang dan gelap pada lebar 360, 768, dan 1280 px.

Aturan: tanpa emoji; ikon Lucide strokeWidth 1.5; tidak ada hex di komponen; fokus keyboard terlihat;
hormati prefers-reduced-motion. Selesai: Lighthouse aksesibilitas /dev/ui >= 95, build lulus.
```

### P02 · Database, RLS, storage, seed (T-011)

```text
Konteks: docs/prd/02-database.md (seluruhnya, termasuk 3.1 Perubahan v2).

1. Migration di supabase/migrations: enum (app_role: super_admin, editor, donasi; content_status; dll.),
   semua tabel bagian 3 dan tabel baru 3.1 (rooms, room_bookings, programs, statement_imports,
   statement_lines, payment_events, sync_outbox), kolom baru donation_confirmations, index, trigger
   updated_at, dan trigger log_activity.
2. RLS di setiap tabel sesuai kolom "Akses publik"; fungsi has_role; RPC upsert_push_subscription;
   tabel rate_limits untuk pembatasan kiriman formulir.
3. View: v_program_totals (hanya status matched/paid), v_event_capacity, v_room_availability (tanpa data
   pribadi). Jangan buat finance_entries dan v_finance_monthly (milik web internal).
4. Storage buckets: public-media, donation-proofs (privat), statement-files (privat), finance-docs, materials.
5. Full-text search: kolom tsvector + index GIN untuk posts, lectures, events, faqs, guides,
   dictionary_entries; fungsi search_all(query, locale).
6. supabase/seed.sql: pengaturan lembaga (Al Muttaqin Cultural Center, koordinat Matsudo placeholder),
   2 ruangan, 3 program budaya, 3 berita, 2 agenda, 10 FAQ, 30 istilah kamus, 15 bahan haram, 20 doa
   harian, QRIS dan rekening Japan Post Bank bertanda DEMO; teks ja/en/id, tanpa emoji.
7. Helper Supabase untuk Next.js (server, browser, middleware) dan database.types.ts hasil generate.
8. Test RLS: anon tidak bisa membaca donation_confirmations, statement_lines, room_bookings, messages,
   registrations, push_subscriptions; editor tidak bisa membaca data donasi.

Selesai: supabase db reset dan test lulus; ringkas kebijakan RLS per tabel.
```

### P03 · Kontrak Server Action (PRD-12)

```text
Konteks: docs/prd/12-kontrak-action-api.md (termasuk 4A Tambahan v2).

1. src/lib/actions/core.ts: tipe ActionResult dan ActionErrorCode, helper createAction({ schema, roles,
   rateLimit, turnstile, revalidate }) yang memvalidasi Zod, cek sesi & peran, rate limit (tabel
   rate_limits), verifikasi Turnstile, menulis activity_logs, lalu revalidateTag.
2. src/lib/cache-tags.ts: site, prayer, jumuah, posts, lectures, events, forms, donations, rooms,
   programs, guides, gallery, search.
3. Kerangka file action per modul (tanda tangan + skema Zod + TODO) untuk semua action di bagian 2, 3, 4A.
4. Generator nomor referensi AM-<jenis>-<6 karakter>.
5. Route handler /api/revalidate dengan REVALIDATE_SECRET.
6. Unit test createAction: validasi gagal, peran salah, rate limit, Turnstile gagal.

Selesai: test dan build lulus.
```

### P04 · Fondasi tiga bahasa

```text
Konteks: docs/prd/10-bahasa-seo-deploy.md bagian 1.

1. next-intl dengan locale ja, en, id; rute selalu berprefiks; middleware membaca Accept-Language lalu
   menyimpan cookie NEXT_LOCALE; default sementara ja (lihat keputusan K-03).
2. messages/{ja,en,id}.json per namespace: common, nav, home, prayer, donate, events, rooms, programs,
   guides, quran, app, admin, errors; glosarium istilah (salat, Jumat, infaq, iqamah, kiblat) konsisten.
3. Helper t(field, locale) untuk kolom jsonb dengan urutan fallback: bahasa diminta -> en -> ja -> id.
4. Util format: tanggal Masehi & Hijriah, jam (Asia/Tokyo), angka, mata uang JPY/IDR lewat Intl.
5. LanguageSwitcher yang mempertahankan path dan query; atribut lang per halaman; teks Arab diberi
   dir="rtl" hanya pada elemen ayat/doa.
6. Uji: halaman contoh tampil benar di tiga bahasa; teks Jepang memakai Noto Sans JP.
```

### P05 · Login admin & layout panel (T-013)

```text
Konteks: docs/prd/09-panel-admin.md (termasuk 3.1), docs/prd/12-kontrak-action-api.md.

1. /admin/login (email + password Supabase Auth), lupa password, MFA TOTP wajib untuk super_admin dan donasi.
2. Middleware melindungi /admin/*; guard peran di layout dan di setiap action (super_admin, editor, donasi).
3. Layout admin: sidebar berkelompok (Beranda, Ibadah, Konten, Kegiatan, Donasi, Layanan, Sistem) sesuai
   peran, topbar (pencarian, bahasa UI id/ja, profil), drawer di HP; dashboard mengikuti wireframe
   PRD-09 dengan data placeholder.
4. Komponen generik: DataTable (TanStack, paginasi di server), I18nFieldTabs (ja/en/id + penanda
   kelengkapan), ImageUploader (kompres + crop), ConfirmDialog, StatusBadge, ExportCsvButton.
5. Halaman Pengguna & Peran untuk super_admin: undang lewat email, ubah peran, nonaktifkan.

Selesai: diuji dengan tiga akun berbeda peran; build lulus.
```

## 5. Web inti (P06–P11)

### P06 · Layout situs & elemen global (T-020, T-064)

```text
Konteks: docs/prd/03-website-publik.md (bagian 3 dan 1.1), 01-design-system.md (7A),
08-panduan-layanan.md (kotak saran).

1. src/app/[locale]/(site)/layout.tsx: NavbarPill (logo, menu, LanguageSwitcher, ThemeController, tombol
   "Infaq" merah), bar pengumuman (site_settings.banner, bisa ditutup, diingat di localStorage), footer
   hitam dengan PatternBackground (InstallCard, tautan, alamat, sosial, hak cipta).
2. FloatingBottomNav khusus HP: Beranda, Jadwal, Kajian, Infaq, Lainnya (sheet menu lengkap).
3. Tombol mengambang "Tanya / Saran" (muncul setelah scroll 30%) membuka FeedbackSheet yang memanggil
   action submitMessage (isi lengkap di P19).
4. Dialog pencarian global (Ctrl/Cmd + K dan ikon kaca pembesar) memanggil search_all; hasil dikelompokkan
   per jenis; halaman /[locale]/search untuk hasil lengkap.
5. Pengaturan aksesibilitas: ukuran teks 3 tingkat dan kontras tinggi, disimpan di localStorage dan
   diterapkan sebagai atribut data pada <html>.
6. Breadcrumb + JSON-LD BreadcrumbList; halaman not-found dan offline memakai EmptyState.
7. View Transitions API untuk navigasi, dengan fallback tanpa animasi bila tidak didukung atau reduced motion.

Selesai: navigasi lengkap di 360/768/1280 px; Lighthouse aksesibilitas >= 95.
```

### P07 · Jadwal salat, Hijriah, Jumat & kartu Masjid hari ini (T-021, T-063)

```text
Konteks: docs/prd/04-jadwal-salat.md, 01-design-system.md (DayArc, ThemeController, 7A).

1. src/lib/prayer: getDayTimes, getNextPrayer, getMonthTimes, getIqamah memakai adhan, zona Asia/Tokyo,
   prayer_settings, dan prayer_overrides. Fungsi murni yang bisa dipakai di server, klien, service
   worker, dan Edge Function.
2. src/lib/hijri: tanggal Hijriah (Intl islamic-umalqura + hijri_offset), hari penting, pengingat puasa sunnah.
3. Sambungkan DayArc ke data asli (titik "sekarang" bergerak tiap menit) dan ThemeController mode
   "otomatis malam" (gelap dari Magrib sampai Subuh).
4. Komponen: NextPrayerChip, NextPrayerCard + CountdownRing, PrayerStrip, DailyPrayerTable,
   MonthlyPrayerTable, RamadanImsakiyah, JumuahCard, HijriBadge, dan MasjidTodayCard (status buka dari
   site_settings.opening_hours, salat berikutnya, kegiatan yang sedang berlangsung, pengumuman penting).
5. Halaman /[locale]/prayer-times (hari ini, bulanan, imsakiyah saat Ramadan, unduh PDF),
   /[locale]/jumuah, dan /[locale]/calendar (kalender Masehi-Hijriah + agenda masjid).
6. Route handler /api/calendar.ics (type=prayer|events) dan PDF jadwal bulanan.
7. Unit test: pergantian hari setelah Isya, override tanggal, iqamah mode offset/fixed, perhitungan tetap
   memakai Asia/Tokyo walau zona perangkat berbeda.

Selesai: test lulus; tampilkan contoh jadwal hari ini.
```

### P08 · Beranda section 1–9 (T-022)

```text
Konteks: docs/prd/03-website-publik.md bagian 2, 01-design-system.md (7A), wireframe beranda di Master PRD.

1. src/components/site/home/*: satu komponen per section; urutan dan tampil/sembunyi dari
   site_settings.home_sections.
2. Section 1-9: bar pengumuman; navbar; HeroDark (judul dua warna, chip salat berikutnya, DayArc tipis,
   tombol "Buka App Jamaah" dan "Jadwal lengkap", 4 FeatureChip melayang, foto masjid dengan next/image
   priority); PrayerStrip + HijriBadge; BentoGrid (MasjidTodayCard besar, JumuahCard, ringkasan donasi,
   kajian live atau berikutnya); LogoStrip mitra; Tentang + 4 StatCard (angka dari site_settings);
   NumberedServiceRow 01-06 (accordion); portal "Website ini untuk siapa?" (Jamaah, Muslim baru,
   Donatur, Warga Jepang).
3. Data diambil di Server Components dengan cache tag; skeleton untuk bagian klien.
4. Animasi fade-up sekali (Motion) dan count-up statistik; dimatikan bila reduced motion.

Selesai: Lighthouse mobile beranda >= 90 untuk performa, aksesibilitas, dan SEO; tanpa CLS dari font/gambar.
```

### P09 · Beranda section 10–18 (T-030)

```text
Konteks: docs/prd/03-website-publik.md bagian 2.

1. ProgramCarousel (agenda & program budaya terdekat dengan QuotaBar), KajianSection (banner merah
   "Sedang live" bila lectures.is_live, 3 video terbaru memakai lite YouTube embed), InfaqSection (program
   aktif + progres, ringkasan QRIS / Japan Post Bank, tombol ke /donate), NewsSection (pinned + 3
   terbaru), StoryCarousel (kartu gelap), GalleryCarousel (gaya post), FaqPreview (5 teratas),
   ContactPanel + peta Leaflet + SocialCard, footer dengan InstallCard.
2. Semua carousel aksesibel: tombol bulat, navigasi keyboard, aria-roledescription, berhenti saat hover/fokus.
3. Empty state bila data kosong.

Selesai: beranda lengkap 18 section; diuji di 360 dan 1280 px, mode terang dan gelap.
```

### P10 · Halaman konten (T-031)

```text
Konteks: docs/prd/03-website-publik.md (bagian 1 dan 1.1), 10-bahasa-seo-deploy.md (metadata).

1. /[locale]/about (sejarah, visi-misi, kemitraan, pengurus dari team_members, legalitas),
   /news dan /news/[slug] (filter tipe, artikel terkait, Web Share), /gallery (album + lightbox),
   /faq (kategori, pencarian, accordion, JSON-LD FAQPage), /contact (ContactPanel, peta, akses kereta,
   adab berkunjung), /privacy dan /terms (statis per bahasa).
2. Metadata per halaman per bahasa, generateStaticParams untuk slug, gambar OG bergaya poster (next/og).
3. Rich text (JSON Tiptap) dirender dengan renderer sendiri yang aman, tanpa HTML mentah.

Selesai: semua rute tampil di tiga bahasa; pergantian bahasa mempertahankan halaman.
```

### P11 · Admin konten (T-032)

```text
Konteks: docs/prd/09-panel-admin.md, 04-jadwal-salat.md, 12-kontrak-action-api.md.

1. Jadwal & Jumat: metode, mazhab, koreksi menit, iqamah per salat, hijri_offset, pengecualian tanggal,
   kalender Jumat (khatib, imam, bahasa, tema), mode Ramadan, pratinjau jadwal sebulan.
2. Berita & Pengumuman: editor Tiptap dengan I18nFieldTabs, cover (ImageUploader), sematkan, jadwal
   terbit, status, pratinjau draf.
3. Galeri & Kisah, Mitra, Pengurus (team_members), dan Pengaturan Situs (identitas, alamat, koordinat,
   jam buka, kontak, sosial, banner, home_sections, angka statistik).
4. Setiap simpan lewat action dengan revalidateTag dan activity_logs; toast sukses atau gagal.

Selesai: mengubah iqamah di admin langsung mengubah web; berita 3 bahasa bisa terbit < 3 menit.
```

## 6. Donasi & kegiatan (P12–P15)

### P12 · Donasi publik (T-040)

```text
Konteks: docs/prd/05-donasi.md (v2), 02-database.md (3.1), 12-kontrak-action-api.md (4A).

1. /[locale]/donate sebagai alur bertahap: program -> mata uang (Rupiah/Yen) -> formulir -> instruksi
   bayar -> layar "menunggu dicocokkan".
2. Formulir (React Hook Form + Zod + Turnstile): nominal (preset + bebas), nama atau anonim, kontak, email
   opsional untuk kuitansi, niat atas nama, pesan, nama katakana (wajib untuk Yen; terima katakana lebar
   penuh maupun setengah).
3. Action createDonationIntent: simpan donation_confirmations status pending dengan channel qris_static
   atau yucho_transfer, nominal unik Rupiah (tiga digit 001-999 yang unik di antara formulir pending 24
   jam terakhir, aman dari race condition), reference_code, expires_at 7 hari.
4. Instruksi QRIS: gambar QRIS dari site_settings (tombol unduh), nominal unik besar dengan tombol salin,
   catatan "bayar persis nominal ini". Instruksi Japan Post Bank: dua format (sesama Japan Post Bank dan
   dari bank lain) dari helper yucho.ts, tombol salin per baris, nama pemilik dalam katakana.
5. src/lib/donations/yucho.ts: konversi kode & nomor rekening umum ke format transfer dari bank lain
   (kode bank 9900; nomor cabang = digit ke-2 dan ke-3 kode + angka 8; jenis 普通; nomor rekening =
   nomor tanpa digit terakhir), validasi input, unit test dengan contoh resmi.
6. Program & progres dari v_program_totals per mata uang; progress bar ganda bila program menerima
   Rupiah dan Yen.
7. Donatur tetap (formulir 3 langkah + pengingat .ics / Google Calendar), kalkulator zakat (maal,
   penghasilan, fitrah; nilai dari site_settings), /[locale]/transparency (total terverifikasi + PDF).
8. Komponen InfaqQuick untuk App; banner Jumat Berkah pada hari Jumat waktu Asia/Tokyo.

Aturan: jangan pernah menampilkan data donatur lain; Yen dan Rupiah terpisah; tanpa emoji.
Selesai: alur dua mata uang diuji end-to-end; unit test helper dan nominal unik lulus.
```

### P13 · Admin donasi, impor mutasi & kuitansi (T-042, T-044, T-045)

```text
Konteks: docs/prd/05-donasi.md bagian 2-4, 09-panel-admin.md, 12-kontrak-action-api.md (4A).

1. Menu Donasi (peran donasi & super_admin): DataTable formulir (filter status, kanal, program, tanggal),
   halaman detail, tandai rejected/expired dengan catatan, ekspor CSV.
2. Impor mutasi: unggah laporan QRIS (CSV/XLSX) atau CSV ゆうちょダイレクト; deteksi encoding (UTF-8 atau
   Shift_JIS) dan format otomatis, pemetaan kolom manual yang bisa disimpan sebagai profil, pratinjau 20
   baris, hash file untuk menolak impor ganda; file disimpan di bucket statement-files (privat), baris di
   statement_imports dan statement_lines.
3. Pencocokan otomatis: Rupiah = nominal unik sama persis dalam 24 jam setelah formulir; Yen = nominal
   sama, tanggal +/- 2 hari, dan skor kemiripan nama katakana (normalisasi lebar, huruf kecil, dakuten).
   Skor di bawah ambang masuk antrean cocok manual: UI dua kolom (baris mutasi vs kandidat formulir).
4. Baris kredit tanpa formulir menjadi donasi "Hamba Allah" (program default) setelah dikonfirmasi admin.
5. Setelah matched: revalidateTag('donations'), kuitansi PDF (@react-pdf/renderer, bahasa donatur, nomor
   referensi) dikirim lewat Resend bila ada email, lalu entri sync_outbox.
6. Kelola program (target per mata uang), gambar QRIS, data rekening Japan Post Bank (input kode &
   nomor, tampilkan hasil konversi + pengingat cek dengan alat resmi), unggah PDF laporan transparansi.
7. Edge Function terjadwal harian: formulir pending lebih dari 7 hari menjadi expired.

Selesai: buat fixture CSV QRIS dan Japan Post Bank di tests/fixtures; minimal 90% baris fixture
cocok otomatis; impor ulang file yang sama ditolak.
```

### P14 · Agenda & formulir dinamis (T-050, T-051, T-052)

```text
Konteks: docs/prd/06-kegiatan-kajian.md bagian 1-2, 09-panel-admin.md.

1. /[locale]/events (daftar + kalender bulanan, filter kategori, bahasa, terbuka untuk umum) dan
   /events/[slug] (detail, sisa kuota dari v_event_capacity, .ics, Web Share, gambar OG bergaya poster).
2. Agenda berulang memakai paket rrule; tampilkan kemunculan 3 bulan ke depan.
3. Renderer formulir dinamis dari forms.schema: komponen per tipe field, label 3 bahasa, generator Zod dari
   JSON, Turnstile, layar sukses + nomor referensi, daftar tunggu otomatis, email konfirmasi, tautan
   pembatalan bertoken (cancelRegistration mempromosikan daftar tunggu teratas).
4. Templat formulir (seed JSON): Dauroh, TPA, Kelas muallaf, Relawan, Kelas bahasa, Kunjungan rombongan.
5. Admin: Agenda (CRUD + pembuat jadwal berulang sederhana), Form builder drag-and-drop (dnd-kit) dengan
   pratinjau langsung, Data Pendaftar (ubah status, ekspor CSV).

Selesai: agenda berulang benar 3 bulan ke depan; pendaftar ke-(kuota+1) masuk daftar tunggu dan menerima email.
```

### P15 · Peminjaman ruangan & program budaya (T-053, T-054)

```text
Konteks: docs/prd/08-panduan-layanan.md (5A, 5B), 03-website-publik.md (1.1), 12-kontrak-action-api.md (4A).

1. /[locale]/rooms: kartu ruangan (foto, kapasitas, fasilitas), kalender ketersediaan mingguan/bulanan dari
   v_room_availability (slot terisi tanpa detail), blok otomatis waktu salat berjamaah (src/lib/prayer)
   dan salat Jumat.
2. Formulir pengajuan (React Hook Form + Zod + Turnstile) dengan pemilih tanggal & jam, cek bentrok
   langsung di klien (debounce) dan di server (exclusion constraint tstzrange + btree_gist), aturan
   pemakaian wajib dicentang, batas minimal H-3 dari site_settings.
3. Action submitRoomBooking: status requested, nomor referensi, email konfirmasi. decideRoomBooking
   (editor): email hasil + .ics bila disetujui, revalidateTag('rooms').
4. Admin Peminjaman Ruangan (daftar + kalender, setujui/tolak dengan catatan) dan admin Ruangan & aturan.
5. /[locale]/programs dan /programs/[slug]: kelas bahasa, open mosque & tur, kunjungan sekolah, festival;
   pendaftaran memakai renderer formulir P14; admin Program Budaya.
6. Kerangka /[locale]/about-islam (isi dari guides section muallaf, utama bahasa Jepang); konten lengkap di P19.

Selesai: slot bentrok dan waktu salat tidak bisa dipesan; email terkirim di setiap perubahan status.
```

## 7. App, layanan & tambahan (P16–P21)

### P16 · Kajian & siaran live (T-060)

```text
Konteks: docs/prd/06-kegiatan-kajian.md bagian 3-4.

1. /[locale]/lectures dan /lectures/[id]: pustaka video (kategori aqidah, fikih, sirah, adab, bahasa
   Jepang), filter ustadz, pencarian, lite YouTube embed, materi PDF, kanal rekomendasi.
2. Banner merah "Sedang live" di beranda, /lectures, dan App bila lectures.is_live.
3. Edge Function check-youtube-live: hanya berjalan di jendela jadwal kajian (dari events kategori kajian),
   tiap 3 menit memanggil YouTube Data API (siaran live di kanal masjid), memperbarui lectures.is_live,
   lalu memanggil /api/revalidate. Admin tetap bisa menyalakan/mematikan manual.
4. Notifikasi "Kajian sedang berlangsung" ke pelanggan topik kajian (stub bila infrastruktur push P18 belum ada).
5. Admin Kajian & Video: CRUD, unggah materi, sakelar live manual.

Selesai: banner muncul paling lambat 5 menit setelah siaran mulai (uji dengan mock API).
```

### P17 · App Jamaah: layar, kiblat, Al-Qur’an, tasbih (T-061, T-062)

```text
Konteks: docs/prd/07-app-jamaah-pwa.md (bagian 4 + wireframe), 04-jadwal-salat.md, 03-website-publik.md (1.1).

1. Layout /[locale]/app: header ringkas (salam, HijriBadge, pemilih bahasa), FloatingBottomNav 5 tab
   (Beranda, Jadwal, Infaq, Info, Saran), aman untuk notch iOS, tanpa footer situs.
2. Beranda App: NextPrayerCard + CountdownRing + DayArc, 5 waktu salat, JumuahCard, 8 akses cepat (Kiblat,
   Al-Qur'an, Doa, Kajian, Infaq, Agenda, Kamus, Radar), hadits atau doa harian, kartu kontekstual (dzikir
   pagi setelah Subuh, sunnah Jumat, tahajud).
3. Kiblat: bearing great-circle dari koordinat (lokasi pengguna bila diizinkan, default masjid) ke Ka'bah
   (21.4225, 39.8262); kompas dari DeviceOrientationEvent (iOS: requestPermission dan
   webkitCompassHeading), petunjuk kalibrasi, cadangan berupa garis arah di peta Leaflet.
4. Al-Qur'an: /[locale]/quran dan /quran/[surah] memakai API publik (mis. Quran.com) lewat route handler
   dengan cache 30 hari; teks Arab (Amiri, rtl), terjemahan sesuai bahasa bila tersedia, penanda terakhir
   dibaca di localStorage, atribusi sumber.
5. Doa & dzikir (pagi/petang, harian, setelah salat; Arab + latin + terjemahan) dan tasbih digital
   (hitungan, target 33/99, getar lewat navigator.vibrate bila tersedia).
6. Kalender Hijriah (pakai ulang /calendar), Infaq cepat (InfaqQuick), Bantuan jamaah (info terbaru, tanya
   pengurus, lapor fasilitas, nomor darurat 110/119, lokasi), Pengaturan (bahasa, tema, notifikasi, sumber
   lokasi jadwal).

Selesai: semua layar berfungsi di HP 360 px; arah kiblat selisih < 1 derajat dari perhitungan referensi.
```

### P18 · PWA offline & notifikasi push (T-070, T-071)

```text
Konteks: docs/prd/07-app-jamaah-pwa.md bagian 1-3, 12-kontrak-action-api.md.

1. src/app/manifest.ts: name "Al Muttaqin Cultural Center", short_name "Al Muttaqin", start_url
   /[locale]/app (bahasa terakhir), display standalone, theme & background #0A0A0A, ikon 192/512 +
   maskable, shortcuts Jadwal / Kiblat / Infaq.
2. Serwist: precache shell App, font, ikon; runtime cache (stale-while-revalidate untuk berita, agenda,
   kajian; cache-first untuk doa, kamus, bahan haram, surah yang pernah dibuka); halaman fallback offline;
   toast "Versi baru tersedia".
3. Jadwal 30 hari tetap dihitung offline dari pengaturan yang disimpan di IndexedDB.
4. Kartu install kustom (beforeinstallprompt) muncul di kunjungan kedua; sheet panduan iOS (Bagikan ->
   Tambahkan ke Layar Utama).
5. Push: tombol opt-in (izin tidak pernah diminta saat halaman pertama dibuka), preferensi per salat
   (0/5/10/15 menit sebelumnya), Jumat & Al-Kahfi, kajian live, pengumuman, puasa sunnah; RPC
   upsert_push_subscription; Edge Function send-prayer-push (cron tiap menit, logika prayer versi Deno,
   web-push VAPID) dan send-scheduled-campaigns; teks notifikasi 3 bahasa tanpa emoji.
6. Antrean offline (IndexedDB + Background Sync bila didukung) untuk formulir saran dan donasi.

Selesai: audit PWA Lighthouse lulus; dalam mode pesawat beranda App, jadwal, doa, dan kamus tetap
terbuka; notifikasi tiba di Android dan iPhone yang sudah meng-install App.
```

### P19 · Panduan, halal, Mengenal Islam & kotak saran (T-072)

```text
Konteks: docs/prd/08-panduan-layanan.md (bagian 1-5), 03-website-publik.md (1.1).

1. /[locale]/newcomers: stepper "Mulai dari sini" dari guides (section newcomer) dengan IconBadge.
2. /[locale]/halal dengan tab: Bahan haram (cari kanji/kana/romaji), Cek label (sorot istilah + ringkasan;
   normalisasi katakana lebar penuh/setengah), Radar halal (Leaflet + OSM, filter jenis, formulir usulkan
   tempat), Kamus dakwah (salin + mode teks besar).
3. Isi lengkap /[locale]/about-islam (bahasa Jepang utama), adab berkunjung, formulir kunjungan rombongan.
4. FeedbackSheet lengkap: kategori (saran, tanya pengurus, tanya ustadz, lapor fasilitas, kendala web/App,
   lainnya), anonim opsional, foto untuk lapor fasilitas (dikompres, maks. 5 MB), nomor referensi, email ke
   editor per kategori, cadangan WhatsApp.
5. Versi ringkas Kamus Saku dan Radar Halal untuk App, ikut di-cache offline.

Selesai: cek label menyorot semua istilah haram pada teks contoh; pesan anonim tersimpan tanpa identitas.
```

### P20 · Admin sisa, dashboard & pencarian (T-073, T-064)

```text
Konteks: docs/prd/09-panel-admin.md, 03-website-publik.md (1.1).

1. Admin: Panduan, FAQ, Kamus, Bahan haram, Tempat (setujui usulan), Konten harian (doa/hadits), Kotak
   Masuk (status, penanggung jawab, catatan internal), Notifikasi Push (buat, target bahasa/topik,
   jadwalkan, statistik), Log Aktivitas (filter, perbedaan sebelum/sesudah).
2. Dashboard admin dengan data nyata: kartu ringkasan, antrean tugas (donasi menunggu dicocokkan, pesan
   baru, pengajuan ruangan, usulan tempat, daftar tunggu), agenda terdekat, aktivitas terakhir.
3. Pencarian global disempurnakan: bobot judul lebih tinggi dari isi, kata dicari disorot, saran kata
   kunci populer dari admin, hasil mengikuti bahasa aktif.

Selesai: setiap menu admin punya empty state, skeleton, dan toast; dashboard sesuai wireframe PRD-09.
```

### P21 · Gateway otomatis opsional (T-074)

```text
Konteks: docs/prd/05-donasi.md (kanal opsional), 12-kontrak-action-api.md (webhook).
Jalankan hanya bila pengurus sudah menyetujui jalur otomatis.

1. src/lib/payments/types.ts (interface PaymentProvider: createPayment, verifyWebhook, parseEvent),
   midtrans.ts (QRIS dinamis), stripe.ts (transfer bank Jepang via customer_balance, kartu, PayPay, konbini).
2. Di /donate: bila PAYMENT_GATEWAY_ENABLED=true, tampilkan opsi "Bayar otomatis" di samping QRIS statis
   dan transfer manual; channel qris_dynamic atau stripe.
3. /api/webhooks/midtrans (verifikasi signature_key SHA512) dan /api/webhooks/stripe (constructEvent
   dengan STRIPE_WEBHOOK_SECRET): simpan payment_events (event_id unik), set status paid secara
   idempoten, revalidate, kuitansi, sync_outbox.
4. Tampilkan biaya per metode secara transparan di layar pembayaran.
5. Test: webhook duplikat tidak tercatat dua kali; signature salah ditolak 400; flag false menyembunyikan opsi.

Selesai: diuji di sandbox Midtrans dan mode test Stripe.
```

## 8. Rilis (P22–P24)

### P22 · SEO, keamanan & analitik (T-080)

```text
Konteks: docs/prd/10-bahasa-seo-deploy.md bagian 2-4.

1. Metadata, canonical, dan hreflang (ja/en/id + x-default) di semua halaman; sitemap.ts dinamis (halaman,
   berita, agenda, program, kajian); robots.ts; gambar OG bergaya poster lewat next/og untuk halaman
   tanpa gambar.
2. JSON-LD: Mosque dengan alamat, koordinat, jam buka; Event; Article; FAQPage; BreadcrumbList; Organization.
3. Header keamanan di next.config: CSP (izinkan Supabase, YouTube, Turnstile, tile peta OSM, API
   Al-Qur'an; Midtrans dan Stripe hanya bila flag aktif), HSTS, X-Frame-Options DENY, Referrer-Policy,
   Permissions-Policy (geolocation dan sensor orientasi hanya untuk situs sendiri).
4. Rate limit di semua formulir publik, validasi tipe & ukuran file, sanitasi nama file.
5. Vercel Analytics + Speed Insights; event tanpa data pribadi (install App, aktifkan notifikasi, salin
   rekening, kirim formulir donasi, daftar kegiatan, ajukan ruangan, buka kajian live).
6. Kebijakan privasi (APPI) dan ketentuan tertaut di footer dan di setiap formulir.

Selesai: Lighthouse SEO 100 di beranda; skor header keamanan minimal A.
```

### P23 · Testing, CI & dokumen serah terima (T-081)

```text
Konteks: docs/prd/10-bahasa-seo-deploy.md bagian 5-6, 14-uat-serah-terima.md.

1. Vitest: jadwal salat & iqamah, Hijriah, helper Japan Post Bank, nominal unik, pencocokan mutasi,
   generator Zod formulir dinamis, helper i18n, createAction.
2. Test RLS (SQL) untuk semua tabel sensitif dan setiap peran.
3. Playwright (HP 390 px dan desktop 1280 px): beranda 3 bahasa; alur donasi Rupiah & Yen sampai
   "menunggu"; impor fixture & cocok otomatis di admin; pendaftaran sampai daftar tunggu; pengajuan &
   persetujuan ruangan; admin menerbitkan berita; App dalam mode offline.
4. Lighthouse CI (budget performa mobile >= 90) dan axe di setiap pull request.
5. GitHub Actions: lint, typecheck, unit, RLS, e2e, build; supabase db push di main; preview Vercel per PR.
6. docs/HANDOVER.md: arsitektur, cara deploy, menambah admin, rotasi kunci, backup, langkah impor mutasi
   harian untuk bendahara, kontak teknis.

Selesai: CI hijau; laporkan cakupan test dan skor Lighthouse.
```

### P24 · Data UAT & polesan akhir (T-083, T-090)

```text
Konteks: docs/prd/14-uat-serah-terima.md, 13-konten-keputusan.md, 01-design-system.md.

1. supabase/seed-uat.sql: data demo realistis 3 bahasa (berita, agenda berkuota kecil, kajian, program
   donasi, QRIS & rekening bertanda DEMO, ruangan, program budaya, kamus, FAQ, tempat halal) dan 3 akun
   uji (super_admin, editor, donasi) dari variabel lingkungan.
2. Banner "Lingkungan uji" bila NEXT_PUBLIC_ENV=uat.
3. docs/UAT.md: skenario PRD-14 ditambah skenario v2 (donasi QRIS & Japan Post Bank dengan impor fixture,
   pengajuan ruangan, program budaya, Al-Qur'an, kiblat, tema malam otomatis) sebagai daftar periksa
   langkah demi langkah dalam bahasa Indonesia.
4. Polesan: konsistensi spasi, radius, dan warna terhadap PRD-01; empty state dan error state di semua
   halaman; daftar teks Jepang yang belum dicek penutur di docs/TODO.md; grep memastikan tidak ada emoji
   dan tidak ada hex di komponen.

Selesai: seed bisa dijalankan ulang tanpa duplikasi; checklist launch PRD-10 bagian 7 siap dicentang.
```

## 9. Templat pendukung

**Perbaikan bug**

```text
Ada masalah di [fitur / halaman].
Langkah mereproduksi: [1, 2, 3]
Yang diharapkan: [...]
Yang terjadi: [...]
Pesan error lengkap:
[tempel error atau log]

Perbaiki penyebabnya tanpa mengubah fitur lain. Jelaskan akar masalah dalam 2-3 kalimat, tambahkan test
yang gagal sebelum perbaikan dan lulus sesudahnya, lalu jalankan lint, typecheck, test, dan build.
```

**Review kode**

```text
Review perubahan di branch ini terhadap main. Periksa kesesuaian dengan PRD terkait dan CLAUDE.md,
keamanan (RLS, validasi, data sensitif yang terkirim ke klien), aksesibilitas, performa (gambar, JS klien),
konsistensi design token, teks tanpa terjemahan, emoji, dan hex di komponen. Beri daftar temuan berurutan
(kritis, penting, saran) dengan file:baris dan usulan perbaikan. Jangan mengubah kode sebelum saya setujui.
```

**Melanjutkan sesi yang terpotong**

```text
Lanjutkan pekerjaan Pxx dari sesi sebelumnya. Baca docs/TODO.md dan 10 commit terakhir di git log,
ringkas apa yang sudah selesai dan sisa langkahnya, lalu teruskan sampai cek selesai Pxx lulus.
```
