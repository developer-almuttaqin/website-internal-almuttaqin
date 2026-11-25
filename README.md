# Web Internal Pengurus — Al Muttaqin Cultural Center

Aplikasi internal pengurus (`pengurus-acc.online`) untuk Al Muttaqin Cultural Center, Matsudo, Chiba:
kas dua mata uang, persetujuan pengeluaran oleh direktur, donasi dan pencocokan mutasi, tagihan rutin,
anggaran, donatur tetap, inventaris, data jamaah dan muallaf, absensi TPA, peminjaman ruangan,
surat otomatis, laporan bulanan, dan log aktivitas. Antarmuka tiga bahasa (Indonesia, Inggris, Jepang),
responsif di HP, tablet, dan laptop, dengan mode terang dan gelap.

Rancangan yang disetujui direktur ada di [`sistem-internal-donasi.md`](sistem-internal-donasi.md).
PRD web publik (aplikasi terpisah) tetap disimpan sebagai rujukan desain: [`PRD-LENGKAP.md`](PRD-LENGKAP.md),
[`15-prompt-pack.md`](15-prompt-pack.md), dan [`docs/referensi/README-paket-prd-web-publik.md`](docs/referensi/README-paket-prd-web-publik.md).

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Tanpa variabel Supabase, aplikasi berjalan dalam **mode demo**: halaman login
menampilkan tujuh akun contoh (satu per peran), data contoh tersimpan di folder `.data/`
(hapus folder itu untuk mengulang dari data awal), dan menu Web Publik memakai data contoh tiruan web publik.

## Dua database

Web internal memakai **dua proyek Supabase** yang sengaja dipisah (beda organisasi, beda kuota):

| Database | Isi | Variabel |
| --- | --- | --- |
| Internal | Kas, pengajuan, tagihan, anggaran, donasi dan mutasi, jamaah, muallaf, TPA, inventaris, ruangan, surat, log, akun pengurus | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Web publik | Jadwal Jumat, pengumuman, agenda, rekening dan program donasi, laporan transparansi, info masjid, formulir jamaah | `PUBLIC_WEB_SUPABASE_URL`, `PUBLIC_WEB_SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_WEB_URL`, `PUBLIC_WEB_REVALIDATE_SECRET` |

Aturannya: **satu data, satu tempat**. Yang dilihat jamaah disimpan di database web publik dan diisi dari
menu Web Publik di sini, jadi tidak ada yang diketik dua kali. Data internal tidak pernah disalin ke sana.

| Informasi | Alurnya |
| --- | --- |
| Jadwal Jumat, pengumuman, agenda, rekening, program donasi, info masjid | Diisi di `/web/...`, langsung tersimpan di database web publik |
| Kegiatan internal | Dicatat di `/kegiatan`; tombol "Tampilkan di web publik" membuat agenda publik tanpa mengetik ulang |
| Peminjaman ruangan dari jamaah | Ditarik otomatis ke `/ruangan`, disetujui direktur, keputusannya dikirim balik ke web publik |
| Konfirmasi donasi dan pendaftar donatur tetap | Ditarik otomatis ke `/donasi` dan `/donatur`; donasi baru menjadi pemasukan setelah cocok dengan mutasi, lalu statusnya dikirim balik |
| Pendaftaran program, saran, pesan kontak | Dibaca dan ditangani di `/web/kotak-masuk`; pendaftar TPA bisa dijadikan peserta, saran fasilitas dijadikan laporan kerusakan |
| Laporan transparansi | Diterbitkan dari `/laporan` (ringkasan kas Yen per kategori; rincian transaksi tetap internal) |

Kode jembatannya ada di `src/lib/publicweb/` (`store.ts` koneksi, `sections.ts` bagian yang bisa diubah,
`sync.ts` penarikan formulir, `content.ts` bentuk konten) dan `src/lib/actions/publicweb.ts`.
Tanpa `PUBLIC_WEB_REVALIDATE_SECRET` (sama dengan `REVALIDATE_SECRET` di web publik) perubahan tetap
tersimpan, tetapi baru tampil setelah cache web publik kedaluwarsa (paling lama satu jam).
Bila kunci web publik dikosongkan, menu Web Publik menampilkan petunjuk penyambungan dan modul lain tetap berjalan.

## Memakai Supabase (database asli)

1. Buat proyek Supabase khusus web internal (terpisah dari web publik).
2. Jalankan `supabase/setup-all.sql` sekali di SQL Editor (skema, RLS, data awal). Berkas itu dibuat dari
   `supabase/migrations/*` dan `supabase/seed.sql` dengan `npm run db:sql`.
3. Salin `.env.example` menjadi `.env.local` dan isi nilainya, termasuk `SETUP_CODE` (minimal 12 karakter acak).
4. Buka aplikasi: selama belum ada pengurus, aplikasi mengarahkan ke `/setup` untuk membuat akun direktur
   (memakai `SETUP_CODE`). Akun pengurus lain ditambahkan direktur dari menu Pengguna; setiap pengurus
   bisa mengganti kata sandinya sendiri di menu Akun saya.

Migration diuji terhadap Postgres sungguhan lewat PGlite (`tests/migration.test.ts`): skema terpasang,
semua tabel memakai RLS, dan aturan peran utama (hanya direktur menyetujui, bendahara membayar,
pembimbing hanya melihat dampingannya, pengunjung tanpa sesi tidak bisa membaca apa pun).

## Tujuh peran

| Peran | Akses utama |
| --- | --- |
| Direktur | Melihat semua data; satu-satunya yang menyetujui pengeluaran dan peminjaman ruangan |
| Bendahara | Kas, impor Excel, donasi, tagihan, anggaran, donatur, laporan; membayar tetapi tidak bisa menyetujui |
| Sekretaris | Jamaah, muallaf, surat otomatis, kegiatan, peminjaman ruangan |
| Koordinator ibadah | Kegiatan dan petugas |
| Koordinator pendidikan & TPA | Peserta dan absensi TPA, kegiatan |
| Koordinator fasilitas & inventaris | Inventaris, laporan kerusakan, konfirmasi jadwal ruangan |
| Pembimbing muallaf | Hanya muallaf dampingannya |

Semua peran bisa mengajukan pengeluaran dan melaporkan kerusakan. Hak akses didefinisikan di
`src/lib/permissions.ts` dan dicerminkan oleh RLS di migration.

## Struktur

```text
src/app/(app)/           halaman setelah login (dashboard, modul generik [resource], kas/impor, donasi, tpa, surat, laporan, log, pengguna, akun-saya)
src/app/(app)/web/       web publik: ringkasan, bagian generik [bagian], kotak-masuk
src/app/setup/           pembuatan akun direktur pertama
src/app/api/             files (bukti), export (CSV), intake (data dari web publik)
src/components/          komponen UI, formulir dan daftar generik
src/lib/resources.ts     definisi kolom tiap modul (satu sumber untuk formulir, daftar, validasi, ekspor)
src/lib/actions/         Server Action: createAction (Zod + peran + rate limit + log aktivitas)
src/lib/logic/           fungsi murni: kas, impor, pencocokan donasi, ruangan, surat
src/lib/db/              akses data internal: mode demo (file lokal) atau Supabase
src/lib/publicweb/       database kedua (web publik): koneksi, bagian, sinkron, bentuk konten
src/lib/mosque.ts        identitas masjid (sama dengan web publik) untuk kop surat dan halaman masuk
messages/{id,en,ja}.json semua teks antarmuka
supabase/                migration + RLS + seed + setup-all.sql (gabungan, untuk SQL Editor)
public/images/brand/     logo resmi (disalin dari web publik)
tests/                   unit test (Vitest)
```

## Tampilan

Tampilan mengikuti web publik (DESIGN GUIDELINES - ACC): latar cream, maroon untuk judul dan tombol, coklat
tua untuk teks, emas sebagai aksen di area gelap, hero maroon berpola bintang, dan logo kubah tiga.
Semua warna adalah token di `src/app/globals.css`; komponen tidak memakai hex.

## Jalur cadangan: /api/intake

Formulir web publik ditarik langsung dari databasenya (lihat Dua database). Endpoint berikut tetap ada
untuk sistem lain yang ingin mengirim data langsung:

```text
POST /api/intake/donations       { amount, currency, channel, donor_name?, kana_name?, contact?, program?, reference_code? }
POST /api/intake/room-bookings   { room_id, purpose, organizer_name, starts_at, ends_at, contact?, attendees? }
Authorization: Bearer <INTAKE_TOKEN>
```

## Pemeriksaan

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

## Belum dikerjakan

- Verifikasi dua langkah (TOTP) untuk direktur dan bendahara: aktifkan MFA di Supabase Auth, layar pendaftarannya belum dibuat.
- Unggah gambar ke web publik (foto galeri, QRIS, sampul agenda) masih lewat panel admin web publik.
- Notifikasi dan ringkasan harian untuk direktur, label QR inventaris, sertifikat syahadah PDF, kurs untuk laporan gabungan.
- Fitur Tahap 2: zakat dan bantuan sosial, relawan, kepanitiaan Ramadan dan kurban, arsip nikah dan jenazah, notulen rapat.
- Format impor mutasi masih menebak kolom dari judulnya; sesuaikan setelah bendahara mengirim contoh file QRIS dan CSV Japan Post Bank yang asli.
