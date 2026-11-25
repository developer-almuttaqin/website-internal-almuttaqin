# PRD v2 — Web Publik Al Muttaqin Cultural Center

Paket dokumen perencanaan web publik `almuttaqinculturalcenter.org` (situs tiga bahasa, App Jamaah PWA, dan admin konten), diekspor dari dokumen Claude pada 20 November 2026. Semua file berformat Markdown biasa, sehingga bisa dibuka di editor teks, GitHub, VS Code, atau dibaca langsung oleh Claude Code.

## Isi paket

| File | Isi |
| --- | --- |
| [`PRD-LENGKAP.md`](PRD-LENGKAP.md) | Semua PRD digabung menjadi satu file untuk dibaca dari awal sampai akhir |
| [`CLAUDE.md`](CLAUDE.md) | Aturan proyek untuk Claude Code; letakkan di root repo |
| [`docs/prd/00-master.md`](docs/prd/00-master.md) | Master PRD v2: ringkasan, persona, benchmark, peta modul, sitemap, arsitektur, desain, roadmap |
| [`docs/prd/01-design-system.md`](docs/prd/01-design-system.md) | Palet merah gelap/hitam/putih, tipografi, ikon Lucide, komponen, elemen pembeda |
| [`docs/prd/02-database.md`](docs/prd/02-database.md) | Skema Supabase, ERD, RLS, storage, seed, perubahan v2 |
| [`docs/prd/03-website-publik.md`](docs/prd/03-website-publik.md) | Rute & section web publik, rute tambahan v2 |
| [`docs/prd/04-jadwal-salat.md`](docs/prd/04-jadwal-salat.md) | Jadwal salat, iqamah, Jumat, Hijriah, Ramadan |
| [`docs/prd/05-donasi.md`](docs/prd/05-donasi.md) | Donasi QRIS & Japan Post Bank, pencocokan mutasi, gateway opsional |
| [`docs/prd/06-kegiatan-kajian.md`](docs/prd/06-kegiatan-kajian.md) | Agenda, formulir dinamis, kajian & live |
| [`docs/prd/07-app-jamaah-pwa.md`](docs/prd/07-app-jamaah-pwa.md) | App Jamaah: install, offline, notifikasi, kiblat, Al-Qur’an |
| [`docs/prd/08-panduan-layanan.md`](docs/prd/08-panduan-layanan.md) | Panduan, halal, kamus, FAQ, saran, peminjaman ruangan, program budaya |
| [`docs/prd/09-panel-admin.md`](docs/prd/09-panel-admin.md) | Admin konten & donasi, peran, dashboard |
| [`docs/prd/10-bahasa-seo-deploy.md`](docs/prd/10-bahasa-seo-deploy.md) | Tiga bahasa, SEO, keamanan, testing, deploy |
| [`docs/prd/11-backlog.md`](docs/prd/11-backlog.md) | Tiket per sprint dan Definition of Done |
| [`docs/prd/12-kontrak-action-api.md`](docs/prd/12-kontrak-action-api.md) | Kontrak Server Action & endpoint |
| [`docs/prd/13-konten-keputusan.md`](docs/prd/13-konten-keputusan.md) | Keputusan & aset dari pengurus |
| [`docs/prd/14-uat-serah-terima.md`](docs/prd/14-uat-serah-terima.md) | UAT, serah terima, biaya |
| [`docs/prd/15-prompt-pack.md`](docs/prd/15-prompt-pack.md) | 24 prompt berurutan untuk Claude (mulai dari sini saat membangun) |
| [`docs/referensi/sistem-internal-donasi.md`](docs/referensi/sistem-internal-donasi.md) | Rancangan web internal pengurus (`pengurus-acc.online`) untuk tahap berikutnya |

Diagram dan wireframe tersimpan sebagai gambar PNG di folder `docs/prd/assets/` dan `docs/referensi/assets/`.

## Cara memakai dengan Claude Code

1. Buat proyek Next.js, lalu salin folder `docs/` dan file `CLAUDE.md` dari paket ini ke root repo.
2. Buka `docs/prd/15-prompt-pack.md` dan mulai dari prompt P00, satu prompt per sesi Claude Code.
3. Setelah setiap prompt, jalankan `npm run lint && npm run typecheck && npm run test && npm run build`, cek tampilan di HP dan desktop, lalu commit.
4. Catat keputusan baru di `docs/prd/13-konten-keputusan.md` dan perbarui status tiket di `docs/prd/11-backlog.md`.

## Catatan ekspor

- Kolom status yang di dokumen asli berupa pilihan (mis. “Belum mulai”) menjadi teks biasa; ubah langsung di file Markdown.
- Tautan antartab di dokumen asli menjadi teks nama tab, misalnya “PRD-05 · Donasi QRIS & Japan Post”.
