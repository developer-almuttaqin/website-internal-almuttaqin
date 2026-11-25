# PRD v2 — Web Publik Al Muttaqin Cultural Center (lengkap)

Gabungan 16 dokumen PRD dalam satu file. Untuk Claude Code, pakai file per modul di `docs/prd/`.

**Daftar isi**

1. PRD v2 — Web Publik Al Muttaqin Cultural Center
2. PRD-01 · Design System & UI
3. PRD-02 · Database & Supabase
4. PRD-03 · Website Publik
5. PRD-04 · Jadwal Salat, Jumat & Kalender
6. PRD-05 · Donasi QRIS & Japan Post Bank (v2)
7. PRD-06 · Kegiatan, Kajian & Pendaftaran
8. PRD-07 · App Jamaah (PWA)
9. PRD-08 · Panduan Muslim & Layanan Jamaah
10. PRD-09 · Panel Admin
11. PRD-10 · Bahasa, SEO, Keamanan & Deploy
12. PRD-11 · Backlog & Sprint
13. PRD-12 · Kontrak Server Action & API
14. PRD-13 · Konten & Keputusan Pengurus
15. PRD-14 · UAT, Serah Terima & Biaya
16. PRD-15 · Prompt Pack untuk Claude


---

# PRD v2 — Web Publik Al Muttaqin Cultural Center

Oct 29, 2026 · @Riswan Ramadhan

**Ruang lingkup v2:** dokumen ini hanya untuk web publik `almuttaqinculturalcenter.org` — situs tiga bahasa, App Jamaah (PWA), dan admin konten — yang berjalan di server dan database sendiri. Web internal pengurus di `pengurus-acc.online` (kas, inventaris, data jamaah, persetujuan direktur) dibangun belakangan dan dirancang di [Sistem Internal & Donasi Al Muttaqin Cultural Center](https://claude.ai/artifact/TtYFD2mmfMnAxecMpg9Wze). Donasi: Rupiah lewat QRIS dan Yen lewat Japan Post Bank, dengan jalur otomatis Midtrans dan Stripe sebagai opsi.

## 1. Ringkasan produk

Produk ini adalah web publik Al Muttaqin Cultural Center di Matsudo, Chiba: website resmi tiga bahasa (Jepang, Inggris, Indonesia), App Jamaah yang bisa di-install di HP (PWA), dan admin konten. Dibangun dengan Next.js dan Supabase, responsif di semua layar, dengan tampilan modern minimalis mengikuti referensi UI dan palet merah gelap, hitam, putih.

**Status masjid.** Masjid sudah siap digunakan, sehingga fokus produk bergeser dari penggalangan dana pembangunan ke pemakmuran masjid: salat berjamaah, kajian, pembinaan muallaf, pendidikan anak, dan infaq operasional.

**Latar belakang.** Al-Muttaqin adalah Islamic Center di Matsudo, Chiba, hasil kolaborasi Chiba Islamic Culture Center (Sensei Kyoichiro Sugimoto) dan Dompet Dhuafa. Visinya mencakup tempat ibadah, pusat muallaf, pendidikan generasi muda, dan ekonomi halal ([Dompet Dhuafa](https://www.dompetdhuafa.org/en/to-strengthen-the-spread-of-islam-dompet-dhuafa-supports-the-construction-of-the-al-muttaqin-mosque-as-an-islamic-cultural-centre-in-chiba-japan/)).

**Standar fitur.** Acuannya adalah [Masjid As-Sunnah Hekinan](https://assunnahhekinan.org/) (web + [App Jamaah PWA](https://assunnahhekinan.org/app.html)) dan [As-Sholihin Yokohama](https://masjidassholihinyokohama.org/), lalu ditingkatkan dengan database dan panel admin sungguhan (lihat bagian 3).

**Tujuan**

1.  Satu pintu informasi resmi dalam bahasa Jepang, Inggris, dan Indonesia.

2.  App Jamaah yang bisa di-install: jadwal salat, notifikasi adzan, kiblat, info Jumat, kajian.

3.  Infaq operasional yang transparan: rekening resmi, konfirmasi donasi, laporan berkala.

4.  Pengurus mengelola semua konten sendiri tanpa developer.

5.  Ramah bagi muallaf, muslim yang baru pindah ke Chiba, dan warga Jepang.

**Metrik keberhasilan (usulan, disepakati bersama pengurus)**

| Metrik                                             | Target                                                               |
|----------------------------------------------------|----------------------------------------------------------------------|
| Lighthouse mobile (performa · aksesibilitas · SEO) | ≥ 90 di ketiganya                                                    |
| PWA                                                | Installable di Android & iOS, jadwal salat tetap tampil saat offline |
| Jamaah meng-install App                            | ≥ 100 perangkat dalam 3 bulan pertama                                |
| Waktu admin menerbitkan pengumuman 3 bahasa        | \< 3 menit                                                           |
| Konten diperbarui pengurus sendiri                 | ≥ 4 kali per bulan setelah serah terima                              |

**Yang baru di v2**

- Identitas Al Muttaqin Cultural Center dengan domain `almuttaqinculturalcenter.org`.

- Donasi QRIS (Rupiah) dan Japan Post Bank (Yen) dengan nominal unik dan pencocokan mutasi; jalur otomatis Midtrans dan Stripe sebagai opsi (PRD-05).

- Peminjaman ruangan, program budaya (kelas bahasa, open mosque, kunjungan sekolah), dan halaman Mengenal Islam (PRD-08).

- Elemen UI pembeda: busur hari salat, pola geometris Islam × Jepang, label tiga aksara, tema malam otomatis (PRD-01).

- Baca Al-Qur’an, tasbih digital, kalender Hijriah interaktif, dan pencarian global (PRD-03 & PRD-07).

- Prompt pack berurutan dan detail untuk Claude (PRD-15).

- Fitur keuangan internal (buku kas, anggaran, inventaris) dipindah ke web internal.

## 2. Persona pengguna

Enam kelompok pengguna dilayani, dan beranda web maupun App harus menjawab kebutuhan utama masing-masing dalam satu kali scroll.

| Persona                 | Siapa                                               | Kebutuhan utama                                                    | Bahasa     | Pintu masuk   |
|-------------------------|-----------------------------------------------------|--------------------------------------------------------------------|------------|---------------|
| Jamaah tetap            | Muslim yang tinggal/bekerja di Matsudo & sekitarnya | Jadwal salat & iqamah, info Jumat, kajian, pengumuman              | ID, EN, JP | App Jamaah    |
| Muslim baru di Chiba    | Pekerja, pelajar, peserta magang yang baru pindah   | Lokasi masjid, halal, transportasi, aturan sampah, kontak pengurus | ID, EN     | Web → Panduan |
| Muallaf & calon muallaf | Warga Jepang yang mengenal Islam                    | Kelas dasar Islam, pembimbing, FAQ, materi bahasa Jepang           | JP         | Web           |
| Donatur                 | Jamaah, diaspora Indonesia, perusahaan              | Rekening resmi, konfirmasi infaq, donatur tetap, laporan dana      | ID, JP     | Web & App     |
| Warga & tamu            | Tetangga, sekolah, wisatawan muslim                 | Profil masjid, adab berkunjung, akses, kegiatan terbuka            | JP, EN     | Web           |
| Pengurus (admin)        | Tim masjid & Chiba Islamic Culture Center           | Kelola konten cepat, lihat pendaftar & konfirmasi donasi           | ID / JP    | Panel admin   |

**Pertanyaan terbuka untuk pengurus:** siapa saja admin pertama, dan bahasa apa yang mereka pakai sehari-hari?

## 3. Benchmark: Hekinan & Yokohama

Hekinan sudah sangat lengkap dari sisi fitur, tetapi datanya diambil dari file CSV dan semua formulir berakhir di WhatsApp; Al-Muttaqin mengambil seluruh fiturnya lalu memindahkannya ke database dengan panel admin sungguhan.

| Aspek          | [As-Sholihin Yokohama](https://masjidassholihinyokohama.org/) | [As-Sunnah Hekinan](https://assunnahhekinan.org/)                                | Al-Muttaqin Chiba (target)                                                             |
|----------------|---------------------------------------------------------------|----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| Teknologi      | WordPress + Elementor                                         | HTML statis, konten dari URL CSV                                                 | Next.js + Supabase, data relasional                                                    |
| Jadwal salat   | Foto jadwal iqamah dari WhatsApp                              | Dihitung otomatis + info Jumat (khatib, imam, waktu)                             | Otomatis + iqamah & Jumat dari admin, Hijriah, imsakiyah Ramadan                       |
| App / PWA      | Tidak ada                                                     | App Jamaah terpisah dengan tombol install                                        | Satu codebase, PWA penuh: offline, notifikasi adzan, navigasi bawah                    |
| Infaq          | Tautan LaunchGood                                             | Rekening JP & ID + tombol salin, konfirmasi via WA, donatur tetap, progres wakaf | Semua fitur itu + konfirmasi tersimpan di database, laporan keuangan, kalkulator zakat |
| Kajian         | Artikel blog                                                  | Video YouTube + deteksi live, form pendaftaran dauroh                            | Video & live, pendaftaran dinamis dengan kuota, ekspor CSV                             |
| Layanan jamaah | Halaman kontak                                                | Panduan muslim lokal, kanji haram, kamus dakwah, radar halal, FAQ, kotak saran   | Diadaptasi untuk Chiba; saran & laporan fasilitas masuk ke panel admin                 |
| Admin          | Dashboard WordPress                                           | Form konfigurasi URL CSV                                                         | Panel admin dengan peran, dashboard, log aktivitas                                     |
| Bahasa         | ID + JP bercampur di satu halaman                             | Web ID & EN; App ID, EN, JP                                                      | JP, EN, ID dengan rute terpisah                                                        |
| Gaya visual    | Template Elementor                                            | Banyak emoji                                                                     | Modern minimal, ikon Lucide, tanpa emoji                                               |

## 4. Peta modul PRD

Spesifikasi dipecah menjadi 10 PRD fitur dan 5 dokumen pelaksanaan. Untuk membangun, cukup ikuti urutan prompt di PRD-15; PRD lain menjadi rujukan detail yang dilampirkan di setiap prompt.

| PRD                                | Isi utama                                                                 | Fase                           |
|------------------------------------|---------------------------------------------------------------------------|--------------------------------|
| PRD-01 · Design System & UI        | Palet, tipografi, ikon, komponen, elemen pembeda                          | 1                              |
| PRD-02 · Database & Supabase       | Skema SQL, relasi, RLS, storage, seed data                                | 1                              |
| PRD-03 · Website Publik            | Semua halaman & section web publik, pencarian global                      | 1                              |
| PRD-04 · Jadwal Salat & Jumat      | Jadwal salat, iqamah, Jumat, Hijriah, Ramadan                             | 1                              |
| PRD-05 · Donasi QRIS & Japan Post  | Donasi QRIS & Japan Post Bank, pencocokan mutasi, jalur otomatis opsional | 1                              |
| PRD-09 · Panel Admin               | Admin konten, admin donasi sementara, peran, ekspor                       | 1–2, dibangun bersama modulnya |
| PRD-06 · Kegiatan & Kajian         | Agenda, kajian, video live, pendaftaran, TPA, kelas muallaf               | 2                              |
| PRD-07 · App Jamaah (PWA)          | Install, offline, notifikasi adzan, kiblat, Al-Qur’an, doa & dzikir       | 2                              |
| PRD-08 · Panduan & Layanan         | Panduan, halal, kamus, FAQ, saran, peminjaman ruangan, program budaya     | 2                              |
| PRD-10 · Bahasa, SEO & Deploy      | Tiga bahasa, SEO, keamanan, testing, deploy                               | 1 & 3                          |
| PRD-11 · Backlog & Sprint          | Tiket per sprint, estimasi, ketergantungan, status                        | Pelaksanaan                    |
| PRD-12 · Kontrak Action & API      | Kontrak Server Action & route handler                                     | Pelaksanaan                    |
| PRD-13 · Konten & Keputusan        | Konten & aset dari pengurus, keputusan, agenda rapat                      | Pelaksanaan                    |
| PRD-14 · UAT, Serah Terima & Biaya | Skenario UAT, pelatihan, serah terima, perawatan, biaya                   | Pelaksanaan                    |
| PRD-15 · Prompt Pack Claude        | Urutan lengkap prompt detail untuk Claude, dari setup sampai launch       | Pelaksanaan                    |

**Fase 3 (opsional, setelah launch):** jalur donasi otomatis bila belum diaktifkan (QRIS dinamis Midtrans, Stripe untuk transfer bank virtual, kartu, dan PayPay), newsletter email, kartu ucapan hari raya, dan direktori usaha halal Chiba.

## 5. Sitemap & alur

Satu aplikasi Next.js melayani tiga pintu: website publik tiga bahasa, App Jamaah yang bisa di-install, dan panel admin tertutup untuk pengurus.

![sitemap v2 · 20 halaman web, 11 layar App, 16 menu admin](docs/prd/assets/00-master/sitemap.png)

sitemap v2 · 20 halaman web, 11 layar App, 16 menu admin

Web dan App memakai komponen dan data yang sama; App adalah tampilan ringkas untuk HP yang tetap bekerja offline. Setiap menu admin mengisi halaman di keduanya, dan hanya admin terverifikasi yang bisa menerbitkan.

![flowchart alur admin menerbitkan konten](docs/prd/assets/00-master/alur-admin-terbit.png)

flowchart alur admin menerbitkan konten

Konten yang belum siap disimpan sebagai draf; hanya konten yang diterbitkan yang memicu revalidate dan langsung tampil.

**Alur jamaah utama:** buka web atau App → bahasa terdeteksi dari browser (bisa diganti) → beranda menampilkan salat berikutnya, hitung mundur iqamah, info Jumat, dan pengumuman → jamaah membuka kajian, mendaftar kegiatan, menyalin rekening lalu mengonfirmasi infaq, atau mengirim saran ke pengurus.

## 6. Arsitektur teknis

Web publik berjalan sebagai satu aplikasi Next.js (App Router, TypeScript) di Vercel dengan proyek Supabase sendiri, terpisah dari web internal pengurus yang dibangun belakangan. Supabase menyimpan konten, akun admin, file, dan data donasi sementara, sekaligus menjadwalkan notifikasi push.

![arsitektur sistem · Next.js di Vercel + Supabase](docs/prd/assets/00-master/arsitektur.png)

arsitektur sistem · Next.js di Vercel + Supabase

Halaman web dan App dirender di server lalu di-cache (ISR); service worker menyimpan jadwal salat dan halaman inti agar tetap terbuka saat offline. Notifikasi adzan dikirim Edge Function terjadwal lewat Web Push ke HP jamaah yang mengizinkan.

### 6.1 Tech stack

| Lapisan            | Pilihan                                                     | Catatan                                  |
|--------------------|-------------------------------------------------------------|------------------------------------------|
| Framework          | Next.js (App Router) + TypeScript strict                    | Server Components, ISR, Server Actions   |
| Styling & komponen | Tailwind CSS v4 + shadcn/ui (Radix)                         | Dikustomisasi sesuai PRD-01              |
| Ikon               | lucide-react                                                | Satu set ikon garis; tanpa emoji         |
| Animasi & carousel | Motion + Embla Carousel                                     | Hormati `prefers-reduced-motion`         |
| Multibahasa        | next-intl                                                   | Rute `/ja`, `/en`, `/id`                 |
| Backend            | Supabase: Postgres, Auth, Storage, Realtime, Edge Functions | RLS di setiap tabel                      |
| Waktu salat        | adhan (adhan-js)                                            | Dihitung lokal dari koordinat masjid     |
| Kalender Hijriah   | `Intl.DateTimeFormat` kalender `islamic-umalqura`           | Koreksi ±1 hari dari admin               |
| PWA                | Serwist (`@serwist/next`)                                   | Precache, fallback offline               |
| Notifikasi         | Web Push (VAPID) + Edge Function cron                       | Izin diminta setelah aksi pengguna       |
| Editor konten      | Tiptap                                                      | Isi 3 bahasa dalam satu formulir         |
| Form & validasi    | React Hook Form + Zod                                       | Satu skema untuk klien dan server        |
| Peta               | Leaflet + OpenStreetMap                                     | Lokasi masjid & radar halal              |
| Email & anti-spam  | Resend + Cloudflare Turnstile                               | Notifikasi ke pengurus, form publik aman |
| Analitik           | Vercel Analytics                                            | Tanpa cookie pelacak                     |
| Testing            | Vitest + Playwright                                         | Unit & alur end-to-end                   |
| Hosting            | Vercel + GitHub                                             | Preview otomatis per branch              |

### 6.2 Struktur folder

Struktur ini menjadi acuan bersama untuk semua prompt; skema database lengkap ada di PRD-02 · Database & Supabase.

```text
src/
  app/
    [locale]/
      (site)/              # website publik
        page.tsx           # beranda
        about/ prayer-times/ jumuah/ lectures/ events/ news/
        donate/ transparency/ newcomers/ halal/ gallery/ faq/ contact/
      app/                 # App Jamaah (PWA), layout dengan bottom nav
        page.tsx prayer/ qibla/ dua/ live/ donate/ help/ dictionary/ radar/ settings/
    admin/                 # panel admin (UI bahasa Indonesia & Jepang)
    api/                   # push/subscribe, revalidate, calendar.ics
    manifest.ts  sitemap.ts  robots.ts  sw.ts
  components/  ui/ site/ app/ admin/ shared/
  lib/  supabase/ prayer/ hijri/ i18n/ validations/ utils/
  messages/  ja.json en.json id.json
supabase/
  migrations/  seed.sql  functions/push-adzan/
```

### 6.3 Konvensi kode

- TypeScript strict, tanpa `any`; tipe database di-generate dengan `supabase gen types`.

- Server Components secara default; `"use client"` hanya untuk bagian interaktif.

- Semua mutasi lewat Server Actions yang memvalidasi dengan Zod dan mengecek peran admin.

- Teks antarmuka tidak boleh di-hardcode: selalu dari `messages/*.json`.

- Commit kecil per fitur dengan format Conventional Commits (`feat:`, `fix:`).

## 7. Kebutuhan non-fungsional

Produk harus ringan di HP jamaah, tetap berguna saat sinyal buruk, terbaca dalam tiga bahasa, dan aman meski dikelola pengurus non-teknis.

| Aspek            | Standar                                                               | Cara memenuhi                                                                               |
|------------------|-----------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| Performa         | Lighthouse mobile ≥ 90, LCP \< 2,5 dtk, CLS \< 0,1                    | RSC, ISR, `next/image` AVIF/WebP, font subset, JS klien minimal                             |
| PWA              | Installable, ikon & splash screen, start URL `/[locale]/app`          | Web manifest + Serwist, prompt install kustom                                               |
| Offline          | Jadwal salat 30 hari ke depan, beranda App, doa & kamus tetap terbuka | Precache + runtime cache; jadwal dihitung di perangkat                                      |
| Notifikasi       | Hanya dikirim ke yang mengizinkan; bisa dimatikan per salat           | Web Push VAPID, preferensi tersimpan di `push_subscriptions`                                |
| Multibahasa      | JP, EN, ID; fallback ke EN bila terjemahan kosong                     | next-intl, kolom `jsonb` per bahasa                                                         |
| Tipografi Jepang | Kanji/kana rapi, tidak terpotong                                      | Noto Sans JP, `line-break: strict`, `word-break: keep-all`                                  |
| SEO              | Terindeks di Google Jepang & Indonesia                                | Metadata per bahasa, `hreflang`, sitemap, JSON-LD `Mosque` & `Event`                        |
| Aksesibilitas    | WCAG 2.1 AA                                                           | Kontras merah gelap di atas putih ≥ 4,5:1, fokus terlihat, alt text wajib                   |
| Keamanan         | Hanya admin terdaftar bisa menulis                                    | RLS di setiap tabel, middleware `/admin`, Turnstile + rate limit di form publik             |
| Privasi          | Data jamaah hanya untuk keperluan masjid                              | Kebijakan privasi sesuai APPI Jepang, persetujuan di setiap form                            |
| Zona waktu       | Semua jam dalam Asia/Tokyo                                            | Simpan `timestamptz` UTC, tampilkan JST                                                     |
| Ketersediaan     | Uptime ≥ 99,5%                                                        | Vercel + Supabase, backup database harian                                                   |
| Biaya            | Rp0 selama pengembangan; produksi disarankan sekitar US\$46/bulan     | Paket gratis saat membangun, lalu Vercel Pro + Supabase Pro saat launch (rincian di PRD-14) |

## 8. Desain UI

Bahasa desain diambil dari referensi UI yang dilampirkan (hero gelap berpola, judul besar dua warna, kartu membulat, tag pill kecil, daftar layanan bernomor) lalu dipindah ke palet merah gelap, hitam, dan putih; tanpa emoji, semua ikon dari Lucide. Token lengkap ada di PRD-01 · Design System & UI.

| Elemen        | Keputusan                                                                                        |
|---------------|--------------------------------------------------------------------------------------------------|
| Warna         | Merah gelap `#7F1D1D` sebagai aksen, hitam `#0A0A0A`, putih `#FFFFFF`, abu `#F5F5F5` untuk kartu |
| Tipografi     | Plus Jakarta Sans (Latin), Noto Sans JP (Jepang), Amiri (teks Arab)                              |
| Judul         | Besar dan rapat; kata kunci terakhir berwarna merah, mis. “di Matsudo, Chiba.”                   |
| Kartu         | Radius 20–24 px, latar abu sangat muda atau putih bergaris tipis, tanpa bayangan berat           |
| Tag section   | Pill kecil berbingkai di atas tiap judul section (Tentang kami, Layanan, Kontak)                 |
| Hero & footer | Hitam dengan pola geometris Islam berkontras sangat rendah                                       |
| Ikon          | Lucide, stroke 1,5 px, di dalam lingkaran atau kotak membulat                                    |
| Interaksi     | Hover naik 2 px, carousel bertombol bulat, angka statistik count-up                              |
| Pendekatan    | Mobile-first; App Jamaah memakai navigasi bawah                                                  |

![wireframe beranda web · gaya referensi UI, palet merah gelap](docs/prd/assets/00-master/wireframe-beranda.png)

wireframe beranda web · gaya referensi UI, palet merah gelap

Warna aksen di wireframe hanya penanda; di produk aksennya merah gelap. Semua angka dan teks adalah placeholder yang nanti diisi pengurus dari panel admin.

## 9. Roadmap, risiko & langkah pertama

Rilis penuh diperkirakan sekitar 10 minggu kerja, dengan soft launch web inti di minggu ke-5 agar jamaah sudah bisa memakai jadwal salat dan info infaq lebih awal; durasi ini estimasi.

![roadmap · 5 fase, 4 gerbang persetujuan, estimasi 10 minggu](docs/prd/assets/00-master/roadmap.png)

roadmap · 5 fase, 4 gerbang persetujuan, estimasi 10 minggu

Setiap fase menyebut PRD modul yang dikerjakan; fase berikutnya baru dimulai setelah gerbang persetujuan pengurus lulus.

### 9.1 Risiko & mitigasi

| Risiko                                                                       | Dampak                               | Mitigasi                                                                     |
|------------------------------------------------------------------------------|--------------------------------------|------------------------------------------------------------------------------|
| Fitur sangat banyak untuk satu developer                                     | Molor, kualitas turun                | Kerjakan per modul sesuai roadmap; soft launch web inti dulu                 |
| Notifikasi push di iPhone hanya aktif setelah App ditambahkan ke Home Screen | Sebagian jamaah tidak menerima adzan | Panduan install bergambar per OS; alternatif unduh pengingat kalender `.ics` |
| Konten & terjemahan Jepang terlambat                                         | Halaman JP kosong                    | Penerjemah relawan; fallback otomatis ke EN                                  |
| Data donatur & pendaftar bersifat pribadi                                    | Risiko kebocoran                     | RLS per peran, ekspor hanya super admin, log aktivitas                       |
| Jadwal salat berbeda dengan kebiasaan jamaah                                 | Kebingungan                          | Metode hitung disepakati di awal; koreksi menit per salat dari admin         |
| Pengurus jarang memperbarui konten                                           | App terasa mati                      | Jadwal & tanggal Hijriah otomatis; panel admin sederhana + pelatihan         |
| Spam di formulir publik                                                      | Beban moderasi                       | Turnstile + rate limit + daftar blokir                                       |

### 9.2 Yang bisa langsung dikerjakan minggu ini

- [ ] Kirim dokumen ini ke pengurus dan jadwalkan presentasi singkat

- [ ] Minta aset: logo, foto masjid, teks profil, alamat persis, kontak WhatsApp pengurus, rekening resmi (Jepang & Indonesia), akun YouTube & Instagram

- [ ] Konfirmasi metode hitung waktu salat, jam iqamah, dan jadwal Jumat

- [ ] Tentukan admin pertama dan bahasa yang mereka pakai

- [ ] Cek ketersediaan domain (menunggu persetujuan nama)

- [ ] Buat repo GitHub, proyek Supabase, dan proyek Vercel

- [ ] Jalankan prompt setup awal (PRD-11, tiket T-003), lalu prompt PRD-01 di Claude Code

## 10. Cara membangun dengan Claude

Bangun per modul mengikuti urutan prompt di PRD-15: satu prompt per sesi, dengan tab ini plus PRD modul terkait sebagai konteks. Jangan menempel semua PRD sekaligus agar Claude tetap fokus.

1.  Buat proyek: `npx create-next-app@latest masjid-almuttaqin --ts --tailwind --app --src-dir`, buat proyek Supabase, isi `.env.local`.

2.  Ekspor setiap tab ke Markdown dan simpan di repo dengan nama yang dipakai prompt (01-design-system, 02-database, 03-website-publik, 04-jadwal-salat, 05-donasi, 06-kegiatan-kajian, 07-app-jamaah-pwa, 08-panduan-layanan, 09-panel-admin, 10-bahasa-seo-deploy, 11-backlog, 12-kontrak-action-api, 13-konten-keputusan, 14-uat-serah-terima, 15-prompt-pack), mulai dari `docs/prd/00-master.md` sampai `docs/prd/15-prompt-pack.md`.

3.  Buat file `CLAUDE.md` di root proyek dengan isi template di bawah.

4.  Jalankan prompt di akhir setiap PRD modul dengan urutan: 01 → 02 → 12 → 10 (bagian i18n) → 03 → 04 → 05 → 09 → 06 → 07 → 08 → 10 (SEO, keamanan, deploy).

5.  Setelah setiap prompt: jalankan `npm run build`, cek di browser dan HP, commit, baru lanjut ke prompt berikutnya.

6.  Jika ada error, tempel pesan error lengkap dan minta perbaikan tanpa mengubah fitur lain.

```markdown
# CLAUDE.md — Web Publik Al Muttaqin Cultural Center

## Konteks
Web publik almuttaqinculturalcenter.org: situs tiga bahasa (ja, en, id), App Jamaah (PWA), dan
admin konten untuk Al Muttaqin Cultural Center (masjid & pusat budaya Islam) di Matsudo, Chiba, Jepang.
Web internal pengurus (pengurus-acc.online) adalah aplikasi TERPISAH dan bukan bagian repo ini.
Sebelum mengerjakan apa pun, baca docs/prd/00-master.md dan PRD modul yang disebut di prompt.

## Stack
Next.js App Router + TypeScript strict, Tailwind CSS v4, shadcn/ui, lucide-react, Motion,
Supabase (Postgres, Auth, Storage, Edge Functions), next-intl (ja, en, id), Serwist, adhan.

## Aturan desain
- Gaya mengikuti referensi UI: modern, minimalis, hero hitam berpola, judul dua warna, kartu membulat.
- Warna hanya dari token PRD-01 (merah gelap, hitam, putih); tidak ada hex di komponen.
- Tanpa emoji di UI, kode, notifikasi, maupun seed data. Ikon hanya lucide-react.
- Mobile-first dan responsif penuh (uji 360, 768, 1280, 1536 px); mode terang & gelap.

## Aturan kode
- Semua teks UI lewat messages/{ja,en,id}.json; konten database berbentuk { ja, en, id }.
- Server Components default; "use client" hanya untuk bagian interaktif.
- Mutasi lewat createAction (PRD-12): Zod + cek peran + rate limit + revalidateTag.
- Setiap tabel baru wajib migration + RLS. Zona waktu tampilan Asia/Tokyo.
- Donasi: Rupiah via QRIS, Yen via Japan Post Bank; gateway (Midtrans/Stripe) hanya aktif lewat
  feature flag PAYMENT_GATEWAY_ENABLED.

## Selesai berarti
lint, typecheck, test, dan build lulus; laporkan file yang dibuat/diubah dan cara mengujinya.
```

## Sumber

- [Dompet Dhuafa — Masjid Al-Muttaqin sebagai Islamic Center di Matsudo, Chiba](https://www.dompetdhuafa.org/en/to-strengthen-the-spread-of-islam-dompet-dhuafa-supports-the-construction-of-the-al-muttaqin-mosque-as-an-islamic-cultural-centre-in-chiba-japan/)

- [Masjid As-Sunnah Hekinan — website](https://assunnahhekinan.org/)

- [Masjid As-Sunnah Hekinan — App Jamaah](https://assunnahhekinan.org/app.html)

- [Masjid As-Sholihin Yokohama](https://masjidassholihinyokohama.org/)

---

# PRD-01 · Design System & UI

UI Al-Muttaqin modern, tenang, dan tegas: hitam-putih sebagai dasar, merah gelap hanya untuk aksen dan aksi utama, ikon garis Lucide, tanpa emoji. Bahasa visualnya diadaptasi dari referensi UI yang dilampirkan (hero hitam berpola, judul dua warna, kartu membulat, tag pill).

## 1. Token warna

Semua warna didefinisikan sebagai CSS variable di `globals.css` dan dipetakan ke tema Tailwind; komponen tidak boleh memakai hex langsung.

| Token                                  | Light                             | Dark                              | Dipakai untuk                       |
|----------------------------------------|-----------------------------------|-----------------------------------|-------------------------------------|
| `--background`                         | `#FFFFFF`                         | `#0A0A0A`                         | Latar halaman                       |
| `--foreground`                         | `#0A0A0A`                         | `#FAFAFA`                         | Teks utama                          |
| `--surface`                            | `#F5F5F5`                         | `#141414`                         | Kartu, panel form                   |
| `--surface-2`                          | `#EDEDED`                         | `#1C1C1C`                         | Kartu bertingkat, input             |
| `--border`                             | `#E5E5E5`                         | `#262626`                         | Garis & bingkai                     |
| `--muted-foreground`                   | `#6B6B6B`                         | `#A3A3A3`                         | Teks sekunder                       |
| `--primary`                            | `#7F1D1D`                         | `#991B1B`                         | Tombol utama, kartu statistik aktif |
| `--primary-hover`                      | `#651717`                         | `#7F1D1D`                         | Hover/pressed tombol utama          |
| `--primary-foreground`                 | `#FFFFFF`                         | `#FFFFFF`                         | Teks di atas merah                  |
| `--primary-soft`                       | `#FBEDED`                         | `#2A1212`                         | Latar chip, badge, baris aktif      |
| `--accent-text`                        | `#7F1D1D`                         | `#F28B8B`                         | Kata kunci merah di judul, link     |
| `--hero`                               | `#0A0A0A`                         | `#0A0A0A`                         | Hero & footer (selalu hitam)        |
| `--success` / `--warning` / `--danger` | `#15803D` / `#B45309` / `#B91C1C` | `#4ADE80` / `#FBBF24` / `#F87171` | Status; selalu disertai ikon        |

Kontras `#7F1D1D` di atas putih sekitar 10:1 dan `#F28B8B` di atas `#0A0A0A` sekitar 8:1, sehingga lulus WCAG AA untuk teks normal.

## 2. Tipografi

| Peran           | Font                                  | Ukuran desktop / mobile      | Catatan                         |
|-----------------|---------------------------------------|------------------------------|---------------------------------|
| Display (hero)  | Plus Jakarta Sans 700                 | 56 / 36 px, tracking -0,03em | Maks. 2 baris                   |
| H1 – H3         | Plus Jakarta Sans 600                 | 40 / 32 / 24 px              | Kata kunci terakhir boleh merah |
| Body            | Plus Jakarta Sans 400                 | 16 px, line-height 1,6       | Paragraf maks. 70 karakter      |
| Kecil & caption | Plus Jakarta Sans 500                 | 14 / 12 px                   | Label, meta, tag                |
| Jepang          | Noto Sans JP 400/500/700              | Ikut skala di atas           | Dimuat hanya di `/ja`           |
| Arab            | Amiri 400/700                         | 20–28 px, line-height 2      | Ayat, doa, dzikir               |
| Angka jam       | Plus Jakarta Sans 600, `tabular-nums` | 28–48 px                     | Jadwal & hitung mundur          |

## 3. Bentuk, ruang & pola

- Radius: `sm` 10 px, `md` 14 px, `lg` 20 px, `xl` 28 px, `pill` 9999 px. Kartu memakai `lg`, panel besar `xl`.

- Spasi dasar 4 px; padding section 96 px (desktop) / 64 px (mobile); lebar konten maks. 1200 px.

- Bayangan hanya dua: `0 1px 2px rgb(0 0 0 / .04)` untuk kartu dan `0 12px 32px rgb(0 0 0 / .08)` untuk elemen melayang.

- Pola geometris Islam (bintang 8 sudut) sebagai SVG berulang, opasitas 4–6 %, hanya di hero, footer, dan kartu gelap.

## 4. Ikon

Semua ikon dari `lucide-react` dengan `strokeWidth={1.5}`, ukuran 20 px (16 px di teks kecil). Ikon fitur ditempatkan dalam `IconBadge`: lingkaran 40 px berlatar `--surface` atau `--primary-soft`. Logo brand (Instagram, YouTube, WhatsApp, LINE) memakai paket `simple-icons`, bukan Lucide.

| Fitur                        | Ikon Lucide                              |
|------------------------------|------------------------------------------|
| Jadwal salat / hitung mundur | `Clock`, `Timer`                         |
| Jumat                        | `Landmark`                               |
| Arah kiblat                  | `Compass`                                |
| Kajian & video               | `BookOpen`, `CirclePlay`, `Radio` (live) |
| Agenda & pendaftaran         | `CalendarDays`, `ClipboardList`          |
| Infaq, zakat                 | `HandCoins`, `Calculator`                |
| Muallaf & komunitas          | `HeartHandshake`, `Users`                |
| Halal & kamus                | `UtensilsCrossed`, `Languages`           |
| Lokasi, kontak               | `MapPin`, `Mail`, `Phone`                |
| Notifikasi, install, salin   | `Bell`, `Download`, `Copy`               |
| Bahasa, tema                 | `Globe`, `Sun`, `Moon`                   |

## 5. Komponen dari referensi UI

| Komponen                                       | Pola di referensi                        | Penerapan di Al-Muttaqin                                           |
|------------------------------------------------|------------------------------------------|--------------------------------------------------------------------|
| `SectionTag`                                   | Pill kecil “About Us”                    | Label tiap section dengan titik merah 6 px                         |
| `Heading`                                      | Judul besar dua warna                    | Prop `accent` mewarnai kata kunci                                  |
| `Navbar`                                       | Bar navigasi membulat di atas hero gelap | Sticky, blur latar, berubah terang saat di-scroll                  |
| `HeroDark`                                     | Hero hitam + objek 3D di tengah          | Foto masjid/render, chip “Salat berikutnya”, 4 chip fitur melayang |
| `FeatureChip`                                  | “Easy to Book” dengan ikon bulat         | Jadwal otomatis, Kajian rutin, Ramah muallaf, Infaq transparan     |
| `LogoStrip`                                    | Baris logo sertifikasi                   | Mitra & legalitas masjid                                           |
| `StatCard`                                     | Kartu “10+ years” berwarna               | Kartu pertama merah, sisanya abu; angka count-up                   |
| `NumberedServiceRow`                           | “01 Umrah Offer →”                       | Daftar layanan masjid, membuka detail (accordion)                  |
| `ProgramCard` + `QuotaBar`                     | Kartu paket + “seats remaining”          | Kajian/kelas/TPA dengan sisa kuota                                 |
| `CarouselNav`                                  | Tombol bulat kiri-kanan                  | Embla Carousel untuk program, kisah, galeri                        |
| `StoryCard`                                    | Testimoni gelap + ilustrasi 3D           | Kisah jamaah & muallaf                                             |
| `ContactPanel`                                 | Form abu membulat                        | Form kontak & kotak saran                                          |
| `SocialCard`                                   | Kartu Instagram berwarna                 | Kartu Instagram (merah), YouTube, WhatsApp                         |
| `InstallCard`                                  | Kartu newsletter hitam                   | Ajakan memasang App Jamaah                                         |
| `PostCarousel`                                 | Kartu bergaya post Instagram             | Galeri dokumentasi kegiatan                                        |
| `PrayerTimeCard`, `CountdownRing`, `BottomNav` | —                                        | Khusus masjid & App Jamaah                                         |

## 6. Gerak & interaksi

- Durasi 150–300 ms, easing `cubic-bezier(0.22, 1, 0.36, 1)`.

- Section muncul fade-up sekali saat masuk layar; kartu naik 2 px saat hover; angka statistik count-up.

- `prefers-reduced-motion: reduce` mematikan semua animasi non-esensial.

- Mode gelap mengikuti perangkat, bisa diganti manual dan disimpan.

## 7. Aset sementara

- Foto: foto masjid & kegiatan berlisensi bebas sebagai placeholder sampai foto asli dari pengurus tersedia; semua lewat `next/image`.

- Logo: wordmark “Al-Muttaqin” + ikon kubah SVG sederhana sampai logo resmi tersedia.

- Ilustrasi 3D bersifat opsional; tanpa ilustrasi pun layout harus tetap utuh.

## 7A. Elemen pembeda (v2)

Agar terasa berbeda dari web masjid lain tanpa meninggalkan gaya minimalis referensi, sembilan elemen khas di bawah menjadi identitas visual Al Muttaqin Cultural Center. Batasi maksimal dua elemen pembeda per layar supaya tetap tenang.

| Elemen                        | Deskripsi                                                                                                                               | Dipakai di                                 |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| Busur hari salat              | Busur tipis dari Subuh ke Isya dengan titik tiap waktu salat; titik “sekarang” bergerak, salat berikutnya berwarna merah                | Hero beranda, beranda App, `/prayer-times` |
| Pola Islam × Jepang           | Motif SVG khusus yang memadukan bintang 8 sudut dan asanoha (motif daun rami Jepang), kontras sangat rendah                             | Hero, footer, kartu gelap, gambar bagikan  |
| Label tiga aksara             | Tag section memuat label kecil Arab · Jepang · bahasa aktif, mis. “الأخبار · ニュース · Berita”; di HP sempit cukup Arab + bahasa aktif | Semua `SectionTag`                         |
| Bento grid                    | Desktop memakai kartu beragam ukuran (jadwal besar, Jumat, donasi, kajian live); HP berubah menjadi tumpukan kartu sesuai prioritas     | Beranda                                    |
| Kartu “Masjid hari ini”       | Status buka/tutup, salat berikutnya, kegiatan yang sedang berlangsung, dan pengumuman penting, diperbarui otomatis                      | Beranda, beranda App                       |
| Tema malam otomatis           | Mode gelap aktif sendiri dari Magrib sampai Subuh mengikuti jadwal salat; bisa dimatikan atau diganti “ikuti perangkat”                 | Seluruh situs & App                        |
| Navigasi pill mengambang      | Desktop: navbar pill di atas; HP: navigasi bawah mengambang dengan indikator aktif merah                                                | Global                                     |
| Transisi halus                | View Transitions API antarhalaman, kartu naik 2 px saat hover, angka count-up; dimatikan bila pengguna memilih kurangi gerak            | Global                                     |
| Gambar bagikan bergaya poster | Gambar OG otomatis: latar hitam berpola, judul dua warna, tanggal & lokasi                                                              | Agenda, kajian, berita                     |

Jam salat selalu memakai angka besar dengan `tabular-nums` agar mudah dibaca sekilas, termasuk oleh jamaah lanjut usia.

## 8. Larangan

- Tidak ada emoji di mana pun, termasuk notifikasi dan pesan sistem.

- Hanya satu warna aksen (merah gelap); tidak ada gradien warna-warni.

- Merah tidak dipakai untuk paragraf panjang, hanya kata kunci, tombol, dan status.

## 9. Acceptance criteria

- [ ] Semua token di bagian 1 tersedia sebagai CSS variable light & dark dan sebagai kelas Tailwind

- [ ] Halaman `/dev/ui` menampilkan semua komponen bagian 5 dalam mode terang dan gelap

- [ ] Tidak ada nilai hex di dalam file komponen (dicek dengan grep)

- [ ] Semua tombol ikon punya `aria-label`; fokus keyboard terlihat jelas

- [ ] Lighthouse aksesibilitas halaman `/dev/ui` ≥ 95

## 10. Prompt untuk Claude

```text
Kamu adalah senior frontend engineer. Baca docs/prd/00-master.md dan docs/prd/01-design-system.md.

Tugas: bangun fondasi design system proyek Next.js ini.
1. Konfigurasi Tailwind CSS v4 + shadcn/ui. Definisikan semua token warna, radius, bayangan,
   dan font di src/app/globals.css sebagai CSS variables (light & dark) persis seperti tabel PRD-01.
2. Muat Plus Jakarta Sans, Noto Sans JP, dan Amiri lewat next/font (Noto Sans JP hanya untuk locale ja).
3. Buat komponen: SectionTag, Heading (prop accent), Button (primary, outline, ghost, pill, icon),
   IconBadge, FeatureChip, StatCard (count-up), NumberedServiceRow, ProgramCard + QuotaBar,
   CarouselNav (Embla), StoryCard, ContactPanel, SocialCard, InstallCard, PatternBackground (SVG),
   Navbar (pill, sticky, blur), Footer, ThemeToggle.
4. Buat halaman /dev/ui yang memamerkan semua komponen di mode terang dan gelap.

Aturan: tanpa emoji; ikon hanya lucide-react (logo brand pakai simple-icons); tidak ada hex di
komponen; aksesibel; mobile-first; animasi pakai Motion dan hormati prefers-reduced-motion.
Selesai: lint, typecheck, build lulus; tampilkan daftar file yang dibuat.
```

---

# PRD-02 · Database & Supabase

Semua data produk tinggal di satu proyek Supabase: 30 tabel dalam 8 kelompok, setiap tabel dilindungi Row Level Security, dan konten tampilan disimpan dalam tiga bahasa di kolom `jsonb`.

## 1. Prinsip skema

- Primary key `uuid default gen_random_uuid()`, kecuali tabel konfigurasi tunggal.

- Semua waktu `timestamptz` (UTC); tampilan dikonversi ke Asia/Tokyo.

- Kolom teks yang tampil ke publik bertipe `jsonb` berbentuk `{"ja": "", "en": "", "id": ""}` (disebut **i18n** di bawah).

- Setiap tabel punya `created_at` dan `updated_at` (trigger otomatis); konten memakai kolom `status` daripada hapus permanen.

- RLS aktif di semua tabel tanpa kecuali; tipe TypeScript di-generate dengan `supabase gen types`.

## 2. Peran admin

| Peran         | Bisa mengelola                                                              | Tidak bisa                                 |
|---------------|-----------------------------------------------------------------------------|--------------------------------------------|
| `super_admin` | Semua, termasuk pengguna, peran, pengaturan, ekspor data pribadi            | —                                          |
| `editor`      | Konten, jadwal, Jumat, kajian, agenda, pendaftar, panduan, pesan            | Keuangan, rekening, data donatur, pengguna |
| `finance`     | Program donasi, rekening, konfirmasi infaq, donatur tetap, laporan keuangan | Pengguna & pengaturan situs                |

## 3. Daftar tabel

| Kelompok        | Tabel                    | Kolom utama                                                                                                                    | Akses publik (anon)     |
|-----------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------|-------------------------|
| Inti            | `profiles`               | id → auth.users, full_name, role, locale                                                                                       | —                       |
| Inti            | `site_settings`          | key, value jsonb (nama, alamat, koordinat, kontak, sosmed, banner)                                                             | Baca                    |
| Inti            | `team_members`           | name, role i18n, photo_path, whatsapp, is_public, sort                                                                         | Baca yang publik        |
| Inti            | `partners`               | name, logo_path, url, sort                                                                                                     | Baca                    |
| Ibadah          | `prayer_settings`        | method, madhab, high_lat_rule, adjustments jsonb, iqamah jsonb, hijri_offset                                                   | Baca                    |
| Ibadah          | `prayer_overrides`       | date, times jsonb, note i18n                                                                                                   | Baca                    |
| Ibadah          | `jumuah_schedules`       | date, khutbah_time, khatib, imam, language, topic i18n                                                                         | Baca                    |
| Konten          | `posts`                  | slug, type (news/announcement/article), title, excerpt, body (i18n), cover_path, is_pinned, status, published_at, author_id    | Baca yang terbit        |
| Konten          | `gallery_items`          | album, image_path, caption i18n, taken_at                                                                                      | Baca                    |
| Konten          | `testimonials`           | name, role i18n, quote i18n, photo_path, published                                                                             | Baca yang terbit        |
| Kajian & agenda | `lectures`               | title i18n, ustadz, category, youtube_id, is_live, scheduled_at, materials_url                                                 | Baca                    |
| Kajian & agenda | `events`                 | slug, title, description (i18n), starts_at, ends_at, location, recurrence_rule, capacity, registration_open, deadline, form_id | Baca                    |
| Kajian & agenda | `forms`                  | name, schema jsonb (daftar field dinamis), is_active                                                                           | Baca yang aktif         |
| Kajian & agenda | `registrations`          | event_id, data jsonb, name, contact, status (pending/confirmed/waitlist/cancelled)                                             | Insert saja             |
| Infaq           | `donation_programs`      | slug, type (infaq/zakat/wakaf/program), title i18n, target_amount, currency, is_active                                         | Baca                    |
| Infaq           | `bank_accounts`          | country (JP/ID), bank_name, branch, account_number, holder, qr_path, is_active                                                 | Baca yang aktif         |
| Infaq           | `donation_confirmations` | program_id, donor_name, is_anonymous, contact, amount, currency, transfer_date, account_id, proof_path, intention_for, status  | Insert saja             |
| Infaq           | `recurring_donors`       | full_name, contact, email, city, amount, currency, method, pay_day_range, show_name, consent                                   | Insert saja             |
| Infaq           | `finance_entries`        | entry_date, type (income/expense), category, amount, currency, description i18n, attachment_path                               | —                       |
| Infaq           | `finance_reports`        | period, summary jsonb, pdf_path, published                                                                                     | Baca yang terbit        |
| Panduan         | `guides`                 | slug, section (newcomer/halal/daily/muallaf), title, body (i18n), icon, external_url, sort                                     | Baca                    |
| Panduan         | `dictionary_entries`     | category, term_id, term_en, term_ja, kana, romaji, note i18n                                                                   | Baca                    |
| Panduan         | `haram_ingredients`      | kanji, kana, romaji, meaning i18n, level (haram/syubhat)                                                                       | Baca                    |
| Panduan         | `places`                 | name, type (mosque/halal_shop/restaurant/prayer_room), address, lat, lng, url, verified                                        | Baca yang terverifikasi |
| Panduan         | `faqs`                   | question, answer (i18n), category, sort                                                                                        | Baca                    |
| Panduan         | `daily_contents`         | type (hadith/dua/dhikr/reminder), arabic, translation i18n, source, time_of_day, weekday                                       | Baca                    |
| Layanan         | `messages`               | category (question/suggestion/facility/ask_ustadz/other), name?, contact?, body, status, assigned_to                           | Insert saja             |
| Notifikasi      | `push_subscriptions`     | endpoint (unique), p256dh, auth, locale, prefs jsonb                                                                           | Lewat RPC saja          |
| Notifikasi      | `push_campaigns`         | title, body (i18n), url, scheduled_at, sent_at                                                                                 | —                       |
| Audit           | `activity_logs`          | actor_id, action, entity, entity_id, diff jsonb                                                                                | —                       |

Relasi utama: `events` → `forms`; `registrations` → `events`; `donation_confirmations` → `donation_programs` dan `bank_accounts`; `posts.author_id` dan `activity_logs.actor_id` → `profiles`.

![ERD · 9 tabel berelasi dalam 3 gugus, 21 tabel mandiri](docs/prd/assets/02-database/erd.png)

ERD · 9 tabel berelasi dalam 3 gugus, 21 tabel mandiri

Semua relasi bersifat banyak-ke-satu; `profiles` dan `donation_confirmations` disorot karena paling sering dirujuk oleh kebijakan RLS dan alur verifikasi.

### 3.1 Perubahan v2

Karena web internal pengurus kini aplikasi terpisah, database web publik hanya menyimpan konten, formulir dari pengunjung, dan data donasi sementara; buku kas pindah ke web internal.

- Peran `finance` berganti nama menjadi `donasi`: admin donasi sementara sampai web internal siap.

- `finance_entries` dan `v_finance_monthly` dihapus dari skema ini (pindah ke web internal); `finance_reports` tetap untuk mengunggah PDF laporan yang sudah diterbitkan pengurus.

- `donation_confirmations` ditambah kolom: `channel` (`qris_static`, `qris_dynamic`, `yucho_transfer`, `stripe`), `unique_amount`, `reference_code`, `status` (`pending`, `paid`, `matched`, `expired`, `rejected`), `gateway_txn_id`, `matched_line_id`, `matched_at`; bukti transfer menjadi opsional.

| Tabel baru          | Kolom utama                                                                                                                          | Akses publik (anon)                                                              |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| `rooms`             | name i18n, capacity, facilities i18n, photo_path, is_bookable                                                                        | Baca                                                                             |
| `room_bookings`     | room_id, purpose, organizer_name, contact, attendees, starts_at, ends_at, status (requested/approved/declined/cancelled), admin_note | Insert saja; jadwal terpakai lewat view `v_room_availability` tanpa data pribadi |
| `programs`          | slug, type (kelas bahasa, open mosque, pameran budaya, kunjungan sekolah), title & description i18n, schedule, form_id               | Baca                                                                             |
| `statement_imports` | source (`qris_report`, `yucho_csv`), file_path, period, row_count, imported_by                                                       | —                                                                                |
| `statement_lines`   | import_id, occurred_at, amount, currency, description, sender_name, matched_confirmation_id, status                                  | —                                                                                |
| `payment_events`    | provider, event_id (unik), payload jsonb, received_at, processed                                                                     | — (log webhook Midtrans/Stripe, mencegah pencatatan ganda)                       |
| `sync_outbox`       | entity, entity_id, payload jsonb, sent_at                                                                                            | — (antrean data yang nanti dikirim ke web internal)                              |

Relasi tambahan: `room_bookings` → `rooms`; `programs` → `forms`; `statement_lines` → `statement_imports` dan `donation_confirmations`.

## 4. View & fungsi

| Nama                            | Isi                                                                        |
|---------------------------------|----------------------------------------------------------------------------|
| `has_role(roles app_role[])`    | Fungsi `security definer` untuk semua kebijakan RLS admin                  |
| `v_program_totals`              | Total infaq terverifikasi per program dan mata uang (dipakai progress bar) |
| `v_event_capacity`              | Kuota, jumlah terdaftar, sisa kuota per agenda                             |
| `v_finance_monthly`             | Ringkasan pemasukan & pengeluaran per bulan                                |
| `upsert_push_subscription(...)` | RPC agar pengunjung bisa mendaftar notifikasi tanpa akses baca tabel       |
| Trigger `log_activity()`        | Mencatat insert/update/delete tabel konten ke `activity_logs`              |

## 5. Storage buckets

| Bucket            | Akses                                                      | Isi                                           |
|-------------------|------------------------------------------------------------|-----------------------------------------------|
| `public-media`    | Baca publik, tulis admin                                   | Foto berita, galeri, cover agenda, logo mitra |
| `donation-proofs` | Upload anon (maks. 5 MB, gambar/PDF), baca hanya `finance` | Bukti transfer                                |
| `finance-docs`    | Baca publik untuk laporan terbit, tulis `finance`          | PDF laporan keuangan                          |
| `materials`       | Baca publik, tulis admin                                   | Materi kajian PDF                             |

## 6. Contoh SQL (pola yang diikuti semua tabel)

```sql
create type app_role as enum ('super_admin', 'editor', 'finance');
create type content_status as enum ('draft', 'published', 'archived');

create or replace function public.has_role(roles app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = any(roles));
$$;

create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null check (type in ('news', 'announcement', 'article')),
  title jsonb not null default '{}',
  excerpt jsonb not null default '{}',
  body jsonb not null default '{}',
  cover_path text,
  is_pinned boolean not null default false,
  status content_status not null default 'draft',
  published_at timestamptz,
  author_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table posts enable row level security;
create policy "public read published" on posts for select
  using (status = 'published' and published_at <= now());
create policy "editors manage" on posts for all
  using (has_role(array['super_admin', 'editor']::app_role[]))
  with check (has_role(array['super_admin', 'editor']::app_role[]));

-- tabel sensitif: publik hanya boleh insert
alter table donation_confirmations enable row level security;
create policy "anon can submit" on donation_confirmations for insert
  with check (status = 'pending');
create policy "finance reads" on donation_confirmations for select
  using (has_role(array['super_admin', 'finance']::app_role[]));
```

## 7. Seed data

`supabase/seed.sql` mengisi: pengaturan masjid (nama, alamat placeholder, koordinat Matsudo), metode salat default, 2 rekening contoh bertanda placeholder, 3 berita, 1 agenda dengan formulir, 10 FAQ, 30 istilah kamus dakwah, 15 bahan haram dalam kanji, 20 konten doa & dzikir harian, dan 1 akun `super_admin` dari variabel lingkungan.

## 8. Acceptance criteria

- [ ] `supabase db reset` membuat semua tabel, view, fungsi, bucket, dan seed tanpa error

- [ ] Pengunjung anonim tidak bisa membaca `donation_confirmations`, `recurring_donors`, `registrations`, `messages`, `push_subscriptions` (dibuktikan dengan test)

- [ ] `editor` tidak bisa membaca data keuangan; `finance` tidak bisa mengubah konten

- [ ] Setiap perubahan konten tercatat di `activity_logs`

- [ ] File `src/lib/supabase/database.types.ts` ter-generate dan dipakai di seluruh kode

## 9. Prompt untuk Claude

```text
Kamu adalah senior backend engineer Supabase. Baca docs/prd/00-master.md dan docs/prd/02-database.md.

Tugas: buat seluruh lapisan data.
1. Buat migration SQL di supabase/migrations untuk semua enum, 30 tabel, relasi, index
   (slug, status, published_at, starts_at, date), trigger updated_at, dan trigger log_activity.
2. Aktifkan RLS di setiap tabel dengan kebijakan persis sesuai kolom "Akses publik" dan tabel peran.
3. Buat fungsi has_role, RPC upsert_push_subscription, serta view v_program_totals,
   v_event_capacity, v_finance_monthly.
4. Buat storage buckets dan kebijakannya sesuai bagian 5.
5. Tulis supabase/seed.sql sesuai bagian 7 (teks contoh dalam ja, en, id).
6. Buat helper Supabase untuk Next.js: server client, browser client, middleware session,
   dan generate database.types.ts.
7. Tulis test RLS (SQL atau Vitest) yang membuktikan data sensitif tidak bisa dibaca anon.

Selesai: supabase db reset lulus, test RLS lulus, build lulus; ringkas kebijakan RLS per tabel.
```

---

# PRD-03 · Website Publik

Website publik terdiri dari 14 halaman utama di bawah `/[locale]` (`ja`, `en`, `id`); beranda adalah halaman terpenting dan harus menjawab kapan salat, apa yang terjadi pekan ini, dan bagaimana berinfaq tanpa perlu klik.

## 1. Peta rute

| Rute                          | Halaman              | Isi utama                                                       | Sumber data                                 |
|-------------------------------|----------------------|-----------------------------------------------------------------|---------------------------------------------|
| `/`                           | Beranda              | 18 section (bagian 2)                                           | Hampir semua tabel                          |
| `/about`                      | Tentang & Pengurus   | Sejarah, visi-misi, kemitraan, struktur pengurus, legalitas     | `site_settings`, `team_members`, `partners` |
| `/prayer-times`               | Jadwal Salat         | Hari ini, bulanan, imsakiyah (saat Ramadan), unduh PDF & `.ics` | `prayer_settings`, `prayer_overrides`       |
| `/jumuah`                     | Info Jumat           | Pekan ini + 4 pekan ke depan, arsip tema khutbah                | `jumuah_schedules`                          |
| `/lectures`, `/lectures/[id]` | Kajian & Video       | Banner live, daftar video per kategori/ustadz, materi PDF       | `lectures`                                  |
| `/events`, `/events/[slug]`   | Agenda & Pendaftaran | Kalender & daftar, detail, formulir dinamis, sisa kuota         | `events`, `forms`, `v_event_capacity`       |
| `/news`, `/news/[slug]`       | Berita & Pengumuman  | Filter tipe, artikel terkait, tombol bagikan                    | `posts`                                     |
| `/donate`                     | Infaq & Donasi       | Program, rekening + salin, konfirmasi, donatur tetap, zakat     | Lihat PRD-05                                |
| `/transparency`               | Laporan Keuangan     | Ringkasan bulanan, grafik, unduh PDF                            | `finance_reports`, `v_finance_monthly`      |
| `/newcomers`                  | Muslim Baru di Chiba | Langkah pertama, halal, transportasi, sampah, kontak            | `guides` (section newcomer)                 |
| `/halal`                      | Halal & Kamus Dakwah | Kanji haram, kamus Jepang-Islam, radar halal                    | Lihat PRD-08                                |
| `/gallery`                    | Galeri               | Album & lightbox                                                | `gallery_items`                             |
| `/faq`                        | FAQ                  | Accordion berkategori + pencarian                               | `faqs`                                      |
| `/contact`                    | Kontak & Lokasi      | Form, peta, akses kereta, adab berkunjung, sosial               | `site_settings`, `messages`                 |
| `/privacy`, `/terms`          | Legal                | Kebijakan privasi (APPI) & ketentuan                            | Statis per bahasa                           |

Halaman `not-found` dan `offline` memakai ilustrasi ikon + teks singkat, tanpa emoji.

### 1.1 Rute tambahan v2

| Rute                            | Halaman            | Isi utama                                                                                                                               | Sumber data                                                                   |
|---------------------------------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| `/programs`, `/programs/[slug]` | Program Budaya     | Kelas bahasa (Jepang, Indonesia, Arab), open mosque & tur masjid, pameran budaya, kunjungan sekolah; pendaftaran lewat formulir dinamis | `programs`, `forms`                                                           |
| `/rooms`                        | Peminjaman Ruangan | Info & foto ruangan, kalender ketersediaan tanpa data pribadi, formulir pengajuan                                                       | `rooms`, `v_room_availability`, `room_bookings`                               |
| `/about-islam`                  | Mengenal Islam     | Pengantar Islam (utama bahasa Jepang), adab berkunjung, materi unduhan                                                                  | `guides`                                                                      |
| `/quran`, `/quran/[surah]`      | Baca Al-Qur’an     | Daftar surah, teks Arab dan terjemahan sesuai bahasa, penanda terakhir dibaca di perangkat                                              | API publik Al-Qur’an (mis. Quran.com) dengan atribusi; cek lisensi terjemahan |
| `/calendar`                     | Kalender Hijriah   | Kalender bulanan Masehi–Hijriah, hari penting Islam, agenda masjid                                                                      | `events`, modul Hijriah                                                       |
| `/search`                       | Pencarian          | Cari berita, kajian, agenda, FAQ, panduan, dan kamus sekaligus; juga lewat pintasan Ctrl/Cmd + K                                        | Full-text search Postgres                                                     |

Elemen global tambahan v2: kartu “Masjid hari ini”, busur hari salat, tema malam otomatis, pencarian global, serta pengaturan aksesibilitas (ukuran teks dan kontras tinggi) yang tersimpan di perangkat.

## 2. Beranda, urutan section

1.  **Bar pengumuman** yang bisa ditutup (dari `site_settings.banner`); otomatis menampilkan pengingat Jumat pada hari Jumat dan hitung mundur saat Ramadan.

2.  **Navbar** pill: logo, menu, pemilih bahasa, tema, tombol “Infaq” merah.

3.  **Hero gelap**: judul dua warna, chip “Salat berikutnya” + hitung mundur, tombol “Buka App Jamaah” dan “Jadwal lengkap”, 4 chip fitur melayang, foto masjid.

4.  **Strip jadwal salat**: Subuh–Isya + Jumat, salat berikutnya disorot, tanggal Masehi & Hijriah.

5.  **Info Jumat pekan ini** (khatib, imam, waktu, bahasa) berdampingan dengan **mutiara hadits / doa harian** yang berganti.

6.  **Strip logo** mitra & legalitas.

7.  **Tentang** singkat + 4 kartu statistik (angka diisi admin).

8.  **Layanan bernomor** 01–06 yang membuka detail; isi dari admin, contoh awal: Salat & Jumat, Kajian & TPA, Pembinaan muallaf, Infaq & zakat, Panduan muslim baru, Kunjungan & dialog.

9.  **“Website ini untuk siapa?”**: 3 kartu portal (Jamaah, Muslim baru di Chiba, Donatur) seperti di Hekinan.

10. **Program & kegiatan**: carousel kartu dengan sisa kuota dan tombol daftar.

11. **Kajian**: banner merah “Sedang live” bila ada, lalu 3 video terbaru.

12. **Infaq**: program aktif + progres, tab rekening Jepang/Indonesia dengan tombol salin, tombol konfirmasi dan daftar donatur tetap.

13. **Berita & pengumuman**: pinned + 3 terbaru.

14. **Kisah jamaah & muallaf**: carousel kartu gelap.

15. **Galeri**: carousel bergaya post.

16. **FAQ** 5 teratas + tautan ke `/faq`.

17. **Kontak**: panel form, peta, kartu sosial.

18. **Footer** hitam: kartu install App, tautan, alamat, hak cipta.

## 3. Elemen global

| Elemen                            | Perilaku                                                                       |
|-----------------------------------|--------------------------------------------------------------------------------|
| Tombol mengambang “Tanya / Saran” | Membuka sheet form kategori (PRD-08), muncul setelah scroll 30 %               |
| Pemilih bahasa                    | Mengganti locale tanpa kehilangan halaman yang sedang dibuka                   |
| Tombol bagikan                    | Web Share API di berita, agenda, kajian; fallback salin tautan                 |
| Banner install                    | Muncul di kunjungan ke-2 di HP bila App belum di-install (PRD-07)              |
| Loading & kosong                  | Skeleton sesuai bentuk kartu; state kosong dengan ikon Lucide + kalimat ajakan |
| Breadcrumb                        | Di semua halaman selain beranda, plus JSON-LD `BreadcrumbList`                 |

## 4. Render & cache

- Semua halaman publik adalah Server Components dengan ISR dan cache tag per tabel (`posts`, `events`, `prayer`, dst.).

- Setiap simpan di panel admin memanggil `revalidateTag` sehingga perubahan tampil dalam hitungan detik.

- Bagian yang bergantung waktu (hitung mundur, salat berikutnya) dihitung di klien dari data jadwal yang sudah di-render.

## 5. Acceptance criteria

- [ ] 14 rute tersedia di 3 bahasa dengan metadata dan `hreflang` masing-masing

- [ ] Beranda menampilkan 18 section sesuai urutan dan bisa dikonfigurasi tampil/sembunyi dari admin

- [ ] Salat berikutnya dan hitung mundur benar menurut waktu Asia/Tokyo, termasuk setelah Isya (beralih ke Subuh besok)

- [ ] Lighthouse mobile beranda ≥ 90 untuk performa, aksesibilitas, SEO

- [ ] Tidak ada emoji; semua ikon dari Lucide; tampil benar di lebar 360 px

## 6. Prompt untuk Claude

```text
Kamu adalah senior Next.js engineer. Baca docs/prd/00-master.md, 01-design-system.md, dan
03-website-publik.md. Design system dan database sudah ada.

Tugas: bangun website publik.
1. Buat layout (site) di src/app/[locale]/(site) dengan Navbar, Footer, bar pengumuman,
   tombol mengambang Tanya/Saran, dan banner install.
2. Bangun beranda dengan 18 section sesuai urutan PRD-03; tiap section komponen terpisah di
   src/components/site/home dan bisa disembunyikan lewat site_settings.home_sections.
3. Bangun 14 rute di tabel bagian 1 beserta halaman detail, not-found, dan offline.
4. Ambil data dari Supabase di Server Components dengan cache tag; sediakan fungsi
   revalidate per tag.
5. Semua teks lewat next-intl; konten i18n dari database pakai helper t(field, locale) dengan
   fallback ke en.
6. Tambahkan metadata per halaman, JSON-LD (Mosque, Event, Article, BreadcrumbList), dan
   Web Share API.

Aturan: ikuti CLAUDE.md; tanpa emoji; mobile-first; skeleton dan empty state di setiap daftar.
Selesai: build lulus, uji di 360 px dan 1440 px, laporkan rute yang dibuat.
```

---

# PRD-04 · Jadwal Salat, Jumat & Kalender

Jadwal salat dihitung langsung di perangkat dengan `adhan` dari koordinat masjid, sehingga selalu tersedia bahkan saat offline; pengurus hanya mengatur metode, koreksi menit, iqamah, jadwal Jumat, dan pengecualian tanggal.

## 1. Mesin perhitungan

| Parameter     | Nilai default                                                     | Diatur di                           |
|---------------|-------------------------------------------------------------------|-------------------------------------|
| Koordinat     | Koordinat masjid di Matsudo (diisi saat setup)                    | `site_settings.location`            |
| Metode        | Muslim World League (sementara, **menunggu konfirmasi pengurus**) | `prayer_settings.method`            |
| Mazhab Asar   | Syafi’i (bayangan 1×)                                             | `prayer_settings.madhab`            |
| Koreksi menit | 0 untuk semua salat                                               | `prayer_settings.adjustments`       |
| Imsak         | Subuh − 10 menit                                                  | `prayer_settings.adjustments.imsak` |
| Zona waktu    | Asia/Tokyo                                                        | Tetap                               |
| Pengecualian  | Jam manual untuk tanggal tertentu                                 | `prayer_overrides`                  |

Modul `src/lib/prayer` menyediakan fungsi murni: `getDayTimes(date)`, `getNextPrayer(now)`, `getMonthTimes(year, month)`, dan `getIqamah(prayer, adhanTime)`. Fungsi yang sama dipakai di server (render awal), di klien (hitung mundur), di service worker (offline), dan di Edge Function (notifikasi).

## 2. Iqamah

- Setiap salat punya mode `offset` (menit setelah adzan) atau `fixed` (jam tetap, misalnya Isya 20:00 di musim panas).

- Admin bisa membuat rentang musiman lewat `prayer_overrides` (mis. jadwal iqamah musim dingin).

- Tampilan: jam adzan, jam iqamah, dan teks “iqamah dalam 12 menit” saat waktu salat sudah masuk.

## 3. Info Jumat

- `jumuah_schedules` menyimpan per tanggal: jam khutbah, jam iqamah, khatib, imam, bahasa khutbah, dan tema (3 bahasa).

- Bila pekan ini belum diisi, tampil jam default dari pengaturan dengan label “petugas belum ditetapkan”.

- Halaman `/jumuah` menampilkan pekan ini, 4 pekan berikutnya, dan arsip tema khutbah.

- Notifikasi pengingat Jumat dikirim Jumat pagi (PRD-07) beserta pengingat membaca Al-Kahfi.

## 4. Kalender Hijriah & pengingat ibadah

- Tanggal Hijriah memakai `Intl.DateTimeFormat` dengan kalender `islamic-umalqura`, ditambah koreksi ±2 hari dari admin (`hijri_offset`) agar sesuai pengumuman resmi.

- Hari penting dihitung otomatis: awal Ramadan, Idul Fitri, Arafah, Idul Adha, Asyura, Ayyamul Bidh (13–15), puasa Senin-Kamis.

- Kartu “Pengingat ibadah” di beranda dan App muncul 1 hari sebelumnya (mis. “Besok Ayyamul Bidh”), teks dari `daily_contents`.

## 5. Mode Ramadan

- Aktif otomatis saat bulan Hijriah ke-9, bisa dipaksa aktif/nonaktif oleh admin.

- Halaman jadwal menampilkan **imsakiyah** sebulan (imsak, Subuh, Magrib/berbuka, Isya, jam tarawih), dapat dicetak dan diunduh PDF.

- Beranda menampilkan hitung mundur berbuka dan info kegiatan Ramadan (buka bersama, tarawih, i’tikaf).

## 6. Komponen tampilan

| Komponen                           | Lokasi                       | Isi                                                                         |
|------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| `NextPrayerChip`                   | Hero beranda                 | Nama salat berikutnya + jam + hitung mundur                                 |
| `NextPrayerCard` + `CountdownRing` | Beranda App                  | Cincin progres menuju salat berikutnya, jam iqamah                          |
| `PrayerStrip`                      | Beranda web                  | 6 kartu (5 waktu + Jumat), yang aktif berwarna merah                        |
| `DailyPrayerTable`                 | `/prayer-times`, App         | Navigasi tanggal maju-mundur, tanggal Hijriah                               |
| `MonthlyPrayerTable`               | `/prayer-times`              | Siap cetak; unduh PDF; tombol “Tambahkan ke kalender” (`/api/calendar.ics`) |
| `RamadanImsakiyah`                 | `/prayer-times` saat Ramadan | Tabel imsakiyah + jam tarawih                                               |
| `JumuahCard`                       | Beranda, `/jumuah`, App      | Khatib, imam, jam, bahasa, tema                                             |
| `HijriBadge`                       | Header App, beranda          | Tanggal Hijriah dalam bahasa aktif                                          |

## 7. Kasus tepi

- Setelah Isya, “salat berikutnya” berpindah ke Subuh hari berikutnya.

- Jepang tidak memakai daylight saving, tetapi semua perhitungan tetap lewat zona Asia/Tokyo, bukan zona perangkat (penting bagi pengunjung dari Indonesia).

- Saat offline, jadwal dihitung dari koordinat & pengaturan terakhir yang di-cache; muncul label kecil “mode offline”.

## 8. Acceptance criteria

- [ ] Untuk 30 tanggal sampel, hasil berbeda ≤ 1 menit dari jadwal acuan yang disepakati pengurus

- [ ] Mengubah metode, koreksi, atau iqamah di admin langsung mengubah tampilan web & App

- [ ] `/api/calendar.ics` bisa di-subscribe di Google Calendar dan Apple Calendar

- [ ] Mode Ramadan aktif otomatis dan imsakiyah bisa diunduh PDF

- [ ] Unit test untuk `getNextPrayer` mencakup pergantian hari dan pengecualian tanggal

## 9. Prompt untuk Claude

```text
Baca docs/prd/00-master.md dan docs/prd/04-jadwal-salat.md. Database dan design system sudah ada.

Tugas: bangun modul jadwal salat.
1. Buat src/lib/prayer dengan fungsi murni getDayTimes, getNextPrayer, getMonthTimes, getIqamah
   memakai paket adhan, zona Asia/Tokyo, pengaturan dari prayer_settings, dan prayer_overrides.
2. Buat src/lib/hijri (Intl islamic-umalqura + hijri_offset) dan daftar hari penting otomatis.
3. Buat komponen NextPrayerChip, NextPrayerCard + CountdownRing, PrayerStrip, DailyPrayerTable,
   MonthlyPrayerTable, RamadanImsakiyah, JumuahCard, HijriBadge.
4. Bangun halaman /[locale]/prayer-times dan /[locale]/jumuah.
5. Buat route handler /api/calendar.ics dan unduh PDF jadwal bulanan.
6. Tulis unit test Vitest untuk perhitungan, iqamah, pergantian hari, dan override.

Aturan: ikuti CLAUDE.md; hitungan identik di server, klien, dan nanti service worker.
Selesai: test & build lulus; tampilkan contoh output jadwal hari ini.
```

---

# PRD-05 · Donasi QRIS & Japan Post Bank (v2)

Modul donasi menerima infaq dalam Rupiah lewat QRIS ke rekening Indonesia dan dalam Yen lewat transfer ke rekening Japan Post Bank. Tahap 1 berjalan tanpa payment gateway: donasi dicatat dari formulir dan baru dihitung setelah cocok dengan mutasi rekening yang diimpor admin donasi. Jalur otomatis (QRIS dinamis Midtrans dan Stripe) disiapkan di balik feature flag `PAYMENT_GATEWAY_ENABLED`, sehingga bisa diaktifkan kapan saja tanpa mengubah alur.

## 1. Kanal donasi

| Kanal                    | Mata uang | Cara donatur membayar                                        | Cara tercatat                                                                           | Biaya bagi masjid                                                                         | Status   |
|--------------------------|-----------|--------------------------------------------------------------|-----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|----------|
| QRIS statis              | Rupiah    | Isi formulir, scan QRIS, bayar nominal unik (mis. Rp100.027) | Laporan transaksi QRIS diimpor lalu dicocokkan dengan nominal unik dan waktu            | MDR Bank Indonesia: 0% sampai Rp100.000 dan untuk kategori donasi sosial; selain itu 0,7% | Tahap 1  |
| Transfer Japan Post Bank | Yen       | Isi formulir dengan nama katakana, lalu transfer ke rekening | CSV mutasi ゆうちょダイレクト diimpor lalu dicocokkan dengan nominal, tanggal, dan nama | ¥0; biaya transfer ditanggung donatur                                                     | Tahap 1  |
| QRIS dinamis (Midtrans)  | Rupiah    | QRIS khusus per donasi dengan nominal persis                 | Webhook Midtrans menandai lunas dalam hitungan detik                                    | Mengikuti MDR Bank Indonesia (Midtrans: 0,7% untuk merchant reguler)                      | Opsional |
| Stripe Japan             | Yen       | Transfer ke rekening virtual, kartu, PayPay, konbini         | Webhook Stripe menandai lunas; transfer bank dicocokkan otomatis oleh Stripe            | Transfer bank 1,5%; kartu & konbini 3,6%; PayPay 3,98%                                    | Opsional |

### 1.1 Fitur pendukung

| Fitur             | Rincian                                                                                                                                                                                                                             |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Program donasi    | Infaq Operasional (default), Zakat, Wakaf, dan program khusus; target dan progres hanya dihitung dari donasi berstatus `matched` atau `paid`                                                                                        |
| Halaman donasi    | Pilih program → pilih mata uang → formulir singkat (nama atau anonim, kontak, niat atas nama, pesan) → instruksi bayar → layar “menunggu dicocokkan” dengan nomor referensi                                                         |
| Nominal unik      | Rupiah: tiga digit terakhir unik (001–999) untuk setiap formulir yang masih aktif; Yen: tanpa nominal unik, memakai nama katakana dan tanggal                                                                                       |
| Data rekening     | QRIS (gambar, nama merchant, tombol unduh) dan Japan Post Bank dalam dua format: 記号・番号 untuk sesama Japan Post Bank, serta 店名・店番・普通・口座番号 untuk bank lain (kode bank 9900), dihitung otomatis, dengan tombol salin |
| Donatur tetap     | Formulir komitmen bulanan (nominal, mata uang, tanggal bayar) plus pengingat `.ics` dan Google Calendar; datanya masuk `sync_outbox` untuk web internal                                                                             |
| Kuitansi digital  | Setelah donasi cocok, donatur yang mengisi email menerima tanda terima PDF dalam bahasanya                                                                                                                                          |
| Kalkulator zakat  | Zakat maal, penghasilan, dan fitrah; nisab dan nilai fitrah diatur admin                                                                                                                                                            |
| Transparansi      | `/transparency`: total donasi terverifikasi per program dan mata uang, PDF laporan yang diterbitkan pengurus, daftar donatur yang bersedia namanya tampil                                                                           |
| Jumat Berkah      | Banner ajakan infaq setiap Jumat di web dan App                                                                                                                                                                                     |
| Infaq cepat (App) | Satu layar berisi program default, QRIS, rekening Japan Post Bank, dan tombol salin                                                                                                                                                 |

## 2. Alur pencatatan

![alur pencatatan donasi · tanpa gateway dan gateway opsional](docs/prd/assets/05-donasi/alur-pencatatan-donasi.png)

alur pencatatan donasi · tanpa gateway dan gateway opsional

Formulir membuat catatan berstatus menunggu; donasi baru dihitung ke progres setelah cocok dengan mutasi yang diimpor (tahap 1) atau setelah webhook gateway diterima (opsional). Baris mutasi tanpa formulir tetap dicatat sebagai donasi “Hamba Allah”, dan formulir tanpa pembayaran kedaluwarsa setelah 7 hari.

## 3. Aturan data & privasi

- Nominal disimpan sebagai `numeric` beserta mata uangnya; Yen dan Rupiah tidak pernah dijumlah langsung.

- Kontak donatur, file impor, dan baris mutasi (berisi nama pengirim) hanya bisa dibaca peran `donasi` dan `super_admin`; file disimpan di bucket privat.

- Nama donatur tampil publik hanya bila diizinkan; anonim tampil sebagai “Hamba Allah”.

- Webhook gateway hanya diterima bila tanda tangannya valid, dicatat di `payment_events`, dan diproses idempoten.

- Formulir publik dilindungi Turnstile dan rate limit (maks. 5 kiriman per jam per IP).

- Sampai web internal siap, admin donasi di web publik yang mencocokkan; setelah itu data dikirim lewat `sync_outbox`.

## 4. Bagian admin (detail di PRD-09)

Menu Donasi di PRD-09 berisi: daftar formulir dengan filter status, kanal, dan program; impor laporan QRIS dan CSV Japan Post Bank (pratinjau, deteksi kolom, penolakan file ganda); pencocokan otomatis dan manual; penandaan tolak atau kedaluwarsa; pengelolaan program, gambar QRIS, dan data rekening; unggah PDF laporan transparansi; serta ekspor CSV.

## 5. Acceptance criteria

- [ ] Nominal unik Rupiah tidak pernah bentrok antarformulir yang masih aktif

- [ ] Format transfer Japan Post Bank dari bank lain dihitung benar, diuji dengan contoh resmi

- [ ] Impor laporan QRIS dan CSV ゆうちょダイレクト mencocokkan minimal 90% donasi berformulir tanpa campur tangan

- [ ] File yang sama tidak bisa diimpor dua kali, dan satu baris mutasi hanya cocok dengan satu donasi

- [ ] Progres program hanya naik dari donasi berstatus `matched` atau `paid`

- [ ] Dengan `PAYMENT_GATEWAY_ENABLED=true`, webhook Midtrans dan Stripe menandai lunas dalam \< 10 detik dan tidak pernah tercatat ganda

- [ ] Kuitansi PDF terkirim otomatis setelah donasi cocok, bila email diisi

## 6. Prompt untuk Claude

```text
Baca docs/prd/00-master.md, 02-database.md (termasuk bagian 3.1 Perubahan v2), 05-donasi.md,
dan 12-kontrak-action-api.md. Web publik, database, dan design system sudah ada.

Tugas: bangun modul donasi v2.
1. Halaman /[locale]/donate:
   - daftar program + progres dari v_program_totals (hanya status matched/paid);
   - pemilih mata uang Rupiah / Yen;
   - formulir (React Hook Form + Zod + Turnstile): program, nominal, nama atau anonim, kontak,
     email opsional untuk kuitansi, niat atas nama, pesan, nama katakana (khusus Yen);
   - Server Action createDonationIntent: buat donation_confirmations status pending dengan channel
     yang dipilih, nominal unik Rupiah (tiga digit 001-999 yang tidak dipakai formulir aktif lain),
     dan reference_code berformat AM-INF-XXXXXX;
   - layar instruksi: QRIS (gambar dari site_settings, nominal unik besar, tombol salin nominal,
     unduh QRIS) atau Japan Post Bank (dua format rekening + tombol salin);
   - layar "menunggu dicocokkan" dengan nomor referensi.
2. Helper src/lib/donations/yucho.ts: ubah kode & nomor rekening umum Japan Post Bank menjadi format
   transfer dari bank lain (kode bank 9900, nomor cabang, jenis rekening, nomor rekening) sesuai rumus
   resmi; unit test dengan contoh resmi.
3. Impor mutasi (admin, peran donasi): unggah laporan QRIS (CSV/XLSX) atau CSV ゆうちょダイレクト,
   deteksi format & kolom, pratinjau, simpan statement_imports + statement_lines (tolak file ganda
   lewat hash), pencocokan otomatis (Rupiah: nominal unik dalam 24 jam; Yen: nominal + tanggal ±2 hari
   + kemiripan nama katakana), sisanya masuk antrean cocok manual; baris tanpa formulir dibuat sebagai
   donasi "Hamba Allah".
4. Setelah cocok: status matched, revalidateTag('donations'), kirim kuitansi PDF lewat Resend bila
   email ada, tulis sync_outbox.
5. Formulir donatur tetap + pengingat .ics; kalkulator zakat; halaman /[locale]/transparency
   (total per program & mata uang + daftar PDF finance_reports).
6. Jalur otomatis di balik flag PAYMENT_GATEWAY_ENABLED: adapter src/lib/payments/midtrans.ts dan
   stripe.ts, route handler /api/webhooks/midtrans dan /api/webhooks/stripe (verifikasi tanda tangan,
   simpan payment_events, idempoten, set status paid). Bila flag false, opsi ini tidak tampil.
7. Komponen InfaqQuick untuk App Jamaah.

Aturan: ikuti CLAUDE.md; data donatur & mutasi hanya untuk peran donasi/super_admin; Yen dan
Rupiah tidak pernah dijumlah. Selesai: unit test pencocokan & helper Japan Post Bank lulus, uji
impor dengan file contoh, build lulus.
```

## Sumber

- [Bank Indonesia — MDR QRIS bagi merchant](https://www.bi.go.id/id/publikasi/ruang-media/cerita-bi/pages/mdr-qris.aspx)

- [Midtrans — biaya transaksi QRIS](https://docs.midtrans.com/docs/berapa-biaya-transaksi-untuk-qris)

- [Japan Post Bank — unduh mutasi CSV](https://www.jp-bank.japanpost.jp/direct/pc/guide/dr_pc_gd_meisai.html)

- [Japan Post Bank — rumus format rekening untuk transfer dari bank lain](https://www.jp-bank.japanpost.jp/kojin/sokin/koza/kj_sk_kz_furikomi_ksk.html)

- [Stripe — transfer bank dengan rekening virtual](https://docs.stripe.com/payments/bank-transfers?locale=ja-JP)

- [Ringkasan tarif metode pembayaran Stripe di Jepang](https://www.issoh.co.jp/tech/details/18531/)

---

# PRD-06 · Kegiatan, Kajian & Pendaftaran

Modul ini menghidupkan masjid di luar jam salat: agenda dengan kalender, pendaftaran kegiatan lewat formulir yang bisa dirakit admin tanpa koding, kajian video dengan deteksi siaran langsung, serta program pendidikan anak dan muallaf.

## 1. Agenda kegiatan

| Aspek           | Spesifikasi                                                                                              |
|-----------------|----------------------------------------------------------------------------------------------------------|
| Jenis           | Kajian rutin, dauroh/kajian akbar, kelas muallaf, TPA, kegiatan sosial, open mosque, agenda Ramadan & Id |
| Jadwal berulang | `recurrence_rule` format RRULE (mis. setiap Sabtu 19:30); kemunculan berikutnya dihitung otomatis        |
| Tampilan        | Daftar (default di HP) dan kalender bulanan; filter kategori, bahasa, dan “terbuka untuk umum”           |
| Detail          | Cover, waktu (JST), lokasi atau tautan online, pemateri, bahasa, kuota & sisa, batas daftar, materi      |
| Aksi            | Daftar, tambahkan ke kalender (`.ics`), bagikan, buka peta                                               |
| Status          | Akan datang, berlangsung (penanda merah), selesai (pindah ke arsip dengan materi & rekaman)              |

## 2. Formulir pendaftaran dinamis

Admin merakit formulir dari panel tanpa koding; skemanya disimpan di `forms.schema` dan dirender otomatis dengan validasi Zod yang dibangkitkan dari skema yang sama.

| Tipe field                                    | Contoh                                                                                  |
|-----------------------------------------------|-----------------------------------------------------------------------------------------|
| Teks, email, telepon/WhatsApp, angka, tanggal | Nama, nomor WA, usia anak                                                               |
| Pilihan tunggal & ganda                       | Jenis kelamin (ikhwan/akhwat), status (pelajar, pekerja, magang, lainnya), transportasi |
| Teks panjang                                  | Catatan tambahan, pertanyaan untuk pemateri                                             |
| Persetujuan                                   | Izin penggunaan data, izin foto dokumentasi                                             |

- Setiap label dan opsi punya teks 3 bahasa; field bisa wajib atau opsional.

- Template siap pakai: **Dauroh** (mengikuti field di Hekinan: hari ikut, menginap, membawa keluarga, transportasi, pesan buku), **TPA** (data wali & anak), **Kelas muallaf**, **Relawan**.

- Saat kuota penuh, pendaftar otomatis masuk daftar tunggu; layar sukses menampilkan nomor referensi dan tautan pembatalan.

- Email konfirmasi otomatis; tautan grup WhatsApp kegiatan hanya ditampilkan setelah mendaftar.

- Donasi kegiatan: tombol ke program donasi khusus kegiatan dan daftar kebutuhan barang/konsumsi yang bisa diklaim jamaah.

## 3. Kajian & video

| Fitur             | Spesifikasi                                                                                                                                                                                                                             |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Pustaka video     | Dari `lectures`: kategori (aqidah, fikih, sirah, adab, bahasa Jepang), filter ustadz, pencarian; pemutar ringan (lite YouTube embed) agar halaman tetap cepat                                                                           |
| Deteksi live      | Edge Function memeriksa YouTube Data API kanal masjid tiap 3 menit hanya di jendela jadwal kajian (hemat kuota); bila live, `is_live = true` dan banner merah “Sedang live” muncul di web & App; admin bisa menyalakan/mematikan manual |
| Notifikasi live   | Push “Kajian sedang berlangsung” ke pengguna yang mengaktifkan kategori kajian                                                                                                                                                          |
| Materi            | PDF materi dari bucket `materials`, bisa diunduh untuk offline                                                                                                                                                                          |
| Kanal rekomendasi | Daftar kanal kajian eksternal yang dikurasi admin, seperti bagian “Kajian Asatidz” di App Hekinan                                                                                                                                       |

## 4. Program pendidikan

- **TPA anak**: jadwal, kelas per usia, pendaftaran oleh wali, pengumuman khusus wali.

- **Kelas muallaf** (utama berbahasa Jepang): kurikulum dasar, jadwal, kontak pembimbing, materi pengantar Islam dalam bahasa Jepang.

- **Halaqah/kajian rutin**: arsip tema per pekan.

## 5. Acceptance criteria

- [ ] Agenda berulang tampil benar di kalender minimal 3 bulan ke depan

- [ ] Admin bisa membuat formulir baru dari template dan langsung dipakai tanpa deploy ulang

- [ ] Pendaftaran ke-(kuota+1) masuk daftar tunggu dan pendaftar diberi tahu

- [ ] Banner live muncul paling lambat 5 menit setelah siaran dimulai

- [ ] Setiap agenda bisa ditambahkan ke Google Calendar dan Apple Calendar

## 6. Prompt untuk Claude

```text
Baca docs/prd/00-master.md dan docs/prd/06-kegiatan-kajian.md. Fondasi, database, dan web publik
sudah ada.

Tugas: bangun modul agenda, pendaftaran, dan kajian.
1. Halaman /[locale]/events (daftar + kalender bulanan, filter) dan /[locale]/events/[slug]
   (detail, sisa kuota dari v_event_capacity, tombol .ics, bagikan).
2. Renderer formulir dinamis dari forms.schema: komponen per tipe field, label 3 bahasa,
   generator skema Zod dari JSON, Turnstile, layar sukses + nomor referensi, logika daftar tunggu.
3. Server Action submitRegistration + email konfirmasi Resend + tautan pembatalan bertoken.
4. Template formulir: Dauroh, TPA, Kelas muallaf, Relawan (seed JSON).
5. Halaman /[locale]/lectures dengan pustaka video (lite YouTube embed), filter, dan banner live.
6. Supabase Edge Function check-youtube-live (YouTube Data API, hanya di jendela jadwal kajian)
   yang memperbarui lectures.is_live; dokumentasikan variabel lingkungannya.

Aturan: ikuti CLAUDE.md; semua jam dalam Asia/Tokyo; tanpa emoji.
Selesai: uji pendaftaran sampai daftar tunggu; build lulus.
```

---

# PRD-07 · App Jamaah (PWA)

App Jamaah adalah rute `/[locale]/app` dari codebase yang sama, dipasang ke layar utama HP sebagai PWA dan terasa seperti aplikasi native: navigasi bawah, kartu salat berikutnya, akses cepat, notifikasi adzan, dan tetap bisa dipakai saat offline.

![wireframe App Jamaah · beranda dan jadwal](docs/prd/assets/07-app-jamaah-pwa/wireframe-app-jamaah.png)

wireframe App Jamaah · beranda dan jadwal

Layar beranda menjawab “apa yang saya butuhkan sekarang”; layar jadwal sekaligus tempat mengatur pengingat per salat.

## 1. Instalasi

| Aspek           | Spesifikasi                                                                                                                                                                                                     |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Manifest        | `name` “Masjid Al-Muttaqin Chiba”, `short_name` “Al-Muttaqin”, `start_url` `/[locale]/app` sesuai bahasa terakhir, `display: standalone`, `theme_color` & `background_color` `#0A0A0A`, ikon 192/512 + maskable |
| Shortcuts       | Jadwal, Kiblat, Infaq (tekan lama ikon App)                                                                                                                                                                     |
| Android/desktop | Tangkap `beforeinstallprompt`, tampilkan kartu install kustom (bukan pop-up bawaan)                                                                                                                             |
| iPhone          | Sheet panduan bergambar ikon: Bagikan → Tambahkan ke Layar Utama; muncul hanya di Safari iOS                                                                                                                    |
| Pembaruan       | Saat service worker baru siap, toast “Versi baru tersedia” + tombol muat ulang                                                                                                                                  |

## 2. Strategi offline

| Sumber daya                      | Strategi                                                                              |
|----------------------------------|---------------------------------------------------------------------------------------|
| Shell App, font, ikon            | Precache saat install                                                                 |
| Jadwal salat                     | Dihitung di perangkat dari pengaturan yang di-cache; 30 hari ke depan selalu tersedia |
| Berita, agenda, kajian           | Stale-while-revalidate; data terakhir tetap tampil dengan label “terakhir diperbarui” |
| Doa, dzikir, kamus, kanji haram  | Di-cache penuh agar bisa dibaca tanpa sinyal                                          |
| Form saran & konfirmasi          | Disimpan di antrean lokal saat offline, dikirim otomatis saat online                  |
| Halaman yang belum pernah dibuka | Halaman fallback offline dengan tautan ke fitur yang tersedia                         |

## 3. Notifikasi push

- Izin diminta hanya setelah jamaah menekan “Aktifkan pengingat adzan”, tidak pernah saat halaman pertama dibuka.

- Preferensi per jenis: tiap salat (dengan pilihan 0/5/10/15 menit sebelumnya), pengingat Jumat & Al-Kahfi, kajian live, pengumuman penting, pengingat puasa sunnah.

- Langganan disimpan lewat RPC `upsert_push_subscription` bersama bahasa dan zona waktu.

- Edge Function terjadwal tiap menit menghitung waktu salat dengan pustaka yang sama, lalu mengirim Web Push ke langganan yang cocok; teks notifikasi dalam bahasa jamaah, tanpa emoji.

- Admin bisa mengirim siaran manual (`push_campaigns`) untuk pengumuman mendesak.

- Di iPhone, push hanya berfungsi setelah App ditambahkan ke Layar Utama (iOS 16.4 ke atas); App menampilkan petunjuk ini.

## 4. Layar App

| Layar                    | Isi                                                                                                                                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Beranda                  | Salam, tanggal Hijriah, kartu salat berikutnya + cincin hitung mundur, 5 waktu, info Jumat, 8 akses cepat, hadits harian, kartu kontekstual (dzikir pagi setelah Subuh, sunnah Jumat, waktu tahajud) |
| Jadwal                   | Harian dengan navigasi tanggal, sakelar pengingat per salat, pengingat Jumat, tambahkan ke kalender                                                                                                  |
| Kiblat                   | Kompas dari sensor orientasi + arah kiblat dihitung dari koordinat (great-circle); izin sensor di iOS; cadangan berupa garis arah di peta                                                            |
| Al-Qur’an                | Pembaca di dalam App: daftar surah, teks Arab dan terjemahan sesuai bahasa, penanda terakhir dibaca di perangkat, akses cepat Al-Kahfi, Yasin, dan Al-Mulk; ditambah kalender Hijriah interaktif     |
| Doa & dzikir             | Dzikir pagi/petang, doa harian, dzikir setelah salat; teks Arab + latin + terjemahan; penghitung tasbih sederhana                                                                                    |
| Kajian live              | Pemutar siaran saat live, jadwal kajian berikutnya                                                                                                                                                   |
| Infaq cepat              | Program default, rekening JP/ID dengan tombol salin, konfirmasi                                                                                                                                      |
| Bantuan jamaah           | Info terbaru, tanya pengurus, lapor fasilitas, nomor darurat Jepang (110 polisi, 119 ambulans/kebakaran), lokasi masjid                                                                              |
| Kamus saku & radar halal | Dari PRD-08, versi ringkas untuk HP                                                                                                                                                                  |
| Pengaturan               | Bahasa, tema, notifikasi, sumber lokasi jadwal (masjid atau lokasi saya)                                                                                                                             |

Navigasi bawah berisi 5 tab: Beranda, Jadwal, Infaq, Info, Saran.

## 5. Acceptance criteria

- [ ] Lighthouse PWA: installable, punya service worker, manifest valid, ikon maskable

- [ ] Dalam mode pesawat, beranda, jadwal 30 hari, doa, dan kamus tetap terbuka

- [ ] Notifikasi adzan tiba paling lambat 1 menit dari waktu salat di Android Chrome dan iPhone yang sudah meng-install App

- [ ] Menonaktifkan satu salat di pengaturan menghentikan notifikasi untuk salat itu saja

- [ ] Arah kiblat sesuai perhitungan great-circle dari koordinat masjid (selisih \< 1°)

## 6. Prompt untuk Claude

```text
Baca docs/prd/00-master.md, 04-jadwal-salat.md, dan 07-app-jamaah-pwa.md. Web publik, jadwal
salat, dan database sudah ada.

Tugas: bangun App Jamaah PWA.
1. Layout /[locale]/app dengan header ringkas, safe-area iOS, dan BottomNav 5 tab.
2. Layar Beranda, Jadwal, Kiblat, Al-Qur'an, Doa & dzikir, Kajian live, Infaq cepat,
   Bantuan jamaah, Pengaturan sesuai PRD-07 bagian 4.
3. Manifest (src/app/manifest.ts) dengan shortcuts, ikon maskable, dan Serwist service worker:
   precache shell, runtime cache sesuai bagian 2, halaman fallback offline, toast pembaruan.
4. Kartu install kustom (beforeinstallprompt) dan sheet panduan iOS.
5. Push: tombol opt-in, preferensi per salat, RPC upsert_push_subscription, Edge Function
   send-prayer-push (cron tiap menit, pakai src/lib/prayer versi Deno), dan siaran admin.
6. Antrean offline untuk form saran dan konfirmasi infaq.

Aturan: ikuti CLAUDE.md; ikon Lucide; tanpa emoji termasuk di teks notifikasi.
Selesai: audit Lighthouse PWA lulus, uji mode pesawat, build lulus.
```

---

# PRD-08 · Panduan Muslim & Layanan Jamaah

Modul ini menjadikan masjid pintu pertama bagi muslim yang baru tiba di Chiba dan jembatan bagi warga Jepang: panduan hidup sehari-hari, pengecek bahan haram dalam huruf Jepang, kamus dakwah, peta tempat ramah muslim, FAQ, dan kotak saran yang masuk langsung ke pengurus. Semua isinya dikelola dari panel admin.

## 1. Muslim baru di Chiba (`/newcomers`)

Halaman berbentuk langkah “Mulai dari sini”, terinspirasi bagian “Saya baru di Hekinan”:

1.  Kenali masjid: lokasi, rute dari stasiun terdekat, jam buka, kontak pengurus.

2.  Gabung komunitas: grup jamaah, kajian rutin, kegiatan pekan ini.

3.  Makanan halal: cara membaca label, toko & restoran (tautan ke radar halal).

4.  Kehidupan sehari-hari: aturan pilah sampah (tautan ke situs resmi kota), transportasi, dokumen penting setelah pindah.

5.  Ibadah di perjalanan: ringkasan fikih musafir yang ditinjau ustadz masjid.

6.  Darurat: 110 (polisi), 119 (ambulans & kebakaran), kontak pengurus.

Setiap langkah adalah satu entri `guides` (section `newcomer`) dengan ikon Lucide, teks 3 bahasa, dan tautan luar opsional.

## 2. Halal & kamus dakwah (`/halal`)

| Fitur                        | Spesifikasi                                                                                                                                                                                         |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Daftar bahan haram & syubhat | Dari `haram_ingredients`: kanji/katakana, cara baca, arti, level (haram/syubhat); bisa dicari dengan kanji, kana, atau romaji                                                                       |
| Cek label                    | Jamaah menempel teks komposisi dari label; sistem menyorot istilah yang cocok dan memberi ringkasan “mengandung bahan haram/syubhat”. Pemindaian kamera (OCR) masuk fase 3                          |
| Radar halal                  | Peta Leaflet dari `places`: masjid & musala, toko halal, restoran; filter jenis; lencana “terverifikasi”; form “usulkan tempat” yang masuk ke admin                                                 |
| Kamus dakwah                 | Dari `dictionary_entries`: kategori ibadah, makanan, sehari-hari, menjelaskan Islam; kolom Indonesia, Inggris, Jepang, kana, romaji; tombol salin & perbesar teks untuk ditunjukkan ke lawan bicara |

Contoh isi awal (diperiksa ulang oleh penutur Jepang sebelum terbit):

| Kanji / kana    | Arti                            | Level   |
|-----------------|---------------------------------|---------|
| 豚肉 / ポーク   | Daging babi                     | Haram   |
| ラード          | Lemak babi                      | Haram   |
| 酒 / アルコール | Minuman keras / alkohol         | Haram   |
| みりん          | Bumbu masak beralkohol          | Haram   |
| ゼラチン        | Gelatin (sumber tidak jelas)    | Syubhat |
| 乳化剤          | Pengemulsi (sumber tidak jelas) | Syubhat |

| Indonesia                                  | Jepang                                 |
|--------------------------------------------|----------------------------------------|
| Saya muslim, jadi tidak makan daging babi. | 私はムスリムなので、豚肉を食べません。 |
| Bolehkah saya salat di sini?               | ここでお祈りしてもいいですか。         |
| Apakah makanan ini mengandung alkohol?     | この料理にアルコールは入っていますか。 |

## 3. FAQ (`/faq`)

- Kategori: lokasi & akses, salat & Jumat, kajian & kegiatan, infaq & zakat, muallaf, kunjungan non-muslim, App Jamaah.

- Pencarian langsung, accordion, dan JSON-LD `FAQPage` untuk SEO.

- Setiap jawaban boleh berisi tautan ke halaman lain di situs.

## 4. Kotak saran & tanya

| Aspek         | Spesifikasi                                                                                                                 |
|---------------|-----------------------------------------------------------------------------------------------------------------------------|
| Pintu masuk   | Tombol mengambang di web, tab “Saran” di App, halaman kontak                                                                |
| Kategori      | Saran/kritik, Tanya pengurus, Tanya ustadz, Lapor fasilitas (toilet, AC, karpet, tempat wudu), Kendala website/App, Lainnya |
| Isian         | Pesan (wajib), nama & kontak (opsional, boleh anonim), foto (khusus lapor fasilitas, ≤ 5 MB)                                |
| Setelah kirim | Nomor referensi, email ke pengurus sesuai kategori, opsi “kirim juga via WhatsApp”                                          |
| Di admin      | Status baru/diproses/selesai, penanggung jawab, catatan internal (PRD-09)                                                   |

## 5. Untuk warga Jepang & calon muallaf

- Halaman “Mengenal Islam” dalam bahasa Jepang: pengantar singkat, enam rukun iman dan lima rukun Islam, materi unduhan.

- Adab berkunjung: pakaian, melepas alas kaki, menghormati waktu salat, area wanita.

- Formulir “Kunjungan rombongan / open mosque” untuk sekolah dan komunitas (memakai formulir dinamis PRD-06).

## 5A. Peminjaman ruangan (v2)

Sesuai keputusan direktur, ruangan bisa diajukan lewat web publik di `/rooms`. Persetujuan nantinya dilakukan direktur di web internal; sampai web internal siap, admin web publik yang memproses.

1.  Pengunjung melihat daftar ruangan (foto, kapasitas, fasilitas) dan kalender ketersediaan; slot terpakai hanya tampil sebagai “terisi” tanpa detail pemesan.

2.  Pengunjung mengisi formulir: ruangan, tanggal dan jam, keperluan (akad nikah, rapat komunitas, kajian, kunjungan sekolah, lainnya), jumlah peserta, nama penyelenggara, kontak, dan persetujuan aturan pemakaian.

3.  Sistem mengecek bentrok jadwal secara langsung; waktu salat berjamaah dan salat Jumat otomatis tidak bisa dipesan.

4.  Pengajuan tersimpan berstatus `requested` dengan nomor referensi, dan pemohon menerima email konfirmasi.

5.  Setelah disetujui atau ditolak (dengan catatan), pemohon menerima email; bila disetujui, slot terkunci dan pemohon mendapat file `.ics`.

Aturan pemakaian dan batas waktu pengajuan (usulan: paling lambat 3 hari sebelumnya) diatur dari admin.

## 5B. Program budaya (v2)

Sebagai cultural center, web menampilkan program yang menjembatani muslim dan masyarakat Jepang; setiap program memakai tabel `programs` dan pendaftaran lewat formulir dinamis PRD-06.

| Program                  | Isi                                                                                             | Pendaftaran                        |
|--------------------------|-------------------------------------------------------------------------------------------------|------------------------------------|
| Kelas bahasa             | Bahasa Jepang untuk jamaah asing; bahasa Indonesia dan Arab untuk umum; level, jadwal, pengajar | Formulir + kuota                   |
| Open mosque & tur masjid | Jadwal tur, pemandu berbahasa Jepang atau Inggris, adab berkunjung                              | Formulir perorangan atau rombongan |
| Kunjungan sekolah        | Paket kunjungan edukatif dan materi pendamping untuk guru                                       | Formulir dengan data sekolah       |
| Pameran & festival       | Bazar Ramadan, pameran kaligrafi, perayaan Idul Fitri dan Idul Adha                             | Informasi + pendaftaran relawan    |

## 6. Acceptance criteria

- [ ] Cek label menyorot semua istilah dari `haram_ingredients` yang muncul di teks, termasuk varian katakana

- [ ] Radar halal menampilkan titik di peta dan bisa difilter per jenis tanpa memuat ulang halaman

- [ ] Pesan anonim tersimpan tanpa nama/kontak dan tetap bisa ditindaklanjuti lewat status di admin

- [ ] Halaman panduan, kamus, dan kanji haram dapat dibuka offline di App

- [ ] Semua teks Jepang diperiksa penutur asli sebelum launch

## 7. Prompt untuk Claude

```text
Baca docs/prd/00-master.md dan docs/prd/08-panduan-layanan.md. Database, web publik, dan App
Jamaah sudah ada.

Tugas: bangun modul panduan & layanan jamaah.
1. /[locale]/newcomers: stepper "Mulai dari sini" dari guides (section newcomer), ikon Lucide.
2. /[locale]/halal dengan tab: Bahan haram (pencarian kanji/kana/romaji), Cek label (sorot
   istilah yang cocok + ringkasan), Radar halal (Leaflet + OpenStreetMap, filter jenis, form
   usulkan tempat), Kamus dakwah (salin + mode teks besar).
3. /[locale]/faq dengan kategori, pencarian, accordion, dan JSON-LD FAQPage.
4. Komponen FeedbackSheet (kotak saran & tanya) dipakai di tombol mengambang web, tab Saran App,
   dan halaman kontak; Server Action submitMessage + upload foto + email Resend per kategori.
5. Halaman "Mengenal Islam" berbahasa Jepang dan bagian adab berkunjung.
6. Versi ringkas Kamus Saku dan Radar Halal untuk App, ikut di-cache offline.

Aturan: ikuti CLAUDE.md; tampilan teks Jepang memakai Noto Sans JP; tanpa emoji.
Selesai: build lulus; uji cek label dengan contoh teks komposisi.
```

---

# PRD-09 · Panel Admin

Panel admin di `/admin` adalah satu-satunya tempat pengurus mengubah isi web dan App. Ia dirancang untuk pengurus non-teknis yang sering bekerja dari HP: antarmuka bahasa Indonesia atau Jepang, formulir dengan tab tiga bahasa, pratinjau sebelum terbit, dan hak akses berdasarkan peran.

## 1. Akses & keamanan

- Login email + password lewat Supabase Auth; tidak ada pendaftaran publik, akun baru hanya lewat undangan `super_admin`.

- Verifikasi dua langkah (TOTP) opsional, wajib untuk `super_admin` dan `finance`.

- Middleware melindungi semua rute `/admin`; setiap Server Action mengecek peran lagi di server.

- Sesi berakhir otomatis setelah 7 hari tidak aktif; setiap perubahan tercatat di `activity_logs`.

## 2. Tata letak

Sidebar yang bisa diciutkan (menu dikelompokkan: Ibadah, Konten, Kegiatan, Keuangan, Layanan, Sistem), topbar dengan pencarian global, pemilih bahasa UI admin, dan menu profil. Di HP, sidebar menjadi drawer dan tabel berubah menjadi kartu.

![wireframe dashboard admin · desktop](docs/prd/assets/09-panel-admin/wireframe-dashboard-admin.png)

wireframe dashboard admin · desktop

Dashboard dibuka dengan angka yang menuntut tindakan (kartu “Infaq tertunda” disorot), tiga aksi cepat yang paling sering dipakai, lalu antrean tugas dan agenda terdekat; menu di sidebar hanya tampil sesuai peran.

## 3. Menu & fungsi

| Menu                 | Fungsi                                                                                                                                                                      | Peran       |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| Dashboard            | Kartu ringkasan: pesan baru, konfirmasi infaq tertunda, pendaftar pekan ini, pelanggan notifikasi, total infaq bulan ini per mata uang; agenda terdekat; aktivitas terakhir | Semua       |
| Jadwal & Jumat       | Metode hitung, koreksi menit, iqamah per salat, pengecualian tanggal, kalender Jumat (khatib, imam, tema), mode Ramadan, koreksi Hijriah; pratinjau jadwal sebulan          | editor      |
| Berita & Pengumuman  | Editor Tiptap bertab JP/EN/ID, cover, sematkan, jadwal terbit, status draf/terbit/arsip                                                                                     | editor      |
| Kajian & Video       | Kelola video & materi, sakelar live manual, kanal rekomendasi                                                                                                               | editor      |
| Agenda & Formulir    | Kelola agenda, pengulang jadwal (mingguan/bulanan), kuota, form builder drag-and-drop dengan template                                                                       | editor      |
| Data Pendaftar       | Tabel per agenda, ubah status (dikonfirmasi, daftar tunggu, batal), ekspor CSV                                                                                              | editor      |
| Konfirmasi Infaq     | Daftar formulir donasi, impor laporan QRIS & CSV Japan Post Bank, pencocokan otomatis dan manual, tolak atau kedaluwarsa, ekspor CSV                                        | finance     |
| Keuangan & Laporan   | Kelola program donasi, gambar QRIS, rekening Japan Post Bank, donatur tetap, dan unggah PDF laporan transparansi (buku kas ada di web internal)                             | finance     |
| Panduan, FAQ & Kamus | Kelola panduan, FAQ, kamus dakwah, bahan haram, tempat halal (setujui usulan), konten doa & hadits harian                                                                   | editor      |
| Kotak Masuk          | Pesan per kategori, status, penanggung jawab, catatan internal                                                                                                              | editor      |
| Notifikasi Push      | Buat siaran, pilih bahasa & topik, jadwalkan, lihat jumlah terkirim                                                                                                         | editor      |
| Galeri & Kisah       | Album foto (unggah banyak, kompres otomatis), kisah jamaah & muallaf                                                                                                        | editor      |
| Pengguna & Peran     | Undang admin, ubah peran, nonaktifkan akun                                                                                                                                  | super_admin |
| Pengaturan Situs     | Identitas, alamat & koordinat, kontak, sosial, mitra, pengurus, bar pengumuman, tampil/sembunyi section beranda                                                             | super_admin |
| Log Aktivitas        | Siapa mengubah apa dan kapan, beserta perbedaannya                                                                                                                          | super_admin |

### 3.1 Perubahan v2

- Peran `finance` berganti nama menjadi `donasi`; ia hanya mengelola donasi web publik sampai web internal siap.

- Menu baru **Peminjaman Ruangan**: daftar pengajuan, kalender, setujui atau tolak dengan catatan, email otomatis ke pemohon, blok waktu salat dan Jumat (peran editor; nanti pindah ke direktur di web internal).

- Menu baru **Ruangan & Program Budaya**: kelola data ruangan, aturan pemakaian, serta program (kelas bahasa, open mosque, kunjungan sekolah, festival) beserta formulirnya.

- Menu **Pencarian & Aksesibilitas** di Pengaturan Situs: kata kunci yang disarankan dan teks bantuan per bahasa.

- Buku kas, anggaran, inventaris, dan data jamaah tidak ada di admin ini; semuanya milik web internal.

## 4. Pola UX admin

- Tabel data (TanStack Table) dengan pencarian, filter, urutan, dan paginasi di server.

- Formulir konten memakai tab JP / EN / ID dengan penanda kelengkapan tiap bahasa dan tombol “salin dari bahasa lain” sebagai titik awal terjemahan.

- Draf tersimpan otomatis; hapus berarti arsip dengan konfirmasi; toast untuk setiap aksi berhasil atau gagal.

- Tombol “Pratinjau” membuka halaman publik dalam mode draf sebelum diterbitkan.

- Unggahan gambar dikompres dan dipotong di browser sebelum dikirim ke Storage.

- Setiap simpan memanggil `revalidateTag` yang sesuai sehingga web & App langsung terbarui.

- Fase 3 (opsional): bantuan terjemahan draf otomatis yang wajib ditinjau manusia sebelum terbit.

## 5. Acceptance criteria

- [ ] Pengguna tanpa sesi yang membuka `/admin/*` dialihkan ke halaman login

- [ ] `editor` tidak melihat menu keuangan; `finance` tidak melihat menu konten; dicek di UI dan di server

- [ ] Menerbitkan pengumuman 3 bahasa bisa selesai dalam \< 3 menit oleh pengurus yang baru dilatih

- [ ] Semua tabel bisa diekspor CSV dan dipakai dari HP

- [ ] Setiap perubahan muncul di Log Aktivitas dengan nama pelaku dan waktu

## 6. Prompt untuk Claude

```text
Baca docs/prd/00-master.md, 02-database.md, dan 09-panel-admin.md. Modul publik sudah ada.

Tugas: bangun panel admin di src/app/admin.
1. Halaman login, middleware proteksi, guard peran (super_admin, editor, finance) di layout dan
   di setiap Server Action; dukungan TOTP Supabase MFA.
2. Layout sidebar + topbar responsif; UI admin dua bahasa (id, ja) lewat next-intl.
3. Komponen generik: DataTable (TanStack), I18nFieldTabs (ja/en/id + penanda kelengkapan),
   ImageUploader (kompres + crop), ConfirmDialog, StatusBadge, ExportCsvButton.
4. Semua menu di tabel bagian 3, termasuk form builder drag-and-drop (dnd-kit) untuk forms.schema,
   pembuat laporan keuangan PDF, dan pengirim siaran push.
5. Setiap simpan memanggil revalidateTag dan menulis activity_logs.

Aturan: ikuti CLAUDE.md; ikon Lucide; tanpa emoji; tampilan admin tetap memakai design system
yang sama dengan nuansa lebih netral.
Selesai: uji tiga peran dengan tiga akun berbeda; build lulus.
```

---

# PRD-10 · Bahasa, SEO, Keamanan & Deploy

PRD ini mengatur hal lintas modul yang membuat produk siap dipakai publik: tiga bahasa yang konsisten, mudah ditemukan di Google, aman, teruji, dan bisa di-deploy ulang kapan saja. Bagian i18n dikerjakan di awal (setelah PRD-02); sisanya di akhir sebelum launch.

## 1. Multibahasa

| Aspek           | Keputusan                                                                                                                                              |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| Locale          | `ja`, `en`, `id`; rute selalu berprefiks (`/ja/...`)                                                                                                   |
| Deteksi         | Kunjungan pertama ke `/` memakai `Accept-Language`, lalu pilihan disimpan di cookie; default `ja` (menunggu konfirmasi pengurus)                       |
| Teks antarmuka  | `messages/{ja,en,id}.json` per namespace (common, home, prayer, donate, admin, ...)                                                                    |
| Konten database | Helper `t(field, locale)` dengan urutan fallback: bahasa diminta → `en` → `ja` → `id`; admin melihat penanda bahasa yang kosong                        |
| Format          | Tanggal, angka, dan mata uang lewat `Intl` (contoh: 2026年10月29日, 29 Oktober 2026, ¥1,000, Rp100.000)                                                |
| Glosarium       | Istilah tetap per bahasa, mis. salat → 礼拝 / prayer, Jumat → 金曜礼拝 / Friday prayer, infaq → 寄付 / donation; disimpan di `messages` agar konsisten |

## 2. SEO

- Metadata per halaman per bahasa, URL kanonik, `hreflang` untuk ketiga bahasa + `x-default`.

- `sitemap.xml` dinamis (halaman, berita, agenda, kajian) dan `robots.txt`.

- Gambar Open Graph dibuat otomatis dengan `next/og` memakai warna dan logo masjid.

- JSON-LD: `Mosque` (alamat, koordinat, jam), `Event`, `Article`, `FAQPage`, `BreadcrumbList`.

- Daftarkan Google Search Console dan tautkan ke profil Google Business masjid.

## 3. Keamanan & privasi

| Area        | Kontrol                                                                                                                                          |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| Autentikasi | Supabase Auth, tanpa pendaftaran publik, MFA untuk peran sensitif                                                                                |
| Data        | RLS di semua tabel; `service_role` key hanya di server, tidak pernah ke klien                                                                    |
| Form publik | Validasi Zod di server, Cloudflare Turnstile, rate limit per IP, cek tipe & ukuran file                                                          |
| Header HTTP | CSP, HSTS, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (geolocation & sensor hanya untuk situs sendiri)                     |
| Rahasia     | Variabel lingkungan di Vercel & Supabase; repo hanya berisi `.env.example`                                                                       |
| Dependensi  | Pembaruan otomatis (Dependabot) dan `npm audit` di CI                                                                                            |
| Backup      | Backup harian Supabase sesuai paket; ekspor `pg_dump` mingguan ke penyimpanan terpisah bila memakai paket gratis                                 |
| Privasi     | Kebijakan privasi sesuai APPI Jepang dalam 3 bahasa, kotak persetujuan di setiap form, data pendaftar dihapus 12 bulan setelah kegiatan (usulan) |

## 4. Analitik & pemantauan

- Vercel Analytics & Speed Insights (tanpa cookie pelacak).

- Event yang dihitung, tanpa data pribadi: install App, aktifkan notifikasi, salin rekening, kirim konfirmasi infaq, daftar kegiatan, buka kajian live.

- Pelacakan error (Sentry, opsional) dan monitor uptime sederhana.

## 5. Pengujian

| Jenis                   | Cakupan                                                                                                              |
|-------------------------|----------------------------------------------------------------------------------------------------------------------|
| Unit (Vitest)           | Perhitungan salat & iqamah, Hijriah, helper i18n, skema Zod, generator skema form dinamis                            |
| RLS                     | Anon tidak bisa membaca data sensitif; batas tiap peran admin                                                        |
| End-to-end (Playwright) | Beranda 3 bahasa, salin rekening + konfirmasi infaq, pendaftaran sampai daftar tunggu, alur admin menerbitkan berita |
| Kualitas                | Lighthouse CI dan axe (aksesibilitas) di setiap pull request                                                         |

## 6. Lingkungan & deploy

| Variabel                                                    | Dipakai untuk                                   |
|-------------------------------------------------------------|-------------------------------------------------|
| `NEXT_PUBLIC_SITE_URL`                                      | URL kanonik, OG, sitemap                        |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Klien Supabase                                  |
| `SUPABASE_SERVICE_ROLE_KEY`                                 | Operasi server tertentu (tidak pernah ke klien) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`         | Web Push                                        |
| `RESEND_API_KEY`                                            | Email notifikasi                                |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`    | Anti-spam form                                  |
| `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`                     | Deteksi kajian live                             |

Alur: lokal dengan `supabase start` → preview otomatis Vercel per branch dengan proyek Supabase staging → produksi dari branch `main`. GitHub Actions menjalankan lint, typecheck, test, build, lalu `supabase db push` untuk migrasi. Domain `.org` paling sederhana; `.jp` mensyaratkan alamat di Jepang.

## 7. Checklist launch

- [ ] Konten inti terisi dalam 3 bahasa dan teks Jepang diperiksa penutur asli

- [ ] Rekening, metode salat, iqamah, dan jadwal Jumat dikonfirmasi tertulis oleh pengurus

- [ ] Akun admin dibuat, MFA aktif untuk super_admin & finance

- [ ] Domain, SSL, Search Console, sitemap terkirim

- [ ] Lighthouse ≥ 90 dan audit PWA lulus di halaman utama

- [ ] Notifikasi adzan dites di Android dan iPhone

- [ ] Kebijakan privasi & ketentuan terbit

- [ ] Pelatihan admin + panduan singkat (PDF/video) diserahkan, beserta kredensial

## 8. Prompt untuk Claude

**Prompt A — fondasi bahasa (jalankan tepat setelah PRD-02):**

```text
Baca docs/prd/00-master.md dan docs/prd/10-bahasa-seo-deploy.md bagian 1.
Tugas: pasang next-intl dengan locale ja, en, id (rute berprefiks), middleware deteksi
Accept-Language + cookie, struktur messages per namespace, helper t(field, locale) dengan
fallback, util format tanggal/angka/mata uang berbasis Intl (zona Asia/Tokyo), komponen
LanguageSwitcher yang mempertahankan path, dan glosarium istilah di messages.
Selesai: halaman contoh tampil benar di ketiga bahasa; build lulus.
```

**Prompt B — SEO, keamanan, testing, deploy (jalankan paling akhir):**

```text
Baca docs/prd/00-master.md dan docs/prd/10-bahasa-seo-deploy.md.
Tugas:
1. Metadata + hreflang + canonical di semua halaman, sitemap.ts dinamis, robots.ts,
   OG image dengan next/og, JSON-LD Mosque/Event/Article/FAQPage/BreadcrumbList.
2. Header keamanan (CSP, HSTS, dll.) di next.config, rate limit form publik, cek upload.
3. Vercel Analytics + event tanpa data pribadi.
4. Test: Vitest (unit), test RLS, Playwright (4 alur di bagian 5), Lighthouse CI + axe.
5. GitHub Actions: lint, typecheck, test, build, supabase db push di main; .env.example lengkap.
6. Tulis docs/HANDOVER.md: cara deploy, cara menambah admin, cara backup, kontak teknis.
Selesai: CI hijau; laporkan skor Lighthouse dan hasil test.
```

---

# PRD-11 · Backlog & Sprint

Pekerjaan dipecah menjadi 34 tiket dalam 10 sprint mingguan (S0–S9) yang mengikuti roadmap di Master PRD; satu tiket kira-kira sama dengan satu sesi prompt di Claude, dan kolom Status bisa diubah langsung di tabel ini untuk melacak progres.

## 1. Backlog

Estimasi dalam hari kerja efektif satu developer dan bersifat perkiraan. Kolom “Butuh” menunjukkan tiket yang harus selesai lebih dulu.

| ID    | Sprint | Tiket                                                                          | PRD | Estimasi (hari) | Butuh               | Status      |
|-------|--------|--------------------------------------------------------------------------------|-----|-----------------|---------------------|-------------|
| T-001 | S0     | Presentasi PRD ke pengurus, catat keputusan                                    | 13  | 1               | —                   | Belum mulai |
| T-002 | S0     | Kumpulkan aset & konten awal dari pengurus                                     | 13  | berjalan        | T-001               | Belum mulai |
| T-003 | S0     | Setup repo, Next.js, Supabase, Vercel, `CLAUDE.md`                             | 00  | 0,5             | —                   | Belum mulai |
| T-010 | S1     | Design system + halaman `/dev/ui`                                              | 01  | 2               | T-003               | Belum mulai |
| T-011 | S1     | Migrasi database, RLS, storage, seed, test RLS                                 | 02  | 2               | T-003               | Belum mulai |
| T-012 | S1     | Fondasi tiga bahasa (Prompt A)                                                 | 10  | 1               | T-003               | Belum mulai |
| T-013 | S1     | Login admin, guard peran, layout panel, kerangka Server Action (prompt PRD-12) | 09  | 1               | T-011               | Belum mulai |
| T-020 | S2     | Layout situs: navbar, footer, bar pengumuman, tombol saran                     | 03  | 1               | T-010, T-012        | Belum mulai |
| T-021 | S2     | Modul jadwal salat, Jumat, Hijriah + unit test                                 | 04  | 2               | T-011               | Belum mulai |
| T-022 | S2     | Beranda section 1–9                                                            | 03  | 2               | T-020, T-021        | Belum mulai |
| T-030 | S3     | Beranda section 10–18                                                          | 03  | 2               | T-022               | Belum mulai |
| T-031 | S3     | Halaman about, jumuah, news, gallery, faq, contact, legal                      | 03  | 2               | T-020               | Belum mulai |
| T-032 | S3     | Admin: jadwal & Jumat, berita, galeri, pengaturan situs                        | 09  | 2               | T-013               | Belum mulai |
| T-040 | S4     | Donasi v2: QRIS & Japan Post Bank, nominal unik, donatur tetap, zakat          | 05  | 3               | T-011, T-020        | Belum mulai |
| T-041 | S4     | Halaman transparansi & laporan PDF                                             | 05  | 1               | T-040               | Belum mulai |
| T-042 | S4     | Admin donasi: daftar formulir, program, rekening, laporan PDF                  | 09  | 2               | T-040               | Belum mulai |
| T-043 | S4     | Soft launch web inti                                                           | 10  | 0,5             | T-030, T-031, T-042 | Belum mulai |
| T-050 | S5     | Agenda, kalender, berulang, `.ics`                                             | 06  | 2               | T-020               | Belum mulai |
| T-051 | S5     | Formulir dinamis, daftar tunggu, email konfirmasi                              | 06  | 2               | T-050               | Belum mulai |
| T-052 | S5     | Admin: agenda, form builder, data pendaftar                                    | 09  | 2               | T-051               | Belum mulai |
| T-060 | S6     | Kajian & video + deteksi live YouTube                                          | 06  | 2               | T-020               | Belum mulai |
| T-061 | S6     | App Jamaah: layout, bottom nav, semua layar                                    | 07  | 3               | T-021, T-040        | Belum mulai |
| T-070 | S7     | PWA: manifest, service worker, offline, install                                | 07  | 2               | T-061               | Belum mulai |
| T-071 | S7     | Notifikasi adzan & siaran admin                                                | 07  | 2               | T-070               | Belum mulai |
| T-072 | S7     | Panduan, halal, kamus, FAQ, kotak saran                                        | 08  | 3               | T-020               | Belum mulai |
| T-073 | S7     | Admin: panduan, kotak masuk, push, log aktivitas                               | 09  | 2               | T-072               | Belum mulai |
| T-080 | S8     | SEO, header keamanan, analitik (Prompt B 1–3)                                  | 10  | 2               | T-073               | Belum mulai |
| T-081 | S8     | Test otomatis & CI (Prompt B 4–6)                                              | 10  | 2               | T-080               | Belum mulai |
| T-082 | S8     | Isi konten 3 bahasa + review penutur Jepang                                    | 13  | berjalan        | T-002               | Belum mulai |
| T-083 | S8     | UAT bersama pengurus                                                           | 14  | 2               | T-081               | Belum mulai |
| T-090 | S9     | Perbaikan hasil UAT                                                            | 14  | 2               | T-083               | Belum mulai |
| T-091 | S9     | Domain, produksi, Search Console                                               | 10  | 0,5             | T-090               | Belum mulai |
| T-092 | S9     | Pelatihan admin & serah terima                                                 | 14  | 1               | T-091               | Belum mulai |
| T-093 | S9     | Launch & pengumuman ke jamaah                                                  | 14  | 0,5             | T-092               | Belum mulai |

### 1.1 Tiket tambahan v2

Delapan tiket ini menambah sekitar 14 hari kerja; roadmap tetap 10 minggu bila T-074 (gateway opsional) ditunda ke fase 3.

| ID    | Sprint      | Tiket                                                                     | PRD    | Estimasi (hari) | Butuh | Status      |
|-------|-------------|---------------------------------------------------------------------------|--------|-----------------|-------|-------------|
| T-044 | S4          | Helper format Japan Post Bank, impor mutasi, pencocokan otomatis & manual | 05     | 2               | T-040 | Belum mulai |
| T-045 | S4          | Kuitansi PDF otomatis & antrean `sync_outbox`                             | 05     | 1               | T-044 | Belum mulai |
| T-053 | S5          | Peminjaman ruangan: halaman, kalender, formulir, admin                    | 08, 09 | 2               | T-051 | Belum mulai |
| T-054 | S5          | Program budaya & halaman Mengenal Islam                                   | 08     | 1,5             | T-051 | Belum mulai |
| T-062 | S6          | Baca Al-Qur’an, tasbih digital, kalender Hijriah                          | 03, 07 | 2               | T-061 | Belum mulai |
| T-063 | S6          | Elemen pembeda: busur hari, kartu Masjid hari ini, tema malam otomatis    | 01, 03 | 2               | T-030 | Belum mulai |
| T-064 | S7          | Pencarian global & pengaturan aksesibilitas                               | 03     | 1,5             | T-031 | Belum mulai |
| T-074 | S7 / fase 3 | Gateway otomatis Midtrans & Stripe (bila disetujui)                       | 05     | 2               | T-044 | Belum mulai |

## 2. Aturan kerja

- Satu tiket = satu branch (`feat/T-021-jadwal-salat`) = satu pull request; preview Vercel dipakai untuk review.

- Tiket boleh dipindah sprint, tetapi urutan “Butuh” tidak boleh dilanggar.

- Setiap akhir sprint: demo singkat ke pengurus lewat tautan preview, lalu kumpulkan masukan sebagai tiket baru.

## 3. Definition of Done

- [ ] Acceptance criteria di PRD modul terkait terpenuhi

- [ ] Lint, typecheck, test, dan build lulus di CI

- [ ] Tampil benar di lebar 360 px dan 1440 px, mode terang dan gelap

- [ ] Semua teks UI tersedia dalam ja, en, id

- [ ] Tidak ada emoji; ikon hanya Lucide

- [ ] Data sensitif dilindungi RLS dan sudah diuji

- [ ] Status tiket di tabel ini diubah menjadi Selesai

## 4. Prompt untuk Claude: setup awal (T-003)

```text
Kamu adalah senior full-stack engineer. Proyek: website + App Jamaah (PWA) + panel admin untuk
Masjid Al-Muttaqin, Matsudo, Chiba. Baca semua file di docs/prd/ untuk gambaran, tetapi kerjakan
hanya tugas ini.

Tugas setup awal:
1. Pastikan proyek Next.js (App Router, TypeScript strict, Tailwind v4, src/) berjalan.
2. Pasang dependensi inti: @supabase/supabase-js, @supabase/ssr, next-intl, zod,
   react-hook-form, @hookform/resolvers, lucide-react, motion, embla-carousel-react, adhan,
   @serwist/next, clsx, tailwind-merge; inisialisasi shadcn/ui.
3. Buat struktur folder persis seperti bagian 6.2 docs/prd/00-master.md (folder kosong + README).
4. Inisialisasi Supabase lokal (supabase init) dan buat .env.example berisi semua variabel di
   docs/prd/10-bahasa-seo-deploy.md bagian 6.
5. Tambahkan skrip npm: dev, build, lint, typecheck, test, test:e2e.
6. Siapkan GitHub Actions dasar: lint + typecheck + build.

Aturan: ikuti CLAUDE.md. Jangan membuat fitur apa pun dulu.
Selesai: npm run build lulus; tampilkan pohon folder dan daftar dependensi.
```

---

# PRD-12 · Kontrak Server Action & API

Semua perubahan data lewat Server Action dengan satu bentuk hasil yang sama, dan semua file non-HTML lewat route handler; kontrak ini menjaga agar kode yang dihasilkan Claude di sesi berbeda tetap saling cocok.

## 1. Konvensi

- Lokasi: `src/lib/actions/<modul>.ts`, satu file per modul; semua diawali `"use server"`.

- Setiap action dibungkus helper `createAction({ schema, roles, rateLimit, revalidate }, handler)` yang otomatis: validasi Zod, cek sesi & peran, rate limit, menulis `activity_logs` (khusus admin), lalu `revalidateTag`.

- Bentuk hasil seragam:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ActionErrorCode; message: string; fieldErrors?: Record<string, string> } };

type ActionErrorCode =
  | 'VALIDATION' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'RATE_LIMITED'
  | 'NOT_FOUND' | 'CONFLICT' | 'CAPTCHA_FAILED' | 'INTERNAL';
```

- `message` berisi kunci terjemahan (mis. `errors.rateLimited`), bukan kalimat jadi, agar tampil di bahasa pengguna.

- Nomor referensi untuk publik berformat `AM-<jenis>-<6 karakter>`, mis. `AM-INF-7K2Q9X`.

## 2. Action publik

| Action                           | Input utama                                                                                                                             | Output                                     | Batas    | Efek samping                          |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|----------|---------------------------------------|
| `submitDonationConfirmation`     | programId, amount, currency, transferDate, accountId, donorName?, isAnonymous, contact, intentionFor?, message?, proof?, turnstileToken | referenceCode                              | 5/jam/IP | Email ke peran finance                |
| `submitRecurringDonor`           | data diri, amount, currency, method, payDayRange, showName, consent, turnstileToken                                                     | referenceCode                              | 3/jam/IP | Email ke peran finance                |
| `submitRegistration`             | eventId, data (sesuai `forms.schema`), turnstileToken                                                                                   | referenceCode, status (confirmed/waitlist) | 5/jam/IP | Email konfirmasi; revalidate `events` |
| `cancelRegistration`             | token                                                                                                                                   | status                                     | —        | Promosi daftar tunggu teratas         |
| `submitMessage`                  | category, body, name?, contact?, photo?, turnstileToken                                                                                 | referenceCode                              | 5/jam/IP | Email ke editor sesuai kategori       |
| `suggestPlace`                   | name, type, address, url?, note?                                                                                                        | ok                                         | 3/jam/IP | Masuk antrean persetujuan             |
| `upsert_push_subscription` (RPC) | endpoint, keys, locale, prefs                                                                                                           | id                                         | —        | —                                     |
| `updatePushPreferences`          | endpoint, prefs                                                                                                                         | ok                                         | —        | —                                     |
| `unsubscribePush`                | endpoint                                                                                                                                | ok                                         | —        | —                                     |

## 3. Action admin

| Modul      | Action                                                                                                                            | Peran          | Revalidate tag         |
|------------|-----------------------------------------------------------------------------------------------------------------------------------|----------------|------------------------|
| Jadwal     | `savePrayerSettings`, `upsertPrayerOverride`, `deletePrayerOverride`                                                              | editor         | `prayer`               |
| Jumat      | `upsertJumuah`, `deleteJumuah`                                                                                                    | editor         | `jumuah`               |
| Konten     | `upsertPost`, `publishPost`, `archivePost`                                                                                        | editor         | `posts`                |
| Kajian     | `upsertLecture`, `setLectureLive`                                                                                                 | editor         | `lectures`             |
| Agenda     | `upsertEvent`, `archiveEvent`, `upsertForm`                                                                                       | editor         | `events`, `forms`      |
| Pendaftar  | `updateRegistrationStatus`                                                                                                        | editor         | `events`               |
| Infaq      | `verifyDonation`, `rejectDonation`, `upsertProgram`, `upsertBankAccount`                                                          | finance        | `donations`            |
| Keuangan   | `upsertFinanceEntry`, `publishFinanceReport`                                                                                      | finance        | `finance`              |
| Panduan    | `upsertGuide`, `upsertFaq`, `upsertDictionaryEntry`, `upsertHaramIngredient`, `upsertPlace`, `approvePlace`, `upsertDailyContent` | editor         | `guides`               |
| Layanan    | `updateMessageStatus` (status, assignee, note)                                                                                    | editor         | —                      |
| Notifikasi | `createPushCampaign`, `sendPushCampaign`                                                                                          | editor         | —                      |
| Galeri     | `upsertGalleryItem`, `upsertTestimonial`                                                                                          | editor         | `gallery`              |
| Sistem     | `updateSiteSettings`                                                                                                              | super_admin    | `site` (semua halaman) |
| Pengguna   | `inviteAdmin`, `updateUserRole`, `deactivateUser`                                                                                 | super_admin    | —                      |
| Ekspor     | `exportCsv(entity, filters)`                                                                                                      | sesuai entitas | —                      |

Semua action `upsert*` menerima objek dengan field i18n berbentuk `{ ja, en, id }` dan mengembalikan baris yang tersimpan.

## 4. Route handler & fungsi terjadwal

| Endpoint                                       | Metode | Hasil                              | Akses           |
|------------------------------------------------|--------|------------------------------------|-----------------|
| `/api/calendar.ics?type=prayer|events&locale=` | GET    | `text/calendar` untuk di-subscribe | Publik          |
| `/[locale]/prayer-times/pdf?month=YYYY-MM`     | GET    | PDF jadwal bulanan / imsakiyah     | Publik          |
| `/api/finance/report/[period]`                 | GET    | PDF laporan yang sudah terbit      | Publik          |
| `/api/revalidate`                              | POST   | Revalidate tag dari Edge Function  | Rahasia bersama |
| `opengraph-image.tsx` per rute                 | GET    | Gambar OG otomatis                 | Publik          |

| Edge Function              | Jadwal                                | Tugas                                                  |
|----------------------------|---------------------------------------|--------------------------------------------------------|
| `send-prayer-push`         | Tiap menit                            | Kirim notifikasi adzan sesuai preferensi               |
| `check-youtube-live`       | Tiap 3 menit, hanya di jendela kajian | Perbarui `lectures.is_live`, panggil `/api/revalidate` |
| `send-scheduled-campaigns` | Tiap 5 menit                          | Kirim siaran push yang terjadwal                       |
| `cleanup-personal-data`    | Harian                                | Hapus data pendaftar & pesan melewati masa simpan      |

## 4A. Tambahan v2

`submitDonationConfirmation` digantikan `createDonationIntent`; action lain di bawah melengkapi modul donasi v2, peminjaman ruangan, dan program budaya.

| Action / endpoint             | Input utama                                                                                                                              | Output                                        | Akses                                                    | Efek samping                                                          |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|----------------------------------------------------------|-----------------------------------------------------------------------|
| `createDonationIntent`        | programId, currency, amount, channel, donorName?, isAnonymous, contact, email?, intentionFor?, message?, kanaName? (Yen), turnstileToken | referenceCode, uniqueAmount?, instruksi bayar | Publik, 5/jam/IP                                         | Status `pending`; kedaluwarsa 7 hari                                  |
| `importStatement`             | source (`qris_report` / `yucho_csv`), file                                                                                               | importId, jumlah baris, jumlah cocok otomatis | `donasi`                                                 | Menolak file ganda (hash), menjalankan pencocokan                     |
| `matchStatementLine`          | lineId, confirmationId                                                                                                                   | ok                                            | `donasi`                                                 | Status `matched`, kuitansi PDF, `sync_outbox`, revalidate `donations` |
| `markDonationStatus`          | confirmationId, status (`rejected` / `expired`), note                                                                                    | ok                                            | `donasi`                                                 | Tercatat di log aktivitas                                             |
| `submitRoomBooking`           | roomId, startsAt, endsAt, purpose, attendees, organizerName, contact, agree, turnstileToken                                              | referenceCode                                 | Publik, 3/jam/IP                                         | Cek bentrok & blok waktu salat; email konfirmasi                      |
| `decideRoomBooking`           | bookingId, decision (`approved` / `declined`), note                                                                                      | ok                                            | `editor`                                                 | Email ke pemohon, `.ics` bila disetujui, revalidate `rooms`           |
| `upsertRoom`, `upsertProgram` | data ruangan / program (i18n)                                                                                                            | baris tersimpan                               | `editor`                                                 | Revalidate `rooms` / `programs`                                       |
| `POST /api/webhooks/midtrans` | notifikasi Midtrans                                                                                                                      | 200                                           | Tanda tangan valid, hanya bila `PAYMENT_GATEWAY_ENABLED` | `payment_events` idempoten, status `paid`                             |
| `POST /api/webhooks/stripe`   | event Stripe                                                                                                                             | 200                                           | Signature Stripe valid, hanya bila flag aktif            | Sama seperti di atas                                                  |
| `GET /api/sync/outbox`        | token rahasia                                                                                                                            | daftar entri belum terkirim                   | Hanya web internal (nanti)                               | Menandai entri terkirim                                               |

Tag cache baru: `rooms`, `programs`, `search`.

## 5. Contoh skema

```ts
export const donationConfirmationSchema = z.object({
  programId: z.string().uuid(),
  amount: z.coerce.number().positive().max(100_000_000),
  currency: z.enum(['JPY', 'IDR']),
  transferDate: z.coerce.date().max(new Date()),
  accountId: z.string().uuid(),
  isAnonymous: z.boolean(),
  donorName: z.string().trim().max(100).optional(),
  contact: z.string().trim().min(5).max(100),
  intentionFor: z.string().trim().max(100).optional(),
  message: z.string().trim().max(500).optional(),
  turnstileToken: z.string().min(1),
}).refine((v) => v.isAnonymous || !!v.donorName, { path: ['donorName'] });
```

## 6. Acceptance criteria

- [ ] Semua action memakai `createAction` dan mengembalikan `ActionResult`

- [ ] Tidak ada action admin yang bisa dipanggil tanpa peran yang sesuai (diuji)

- [ ] Setiap action yang mengubah konten publik memanggil tag yang tertera di tabel

- [ ] Pesan error tampil dalam bahasa pengguna

## 7. Prompt untuk Claude

```text
Baca docs/prd/00-master.md, 02-database.md, dan 12-kontrak-action-api.md.
Tugas (jalankan setelah database siap, sebelum modul fitur):
1. Buat src/lib/actions/core.ts berisi tipe ActionResult, ActionErrorCode, helper createAction
   (validasi Zod, cek sesi & peran, rate limit, verifikasi Turnstile, activity_logs, revalidateTag),
   dan generator nomor referensi.
2. Buat src/lib/cache-tags.ts berisi daftar tag resmi.
3. Buat kerangka file action per modul sesuai tabel bagian 2 dan 3 (tanda tangan fungsi + skema
   Zod + TODO), supaya prompt modul berikutnya tinggal mengisi isinya.
4. Buat route handler /api/revalidate dengan rahasia bersama.
5. Tulis unit test untuk createAction (validasi gagal, peran salah, rate limit).
Selesai: test & build lulus.
```

---

# PRD-13 · Konten & Keputusan Pengurus

Pembangunan bisa dimulai tanpa menunggu semua konten, tetapi 14 keputusan dan 16 aset di bawah harus datang dari pengurus sebelum launch; tab ini dipakai sebagai daftar periksa bersama saat rapat dan sesudahnya.

## 1. Keputusan dari pengurus

| ID   | Keputusan                                                  | Usulan awal                                                                | Dipakai di | Status        |
|------|------------------------------------------------------------|----------------------------------------------------------------------------|------------|---------------|
| K-01 | Metode hitung waktu salat                                  | Muslim World League, atau mengikuti jadwal acuan yang sudah dipakai jamaah | PRD-04     | Belum dibahas |
| K-02 | Jam iqamah tiap salat, jam & bahasa khutbah Jumat          | Iqamah berupa selisih menit, disesuaikan musim                             | PRD-04     | Belum dibahas |
| K-03 | Bahasa default saat pertama dibuka                         | Jepang, dengan deteksi otomatis bahasa browser                             | PRD-10     | Belum dibahas |
| K-04 | Nama domain & pemilik akunnya                              | Domain `.org`, didaftarkan atas nama masjid                                | PRD-10     | Belum dibahas |
| K-05 | Rekening resmi yang ditampilkan (Jepang & Indonesia)       | Maksimal satu rekening per negara                                          | PRD-05     | Belum dibahas |
| K-06 | Apakah kanal donasi mitra (Dompet Dhuafa) ikut ditampilkan | Ditampilkan sebagai opsi tambahan                                          | PRD-05     | Belum dibahas |
| K-07 | Program donasi aktif & targetnya                           | Infaq Operasional sebagai program default                                  | PRD-05     | Belum dibahas |
| K-08 | Admin pertama dan perannya                                 | 1 super_admin, 1 editor, 1 finance                                         | PRD-09     | Belum dibahas |
| K-09 | Penerima email notifikasi (infaq, pendaftaran, pesan)      | Alamat email bersama milik masjid                                          | PRD-12     | Belum dibahas |
| K-10 | Kanal resmi (YouTube, Instagram, grup jamaah)              | Memakai akun yang sudah ada                                                | PRD-06     | Belum dibahas |
| K-11 | Nama donatur boleh tampil publik?                          | Hanya bila donatur mengizinkan                                             | PRD-05     | Belum dibahas |
| K-12 | Masa simpan data pribadi                                   | 12 bulan setelah kegiatan                                                  | PRD-10     | Belum dibahas |
| K-13 | Penanggung jawab terjemahan & review bahasa Jepang         | Relawan penutur Jepang dari jamaah                                         | PRD-13     | Belum dibahas |
| K-14 | Siapa menanggung biaya domain & layanan                    | Kas masjid atau donatur khusus                                             | PRD-14     | Belum dibahas |

**Status per 2 November 2026.** Sudah diputuskan direktur: nama Al Muttaqin Cultural Center, domain `almuttaqinculturalcenter.org` (K-04), tiga bahasa, donasi Rupiah lewat QRIS dan Yen lewat Japan Post Bank (K-05), serta pemisahan web internal. Masih terbuka: metode salat dan iqamah (K-01, K-02), bahasa default (K-03), kanal mitra (K-06), program donasi aktif (K-07), admin web publik (K-08), penerima email (K-09), kanal resmi (K-10), tampilan nama donatur (K-11), masa simpan data (K-12), penanggung jawab terjemahan (K-13), dan biaya (K-14); ditambah dua pertanyaan baru: bank dan kategori QRIS, serta nama pemilik rekening Japan Post Bank. Ubah kolom Status di tabel saat keputusan diambil.

## 2. Konten & aset yang diminta

| No  | Item                                               | Format                      | Dipakai di                | Status    |
|-----|----------------------------------------------------|-----------------------------|---------------------------|-----------|
| 1   | Logo resmi                                         | SVG atau PNG transparan     | Navbar, favicon, ikon App | Belum ada |
| 2   | Nama resmi & alamat lengkap                        | Teks Jepang + Latin         | Footer, kontak, SEO       | Belum ada |
| 3   | Koordinat & jam buka masjid                        | Teks                        | Jadwal salat, peta        | Belum ada |
| 4   | Nama badan hukum/yayasan                           | Teks Jepang + Latin         | Footer, legal             | Belum ada |
| 5   | Sejarah singkat & visi-misi                        | 150–300 kata                | Tentang                   | Belum ada |
| 6   | Struktur pengurus + foto                           | Teks + JPG                  | Tentang                   | Belum ada |
| 7   | Logo mitra                                         | SVG/PNG                     | Strip mitra               | Belum ada |
| 8   | Foto masjid & kegiatan (minimal 15)                | JPG, sisi panjang ≥ 1600 px | Hero, galeri, cover       | Belum ada |
| 9   | Jam iqamah & petugas Jumat 4 pekan ke depan        | Tabel                       | Jadwal, Jumat             | Belum ada |
| 10  | Jadwal kajian, TPA, kelas muallaf                  | Tabel                       | Agenda                    | Belum ada |
| 11  | Rekening resmi Jepang & Indonesia                  | Teks                        | Infaq                     | Belum ada |
| 12  | Program donasi aktif & target                      | Teks                        | Infaq                     | Belum ada |
| 13  | Laporan keuangan terakhir                          | PDF atau Excel              | Transparansi              | Belum ada |
| 14  | Akses stasiun & tempat halal sekitar               | Teks + tautan peta          | Panduan, radar halal      | Belum ada |
| 15  | 10 pertanyaan yang paling sering diterima pengurus | Teks                        | FAQ                       | Belum ada |
| 16  | Akun YouTube, Instagram, grup jamaah               | Tautan                      | Kajian, footer            | Belum ada |

Teks cukup dikirim dalam satu bahasa (Indonesia atau Jepang); terjemahan dikerjakan bertahap dan diperiksa penanggung jawab K-13.

## 3. Agenda rapat presentasi (60 menit)

1.  Pembukaan, tujuan proyek, dan apa yang sudah disiapkan (5 menit).

2.  Pelajaran dari web As-Sunnah Hekinan dan As-Sholihin Yokohama (5 menit).

3.  Demo konsep: sitemap, wireframe beranda, wireframe App Jamaah (15 menit).

4.  Daftar fitur dan roadmap 10 minggu (10 menit).

5.  Membahas keputusan K-01 sampai K-14 (15 menit).

6.  Pembagian aset, penanggung jawab, dan jadwal demo tiap akhir sprint (10 menit).

## 4. Templat pesan permintaan aset

```text
Assalamu'alaikum warahmatullahi wabarakatuh.

Terima kasih atas waktunya di rapat kemarin. Untuk mulai mengisi website & App Jamaah
Masjid Al-Muttaqin, mohon bantuan mengirimkan bahan berikut:

1. Logo masjid (file asli/PNG transparan)
2. Alamat lengkap, jam buka, dan nama badan hukum masjid
3. Sejarah singkat dan visi-misi
4. Foto masjid dan kegiatan (minimal 15 foto)
5. Jam iqamah dan petugas Jumat 4 pekan ke depan
6. Jadwal kajian, TPA, dan kelas muallaf
7. Rekening resmi untuk infaq (Jepang dan Indonesia)
8. Pertanyaan yang paling sering ditanyakan jamaah

Bahan boleh dikirim bertahap. Jazakumullahu khairan.
```

---

# PRD-14 · UAT, Serah Terima & Biaya

Produk dianggap siap launch setelah pengurus sendiri menjalankan 14 skenario UAT di bawah dengan hasil lulus, menerima pelatihan dan seluruh akun, serta menyetujui biaya bulanan; estimasi biaya produksi yang disarankan sekitar US\$46 per bulan, atau mendekati nol dengan paket gratis beserta risikonya.

## 1. Skenario UAT

Dijalankan pengurus di HP masing-masing memakai data demo, sebaiknya di sprint S8.

| ID   | Peran        | Skenario                                        | Hasil yang diharapkan                                    | Hasil       |
|------|--------------|-------------------------------------------------|----------------------------------------------------------|-------------|
| U-01 | Jamaah       | Buka beranda di HP dalam bahasa JP, EN, ID      | Salat berikutnya & hitung mundur sesuai jadwal acuan     | Belum diuji |
| U-02 | Jamaah       | Install App Jamaah di Android dan iPhone        | Ikon muncul di layar utama, App terbuka layar penuh      | Belum diuji |
| U-03 | Jamaah       | Aktifkan pengingat Asar                         | Notifikasi tiba tepat waktu dalam bahasa yang dipilih    | Belum diuji |
| U-04 | Jamaah       | Mode pesawat, buka jadwal, doa, kamus           | Semua tetap tampil                                       | Belum diuji |
| U-05 | Donatur      | Salin rekening Jepang, kirim konfirmasi + bukti | Nomor referensi tampil, email masuk ke pengurus keuangan | Belum diuji |
| U-06 | Keuangan     | Verifikasi konfirmasi dari U-05                 | Progres program bertambah, laporan bulanan ikut terbarui | Belum diuji |
| U-07 | Peserta      | Daftar dauroh sampai kuota penuh                | Pendaftar berikutnya otomatis masuk daftar tunggu        | Belum diuji |
| U-08 | Editor       | Terbitkan pengumuman 3 bahasa                   | Tampil di web & App dalam \< 1 menit                     | Belum diuji |
| U-09 | Editor       | Ubah iqamah Isya dan petugas Jumat              | Web & App langsung menampilkan data baru                 | Belum diuji |
| U-10 | Editor       | Tandai kajian sedang live                       | Banner live muncul di beranda & App                      | Belum diuji |
| U-11 | Jamaah       | Lapor fasilitas secara anonim + foto            | Masuk kotak masuk admin tanpa nama pelapor               | Belum diuji |
| U-12 | Super admin  | Undang admin baru berperan editor               | Editor tidak bisa membuka menu keuangan                  | Belum diuji |
| U-13 | Warga Jepang | Tempel teks komposisi di Cek label              | Istilah haram & syubhat tersorot                         | Belum diuji |
| U-14 | Semua        | Ganti bahasa di halaman mana pun                | Tetap di halaman yang sama, teks berganti                | Belum diuji |

Skenario yang gagal menjadi tiket perbaikan di sprint S9 (T-090).

## 2. Pelatihan & serah terima

- **Sesi 1 (60 menit, editor):** berita & pengumuman, jadwal & Jumat, agenda & formulir, kotak masuk, notifikasi push.

- **Sesi 2 (60 menit, keuangan & super admin):** verifikasi infaq, catatan keuangan, laporan bulanan, pengguna & peran, pengaturan situs.

- **Materi:** panduan PDF bergambar per tugas dan rekaman layar singkat untuk tugas yang paling sering.

<!-- -->

- [ ] Semua akun layanan (registrar domain, Vercel, Supabase, Resend, Cloudflare Turnstile, Google Search Console, kunci YouTube API) memakai email resmi masjid

- [ ] Repo GitHub dipindah ke organisasi milik masjid; developer menjadi kolaborator

- [ ] Kredensial disimpan di pengelola kata sandi bersama, bukan di chat

- [ ] `docs/HANDOVER.md` diserahkan: cara deploy, menambah admin, backup, kontak teknis

- [ ] Berita acara serah terima ditandatangani pengurus

## 3. Perawatan setelah launch (usulan)

| Hal             | Usulan                                                                                |
|-----------------|---------------------------------------------------------------------------------------|
| Masa garansi    | 30 hari perbaikan bug tanpa biaya setelah launch                                      |
| Saluran laporan | Kategori “Kendala website/App” di kotak saran (masuk ke admin teknis)                 |
| Waktu respons   | Kritis (web tidak bisa dibuka, jadwal salat salah) dalam 24 jam; lainnya dalam 7 hari |
| Rutin bulanan   | Pembaruan dependensi, cek backup, cek kuota layanan, cek skor Lighthouse              |
| Rutin tahunan   | Perpanjang domain, tinjau kebijakan privasi, hapus data lewat masa simpan             |

## 4. Estimasi biaya bulanan

Harga dalam USD per Oct 30, 2026 dan bisa berubah; konfirmasi di halaman harga resmi sebelum memutuskan.

| Layanan                                                | Paket gratis    | Produksi disarankan           | Catatan                                                                                                                                                                                                                    |
|--------------------------------------------------------|-----------------|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Hosting (Vercel)                                       | \$0, Hobby      | \$20, Pro (1 kursi developer) | Hobby dibatasi untuk penggunaan pribadi non-komersial, sehingga situs resmi organisasi lebih aman di Pro ([Vercel](https://vercel.com/docs/plans/hobby))                                                                   |
| Database & backend (Supabase)                          | \$0, Free       | \$25, Pro                     | Free berhenti sementara (pause) setelah 7 hari tanpa aktivitas dan dibatasi 500 MB database; Pro menghapus pause ([ringkasan harga](https://www.activepieces.com/blog/supabase-pricing-free-tier-limits-pro-costs-egress)) |
| Email (Resend)                                         | \$0, Free       | \$0, Free                     | Free mencakup 3.000 email per bulan, maksimal 100 per hari — cukup untuk notifikasi pengurus ([Resend](https://resend.com/docs/knowledge-base/what-is-resend-pricing))                                                     |
| Anti-spam (Turnstile), YouTube Data API, OpenStreetMap | \$0             | \$0                           | Dalam batas pemakaian gratis                                                                                                                                                                                               |
| Domain                                                 | sekitar \$1     | sekitar \$1                   | Perkiraan \$10–20 per tahun, tergantung registrar & ekstensi                                                                                                                                                               |
| **Total**                                              | **sekitar \$1** | **sekitar \$46**              | Dibayar dalam USD; kurs mengikuti kartu yang dipakai                                                                                                                                                                       |

Jalan tengah yang realistis: kembangkan dan uji dengan paket gratis, lalu naik ke Supabase Pro (backup & tanpa pause) dan Vercel Pro saat launch; keputusan siapa yang menanggung biaya ada di K-14.

Catatan v2: angka di atas hanya untuk web publik. Web internal nanti menambah satu proyek Supabase (sekitar US\$10/bulan) dan satu proyek Vercel; jalur donasi otomatis tidak menambah biaya bulanan, hanya potongan per transaksi seperti di PRD-05.

## 5. Prompt untuk Claude: data demo UAT

```text
Baca docs/prd/00-master.md, 02-database.md, dan 14-uat-serah-terima.md.
Tugas: siapkan lingkungan UAT.
1. Buat supabase/seed-uat.sql berisi data demo realistis dalam ja, en, id: 6 berita, 4 agenda
   (1 dengan kuota 3 untuk menguji daftar tunggu), 3 video kajian, 2 program infaq, 2 rekening
   contoh bertanda DEMO, 20 entri kamus, 10 FAQ, 5 tempat halal.
2. Buat skrip untuk membuat 3 akun uji (super_admin, editor, finance) dari variabel lingkungan.
3. Tambahkan banner "Lingkungan uji" yang hanya tampil bila NEXT_PUBLIC_ENV=uat.
4. Tulis docs/UAT.md berisi 14 skenario di PRD-14 bagian 1 sebagai daftar periksa langkah demi
   langkah dalam bahasa Indonesia.
Selesai: seed bisa dijalankan ulang tanpa duplikasi; build lulus.
```

---

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
