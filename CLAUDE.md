# CLAUDE.md — Web Internal Pengurus Al Muttaqin Cultural Center

## Konteks
Repo ini adalah web INTERNAL pengurus (pengurus-acc.online) untuk Al Muttaqin Cultural Center (masjid &
pusat budaya Islam) di Matsudo, Chiba, Jepang: kas, persetujuan direktur, donasi, tagihan, anggaran,
inventaris, jamaah, muallaf, TPA, peminjaman ruangan, surat, laporan. Tujuh akun, tujuh peran.
Web publik (almuttaqinculturalcenter.org) adalah aplikasi TERPISAH dan bukan bagian repo ini; PRD-nya
(PRD-LENGKAP.md, 15-prompt-pack.md) hanya rujukan desain. Rancangan web internal: sistem-internal-donasi.md.
Sebelum mengerjakan apa pun, baca README.md dan sistem-internal-donasi.md.

## Stack
Next.js 16 App Router (baca AGENTS.md: API berbeda dari versi lama) + TypeScript strict, Tailwind CSS v4,
lucide-react, Supabase (Postgres, Auth, Storage), next-intl (id bawaan, en, ja; bahasa lewat cookie),
Zod, Vitest. Tanpa kunci Supabase aplikasi berjalan dalam mode demo (data di .data/).

## Aturan desain
- Gaya mengikuti web publik (DESIGN GUIDELINES - ACC): modern, minimalis, hero maroon berpola bintang,
  judul dua warna, kartu membulat, logo kubah tiga dari `public/images/brand/`; untuk web internal
  utamakan sederhana dan cepat dipakai dari HP.
- Warna hanya dari token di `src/app/globals.css` (cream, maroon, coklat tua, emas; sama dengan web publik);
  tidak ada hex di komponen.
- Tanpa emoji di UI, kode, notifikasi, maupun seed data. Ikon hanya lucide-react.
- Mobile-first dan responsif penuh (uji 360, 768, 1280, 1536 px); mode terang & gelap.

## Aturan kode
- Semua teks UI lewat messages/{id,en,ja}.json (ketiganya wajib punya kunci yang sama).
- Modul data didefinisikan di src/lib/resources.ts; hak akses di src/lib/permissions.ts.
- Server Components default; "use client" hanya untuk bagian interaktif.
- Mutasi lewat createAction (src/lib/actions/core.ts): Zod + cek peran + rate limit + log aktivitas.
- Hanya direktur yang menyetujui pengeluaran dan peminjaman ruangan; bendahara tidak bisa menyetujui.
- Yen dan Rupiah tidak pernah dijumlahkan.
- Setiap tabel baru wajib migration + RLS. Zona waktu tampilan Asia/Tokyo.
- Donasi: Rupiah via QRIS, Yen via Japan Post Bank; dihitung sebagai pemasukan hanya setelah cocok
  dengan mutasi rekening yang diimpor.
- Dua database: Supabase internal (data pengurus) dan Supabase web publik (konten untuk jamaah, lewat
  `src/lib/publicweb/`, hanya dari server dengan service role). Satu data hanya disimpan di satu tempat:
  konten publik ditulis langsung ke database web publik, data internal tidak pernah disalin ke sana.
  Bagian web publik yang bisa diubah didefinisikan di `src/lib/publicweb/sections.ts`; teksnya di `web.*`.
- Setelah mengubah migration, jalankan `npm run db:sql`; `tests/migration.test.ts` menguji SQL lewat PGlite.

## Selesai berarti
lint, typecheck, test, dan build lulus; laporkan file yang dibuat/diubah dan cara mengujinya.
