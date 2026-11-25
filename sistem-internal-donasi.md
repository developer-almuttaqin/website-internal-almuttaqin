# Sistem Internal & Donasi Al Muttaqin Cultural Center — Rancangan yang Disetujui

Nov 2, 2026 · @Riswan Ramadhan

## 1. Keputusan direktur

Direktur menyetujui rancangan ini secara keseluruhan dengan keputusan di bawah; bagian lain dokumen sudah disesuaikan, dan bagian 8–9 menjawab dua tantangan terbesar: arsitektur dua web dan donasi Rupiah–Yen.

| Hal                              | Keputusan                                                                                                                                                                    |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Nama lembaga                     | Al Muttaqin Cultural Center                                                                                                                                                  |
| Jumlah web                       | Dua aplikasi terpisah di server berbeda: web publik (beserta admin konten) dan web internal pengurus                                                                         |
| Domain web publik & admin publik | `almuttaqinculturalcenter.org`                                                                                                                                               |
| Domain web internal              | `pengurus-acc.online`                                                                                                                                                        |
| Teknologi                        | Next.js + Supabase                                                                                                                                                           |
| Bahasa                           | Indonesia, Inggris, Jepang                                                                                                                                                   |
| Tampilan                         | Wajib responsif di HP, tablet, dan laptop                                                                                                                                    |
| Akun web internal                | 7 akun                                                                                                                                                                       |
| Persetujuan pengeluaran          | Semua pengeluaran disetujui direktur; bendahara tidak bisa menyetujui                                                                                                        |
| Donasi                           | Rupiah lewat QRIS ke rekening Indonesia; Yen lewat transfer ke rekening Japan Post Bank (ゆうちょ銀行); keduanya tercatat di dashboard dan dicocokkan dengan mutasi rekening |

**Fitur wajib web internal:**

- Kas dengan unggah foto bukti, dua mata uang (yen & rupiah), dan impor dari Excel

- Anggaran untuk setiap program

- Daftar donatur tetap

- Daftar inventaris beserta kondisinya (wajib)

- Data jamaah dan muallaf, termasuk formulir informasi muallaf

- Absensi TPA (akan dikembangkan lebih lanjut)

- Tagihan rutin (listrik, air, sewa, internet, dan lainnya)

- Peminjaman ruangan lewat web

- Administrasi: isi formulir, surat langsung jadi

## 2. Gambaran dashboard direktur

Direktur jarang perlu mengisi data; yang dibutuhkan adalah melihat kondisi masjid dan memutuskan dengan cepat. Layar pertama dirancang menjawab lima hal: kondisi kas, apa yang menunggu persetujuan, kegiatan pekan ini, masalah yang belum selesai, dan tenggat yang sudah dekat.

![contoh tampilan dashboard direktur · angka dan nama masih placeholder](assets/sistem-internal-donasi/wireframe-dashboard-direktur.png)

contoh tampilan dashboard direktur · angka dan nama masih placeholder

Panel “Menunggu persetujuan” disorot karena itu satu-satunya bagian yang menunggu tindakan direktur; semua angka dan nama di gambar masih contoh.

## 3. Menu fitur

Berikut 40 fitur yang umum ada di sistem pengelolaan masjid, dikelompokkan dalam 11 modul. Kami menandai 20 fitur sebagai Tahap 1 (paling mendasar); Bapak/Ibu bebas mengubahnya lewat kolom Pilihan.

### A. Dashboard direktur

| Fitur                            | Contoh pemakaian                                   | Rekomendasi | Pilihan       |
|----------------------------------|----------------------------------------------------|-------------|---------------|
| Ringkasan kas & infaq bulan ini  | Saldo, pemasukan, pengeluaran dibanding bulan lalu | Tahap 1     | Belum dipilih |
| Daftar yang menunggu persetujuan | Pengajuan dana, kegiatan baru                      | Tahap 1     | Belum dipilih |
| Kegiatan & petugas pekan ini     | Khatib Jumat, kajian, kelas                        | Tahap 1     | Belum dipilih |
| Masalah yang belum selesai       | Kerusakan, keluhan, tugas terlambat                | Tahap 1     | Belum dipilih |
| Pengingat tenggat                | Laporan tahunan, perpanjangan kontrak              | Tahap 2     | Belum dipilih |

### B. Keuangan

| Fitur                               | Contoh pemakaian                                                   | Rekomendasi | Pilihan       |
|-------------------------------------|--------------------------------------------------------------------|-------------|---------------|
| Buku kas masuk & keluar             | Catat transaksi dengan kategori dan foto bukti                     | Tahap 1     | Belum dipilih |
| Infaq online tercatat otomatis      | Konfirmasi dari website masuk setelah diverifikasi bendahara       | Tahap 1     | Belum dipilih |
| Penghitungan kotak amal             | Dicatat oleh dua petugas sebagai saksi                             | Tahap 1     | Belum dipilih |
| Pengajuan & persetujuan pengeluaran | Pengurus atau bendahara mengajukan, hanya direktur yang menyetujui | Tahap 1     | Belum dipilih |
| Laporan bulanan otomatis            | PDF/Excel siap dibagikan ke pengurus dan jamaah                    | Tahap 1     | Belum dipilih |
| Rekening yen & rupiah terpisah      | Saldo Jepang dan Indonesia tidak tercampur                         | Tahap 1     | Belum dipilih |
| Anggaran per program                | Target vs realisasi Ramadan, TPA, operasional                      | Tahap 2     | Belum dipilih |
| Donatur tetap & pengingat bulanan   | Daftar komitmen dan siapa yang sudah membayar                      | Tahap 2     | Belum dipilih |

### C. Jamaah & muallaf

| Fitur                        | Contoh pemakaian                                              | Rekomendasi | Pilihan       |
|------------------------------|---------------------------------------------------------------|-------------|---------------|
| Data jamaah                  | Nama, kontak, kota, izin menerima kabar                       | Tahap 1     | Belum dipilih |
| Data muallaf & pembimbing    | Tanggal syahadah, pendamping, catatan perkembangan            | Tahap 1     | Belum dipilih |
| Sertifikat syahadah bernomor | PDF dalam bahasa Jepang/Inggris/Indonesia, tersimpan otomatis | Tahap 1     | Belum dipilih |

### D. Ibadah & petugas

| Fitur                            | Contoh pemakaian                                     | Rekomendasi | Pilihan       |
|----------------------------------|------------------------------------------------------|-------------|---------------|
| Jadwal imam, khatib, muadzin     | Kalender per pekan, otomatis tampil di website & App | Tahap 1     | Belum dipilih |
| Jadwal piket kebersihan          | Bergilir per pekan                                   | Tahap 1     | Belum dipilih |
| Pengingat petugas & tukar jadwal | Notifikasi H-1, mencari pengganti                    | Tahap 2     | Belum dipilih |

### E. Kegiatan & pendidikan

| Fitur                        | Contoh pemakaian                           | Rekomendasi | Pilihan       |
|------------------------------|--------------------------------------------|-------------|---------------|
| Kalender kegiatan internal   | Rapat, kajian, kunjungan, acara besar      | Tahap 1     | Belum dipilih |
| Peserta & absensi kelas      | TPA, kelas muallaf, kajian rutin           | Tahap 2     | Belum dipilih |
| Iuran program                | Tagihan TPA bulanan                        | Tahap 2     | Belum dipilih |
| Kepanitiaan Ramadan & kurban | Pembagian tugas, logistik, daftar pekurban | Tahap 2     | Belum dipilih |

### F. Zakat & sosial

| Fitur                           | Contoh pemakaian                    | Rekomendasi | Pilihan       |
|---------------------------------|-------------------------------------|-------------|---------------|
| Data penerima bantuan (rahasia) | Hanya bisa dilihat petugas tertentu | Tahap 2     | Belum dipilih |
| Zakat fitrah & penyaluran       | Penerimaan, pembagian, laporan      | Tahap 2     | Belum dipilih |

### G. Aset & fasilitas

| Fitur                         | Contoh pemakaian                                   | Rekomendasi | Pilihan       |
|-------------------------------|----------------------------------------------------|-------------|---------------|
| Laporan kerusakan & perbaikan | Dari jamaah atau pengurus, dipantau sampai selesai | Tahap 1     | Belum dipilih |
| Daftar inventaris             | Sound system, karpet, AC, perlengkapan dapur       | Tahap 2     | Belum dipilih |
| Jadwal perawatan & kontrak    | Listrik, air, sampah, asuransi                     | Tahap 2     | Belum dipilih |
| Peminjaman ruang              | Akad nikah, rapat, kunjungan sekolah               | Tahap 2     | Belum dipilih |

### H. Relawan

| Fitur                          | Contoh pemakaian               | Rekomendasi | Pilihan       |
|--------------------------------|--------------------------------|-------------|---------------|
| Daftar relawan & keahlian      | Bahasa, memasak, desain, sopir | Tahap 2     | Belum dipilih |
| Penugasan relawan per kegiatan | Siapa bertugas di acara apa    | Tahap 2     | Belum dipilih |

### I. Administrasi

| Fitur                 | Contoh pemakaian                     | Rekomendasi | Pilihan       |
|-----------------------|--------------------------------------|-------------|---------------|
| Rapat & notulen       | Agenda, keputusan, penanggung jawab  | Tahap 1     | Belum dipilih |
| Daftar tugas pengurus | Penanggung jawab dan tenggat         | Tahap 1     | Belum dipilih |
| Arsip dokumen         | Akta, kontrak, izin, laporan tahunan | Tahap 1     | Belum dipilih |
| Nomor surat otomatis  | Surat keluar & masuk tercatat        | Tahap 2     | Belum dipilih |

### J. Layanan jamaah

| Fitur                             | Contoh pemakaian                              | Rekomendasi | Pilihan       |
|-----------------------------------|-----------------------------------------------|-------------|---------------|
| Arsip akad nikah                  | Data pasangan, wali, saksi, dokumen           | Tahap 2     | Belum dipilih |
| Prosedur & kontak darurat jenazah | Langkah, kontak pemakaman, petugas            | Tahap 2     | Belum dipilih |
| Kunjungan rombongan               | Permintaan dari sekolah atau komunitas Jepang | Tahap 2     | Belum dipilih |

### K. Komunikasi

| Fitur                        | Contoh pemakaian                      | Rekomendasi | Pilihan       |
|------------------------------|---------------------------------------|-------------|---------------|
| Pengumuman internal pengurus | Info rapat, perubahan jadwal          | Tahap 2     | Belum dipilih |
| Templat pesan siap kirim     | Teks siap salin ke grup WhatsApp/LINE | Tahap 2     | Belum dipilih |

### L. Tambahan dari direktur

| Fitur                               | Contoh pemakaian                                                              | Rekomendasi | Pilihan        |
|-------------------------------------|-------------------------------------------------------------------------------|-------------|----------------|
| Impor kas dari Excel                | Unggah file, cocokkan kolom, pratinjau, tolak data ganda                      | Tahap 1     | Perlu sekarang |
| Kondisi & foto inventaris           | Baik / perlu perbaikan / rusak / hilang, foto, lokasi, label QR               | Tahap 1     | Perlu sekarang |
| Formulir informasi muallaf          | Data diri, tanggal syahadah, pembimbing, kebutuhan pendampingan               | Tahap 1     | Perlu sekarang |
| Tagihan rutin                       | Jatuh tempo, pengingat, langsung jadi pengajuan pembayaran ke direktur        | Tahap 1     | Perlu sekarang |
| Peminjaman ruangan lewat web publik | Formulir di web publik, cek bentrok jadwal, disetujui di web internal         | Tahap 1     | Perlu sekarang |
| Surat otomatis dari formulir        | Pilih templat, isi formulir, PDF berkop dengan nomor surat otomatis           | Tahap 1     | Perlu sekarang |
| Donasi Rupiah & Yen otomatis        | Pembayaran online tercatat langsung dan dicocokkan dengan rekening (bagian 9) | Tahap 1     | Perlu sekarang |

## 4. Tujuh akun web internal

Usulan pembagian 7 akun di bawah mengikuti keputusan direktur: hanya direktur yang bisa menyetujui pengeluaran. Nama pemegang akun diisi di bagian 7.

| No  | Akun                               | Tugas utama di sistem                                     | Wewenang khusus                                                         |
|-----|------------------------------------|-----------------------------------------------------------|-------------------------------------------------------------------------|
| 1   | Direktur                           | Melihat semua data, memantau, menerima laporan            | Satu-satunya yang menyetujui pengeluaran, kegiatan besar, dan akun baru |
| 2   | Bendahara                          | Kas, donasi, tagihan, anggaran, impor Excel, laporan      | Mengajukan dan membayar, tetapi tidak bisa menyetujui                   |
| 3   | Sekretaris                         | Administrasi, surat otomatis, notulen, arsip, data jamaah | Menerbitkan nomor surat                                                 |
| 4   | Koordinator ibadah                 | Jadwal imam, khatib, muadzin, dan piket                   | Mengubah jadwal petugas                                                 |
| 5   | Koordinator pendidikan & TPA       | Kelas, peserta, absensi, iuran TPA                        | Mengelola data peserta                                                  |
| 6   | Koordinator fasilitas & inventaris | Inventaris & kondisinya, kerusakan, peminjaman ruangan    | Mengonfirmasi jadwal ruangan setelah disetujui direktur                 |
| 7   | Pembimbing muallaf                 | Formulir dan perkembangan muallaf yang didampingi         | Hanya melihat muallaf dampingannya                                      |

Admin konten web publik memakai akun terpisah di `almuttaqinculturalcenter.org`, sehingga tidak mengurangi jatah 7 akun ini. Akun direktur dan bendahara wajib memakai verifikasi dua langkah, dan setiap perubahan data tercatat lengkap: siapa, apa, dan kapan.

## 5. Alur persetujuan pengeluaran

Sesuai keputusan direktur, setiap pengeluaran — termasuk tagihan rutin — diajukan lewat sistem dan hanya bisa disetujui direktur; bendahara membayar, mengunggah kuitansi, dan transaksi otomatis masuk buku kas serta mengurangi anggaran program terkait.

![alur persetujuan pengeluaran · semua lewat direktur](assets/sistem-internal-donasi/alur-persetujuan.png)

alur persetujuan pengeluaran · semua lewat direktur

Agar direktur tidak menjadi hambatan, persetujuan dibuat satu ketukan dari HP, dengan notifikasi untuk setiap pengajuan baru dan ringkasan harian berisi yang masih menunggu. Semua langkah tercatat dengan nama dan waktunya.

## 6. Usulan tahapan

Kami menyarankan mulai dari yang kecil tetapi dipakai setiap hari, lalu menambah fitur setelah pengurus terbiasa; durasi di bawah adalah perkiraan.

- **Tahap 1 (sekitar 6–8 minggu):** dashboard direktur; kas dengan foto bukti, yen & rupiah, dan impor Excel; donasi online Rupiah & Yen beserta pencocokan rekening; persetujuan pengeluaran oleh direktur; tagihan rutin; anggaran per program; donatur tetap; inventaris & kondisinya; data jamaah, muallaf, dan formulir muallaf; peminjaman ruangan; surat otomatis; laporan bulanan. Data lama dari Excel atau buku dipindahkan di awal tahap ini.

- **Tahap 2 (setelah tahap 1 dipakai 1–2 bulan):** absensi TPA versi lanjutan, pengingat petugas ibadah, zakat & bantuan sosial, relawan, kepanitiaan Ramadan & kurban, arsip nikah dan jenazah, serta fitur lain yang ditandai “Nanti”.

Web internal dan web publik dibangun bersamaan tetapi berjalan di server terpisah; susunan server dan biayanya dijelaskan di bagian 8.

## 7. Pertanyaan yang masih perlu dijawab

Pertanyaan 2 dan 3 sudah terjawab pada intinya; sisa detailnya dibutuhkan untuk menampilkan data rekening yang benar di web dan membuat fitur impor mutasi.

| No  | Pertanyaan                                                                                                                                      | Jawaban                                                                                         |
|-----|-------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| 1   | Siapa pemegang 7 akun web internal (nama dan peran, merujuk bagian 4)?                                                                          |                                                                                                 |
| 2   | Rupiah: QRIS dari bank apa, atas nama siapa, dan terdaftar di kategori apa (donasi sosial atau reguler)?                                        | Memakai QRIS ke rekening Indonesia; bank, nama pemilik, dan kategori belum dikonfirmasi         |
| 3   | Yen: rekening Japan Post Bank atas nama lembaga atau perorangan, dan apakah ゆうちょダイレクト sudah aktif?                                     | Memakai rekening Japan Post Bank; nama pemilik dan status ゆうちょダイレクト belum dikonfirmasi |
| 4   | Berapa kisaran nominal donasi yang paling sering, dalam Rupiah dan Yen?                                                                         |                                                                                                 |
| 5   | Templat surat apa saja yang paling sering dibuat (undangan, keterangan, peminjaman, keterangan muallaf, lainnya)?                               |                                                                                                 |
| 6   | Domain web internal tetap `pengurus-acc.online`, atau boleh memakai subdomain seperti `pengurus.almuttaqinculturalcenter.org` (lihat bagian 8)? |                                                                                                 |
| 7   | Siapa yang menanggung biaya layanan bulanan dan biaya MDR QRIS bila ada?                                                                        |                                                                                                 |
| 8   | Siapa penanggung jawab sistem dari pihak masjid untuk dihubungi selama pembangunan?                                                             |                                                                                                 |

## 8. Arsitektur dua web & domain

Kami merekomendasikan dua aplikasi Next.js di server terpisah, masing-masing dengan database Supabase sendiri, dan menjadikan web internal satu-satunya tempat penyimpanan data uang serta data pribadi; web publik hanya menerima angka ringkas seperti progres donasi dan jadwal ruangan.

![arsitektur dua web · dua server, dua database](assets/sistem-internal-donasi/arsitektur-dua-web.png)

arsitektur dua web · dua server, dua database

Formulir donasi dan peminjaman ruangan diisi di web publik, tetapi langsung disimpan ke web internal lewat API; mutasi rekening QRIS dan Japan Post Bank juga diimpor di web internal. Jadi kalaupun web publik diserang, data donatur, jamaah, muallaf, dan keuangan tidak ikut terbuka.

| Hal             | Rekomendasi                                              | Alasan                                                                                                                                                                                                                                     |
|-----------------|----------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Server          | Dua proyek terpisah di Vercel                            | Sesuai permintaan “dua server”; deploy dan gangguan satu web tidak memengaruhi yang lain                                                                                                                                                   |
| Database        | Dua proyek Supabase: publik dan internal                 | Isolasi data sensitif; kunci akses web publik tidak bisa membuka data internal                                                                                                                                                             |
| Akun            | Login terpisah di tiap web                               | Admin konten publik tidak otomatis bisa masuk ke keuangan                                                                                                                                                                                  |
| Domain internal | Saran: subdomain `pengurus.almuttaqinculturalcenter.org` | Lebih dipercaya pengurus, satu kali perpanjangan domain, dan mengurangi risiko tautan palsu (phishing). `pengurus-acc.online` tetap bisa dipakai bila sudah diputuskan                                                                     |
| Biaya tambahan  | Proyek Supabase kedua sekitar US\$10/bulan               | Paket Pro Supabase US\$25/bulan sudah termasuk kredit compute untuk satu instans kecil ([ringkasan harga](https://www.activepieces.com/blog/supabase-pricing-free-tier-limits-pro-costs-egress)); proyek kedua membutuhkan instans sendiri |

Alternatif lebih hemat: satu proyek Supabase dengan skema terpisah untuk publik dan internal. Biayanya lebih rendah, tetapi isolasinya lebih lemah, sehingga kami tetap menyarankan dua database untuk data keuangan dan data pribadi.

## 9. Donasi Rupiah & Yen

Keputusannya: **Rupiah diterima lewat QRIS** ke rekening Indonesia dan **Yen lewat transfer ke rekening Japan Post Bank** (ゆうちょ銀行). Dengan pilihan ini tahap 1 tidak memerlukan payment gateway sama sekali — tanpa pendaftaran tambahan dan tanpa potongan gateway — dan setiap donasi baru dihitung sebagai pemasukan setelah cocok dengan mutasi rekening.

### 9.1 Cara kerja yang dipilih

|                       | QRIS (Rupiah)                                                                                            | Japan Post Bank (Yen)                                                                                               |
|-----------------------|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| Langkah donatur       | Isi formulir singkat di web, lalu scan QRIS dan bayar nominal unik yang ditampilkan (mis. Rp100.027)     | Isi formulir beserta nama dalam katakana, lalu transfer ke rekening Japan Post Bank                                 |
| Data rekening di web  | Gambar QRIS dan nama merchant                                                                            | Dua format: kode–nomor untuk sesama Japan Post Bank, serta nama cabang–nomor rekening untuk transfer dari bank lain |
| Cara tercatat         | “Menunggu” saat formulir dikirim; “masuk rekening” setelah laporan transaksi QRIS diimpor dan cocok      | “Menunggu” saat formulir dikirim; “masuk rekening” setelah CSV mutasi dari ゆうちょダイレクト diimpor dan cocok     |
| Kunci pencocokan      | Nominal unik dan waktu transaksi                                                                         | Nominal, tanggal, dan nama pengirim                                                                                 |
| Biaya bagi masjid     | MDR QRIS sesuai Bank Indonesia: 0% sampai Rp100.000 dan 0% untuk kategori donasi sosial; selain itu 0,7% | Tidak ada; biaya transfer ditanggung donatur sesuai tarif banknya                                                   |
| Donasi tanpa formulir | Tetap tercatat dari laporan impor sebagai “Hamba Allah”                                                  | Tetap tercatat dari CSV dengan nama pengirimnya                                                                     |

Untuk transfer dari bank lain, rekening Japan Post Bank memakai format khusus dengan kode bank 9900. Sistem menghitungnya otomatis dari kode (記号) dan nomor (番号) rekening mengikuti rumus resmi Japan Post Bank ([Japan Post Bank](https://www.jp-bank.japanpost.jp/kojin/sokin/koza/kj_sk_kz_furikomi_ksk.html)), lalu hasilnya dicek dengan alat resmi di situs mereka sebelum dipasang di web.

ゆうちょダイレクト menyediakan unduhan mutasi dalam format CSV ([Japan Post Bank](https://www.jp-bank.japanpost.jp/direct/pc/guide/dr_pc_gd_meisai.html)), jadi impornya bisa rutin dan cepat. Untuk transparansi, kami menyarankan rekening atas nama lembaga, bukan atas nama pribadi pengurus.

### 9.2 Alternatif untuk tahap berikutnya

Biaya per Nov 2, 2026; dapat berubah, konfirmasi ke penyedia sebelum mendaftar.

Payment gateway baru dibutuhkan bila nanti masjid ingin konfirmasi instan tanpa impor (QRIS dinamis lewat Midtrans) atau ingin menerima kartu (Stripe).

| Platform                                 | Untuk                                          | Biaya per transaksi                                                                    | Syarat pendaftaran                                                                    | Catatan                                                                                      |
|------------------------------------------|------------------------------------------------|----------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| Midtrans                                 | Rupiah: QRIS, virtual account, e-wallet, kartu | QRIS mengikuti tarif MDR Bank Indonesia; virtual account Rp4.000; kartu 2,9% + Rp2.000 | Perorangan: KTP. Yayasan: KTP direktur, NPWP, akta pendirian. Rekening bank Indonesia | Pendaftaran mandiri, ada webhook dan laporan pencairan; paling cepat dipakai                 |
| QRIS langsung dari bank (mis. Nobu Bank) | Rupiah: QRIS                                   | Mengikuti tarif MDR Bank Indonesia                                                     | Kerja sama langsung dengan bank, tidak bisa daftar mandiri                            | Layak dijajaki bila volume besar; integrasinya bergantung kesediaan bank                     |
| Stripe Japan                             | Yen: kartu                                     | 3,6% per transaksi kartu domestik                                                      | Lembaga dan rekening bank di Jepang                                                   | Webhook dan laporan pencairan lengkap                                                        |
| PayPay (akun bisnis donasi)              | Yen: dompet digital                            | Ditanyakan ke PayPay                                                                   | PayPay memverifikasi lembaga secara tatap muka                                        | Sangat populer di Jepang, tetapi proses pendaftarannya panjang; cocok untuk tahap berikutnya |
| Transfer bank Jepang                     | Yen                                            | Gratis bagi masjid; donatur menanggung biaya transfernya                               | Rekening Jepang                                                                       | Dicocokkan lewat impor mutasi dan kode referensi                                             |
| Transfer bank Indonesia                  | Rupiah                                         | Gratis bagi masjid                                                                     | Rekening Indonesia                                                                    | Dicocokkan lewat kode unik nominal (mis. Rp100.123) dan impor mutasi                         |

Soal QRIS: Bank Indonesia menetapkan MDR 0% untuk kategori donasi sosial nirlaba, dan sejak 1 Oktober 2026 juga 0% untuk transaksi sampai Rp100.000 di semua kategori, dengan 0,7% di atasnya untuk merchant reguler ([Bank Indonesia](https://www.bi.go.id/id/publikasi/ruang-media/cerita-bi/pages/mdr-qris.aspx)). Midtrans menyebut tarif QRIS reguler 0,7% dan meminta merchant kategori khusus menghubungi mereka ([Midtrans](https://docs.midtrans.com/docs/berapa-biaya-transaksi-untuk-qris)), jadi saat mendaftar ajukan kategori donasi sosial agar QRIS bisa 0%.

### 9.3 Simulasi biaya

| Donasi    | Metode                                     | Biaya bagi masjid             | Masuk rekening |
|-----------|--------------------------------------------|-------------------------------|----------------|
| Rp100.000 | QRIS                                       | Rp0 (MDR 0% sampai Rp100.000) | Rp100.000      |
| Rp500.000 | QRIS, kategori donasi sosial               | Rp0                           | Rp500.000      |
| Rp500.000 | QRIS, merchant reguler                     | Rp3.500 (0,7%)                | Rp496.500      |
| ¥3.000    | Transfer ke Japan Post Bank                | ¥0                            | ¥3.000         |
| ¥10.000   | Transfer ke Japan Post Bank                | ¥0                            | ¥10.000        |
| ¥10.000   | Kartu lewat Stripe, bila ditambahkan nanti | ¥360 (3,6%)                   | ¥9.640         |

Karena itu, pastikan QRIS masjid terdaftar di bank dengan kategori donasi sosial nirlaba agar semua donasi bebas MDR. Biaya yang tetap ada dicatat terpisah di buku kas.

### 9.4 Agar sesuai rekening dan dashboard

![alur pencocokan donasi dengan rekening](assets/sistem-internal-donasi/alur-pencocokan-donasi.png)

alur pencocokan donasi dengan rekening

Donasi tampil di dashboard sejak formulir dikirim dengan status menunggu, tetapi baru dihitung sebagai pemasukan setelah cocok dengan laporan QRIS atau CSV Japan Post Bank yang diimpor bendahara, idealnya setiap hari. Baris yang tidak cocok otomatis masuk daftar untuk dicocokkan manual.

- Dashboard menampilkan per mata uang: donasi menunggu dicocokkan, donasi yang sudah masuk rekening, dan biaya MDR bila ada.

- File yang sama tidak bisa diimpor dua kali, dan setiap baris mutasi hanya bisa dicocokkan dengan satu donasi.

- Yen dan Rupiah tidak pernah dijumlah langsung; laporan gabungan memakai kurs yang dicatat pada tanggal transaksi.

- Formulir yang tidak diikuti pembayaran dalam 7 hari otomatis ditandai kedaluwarsa.

### 9.5 Langkah berikutnya

1.  Konfirmasi QRIS yang dipakai: dari bank apa, atas nama siapa, dan kategorinya (minta kategori donasi sosial).

2.  Konfirmasi rekening Japan Post Bank: atas nama lembaga atau perorangan, serta kode dan nomornya untuk menghitung format transfer dari bank lain.

3.  Aktifkan ゆうちょダイレクト, atau ゆうちょBizダイレクト untuk rekening lembaga, agar mutasi bisa diunduh dalam format CSV.

4.  Minta bendahara mengirim contoh file laporan QRIS dan CSV Japan Post Bank, agar fitur impor dibuat persis sesuai formatnya.

5.  Pertimbangkan QRIS dinamis lewat Midtrans dan Stripe di tahap berikutnya bila perlu konfirmasi instan atau pembayaran kartu.

### Sumber

- [Bank Indonesia — MDR QRIS bagi merchant](https://www.bi.go.id/id/publikasi/ruang-media/cerita-bi/pages/mdr-qris.aspx)

- [Japan Post Bank — unduh mutasi CSV di ゆうちょダイレクト](https://www.jp-bank.japanpost.jp/direct/pc/guide/dr_pc_gd_meisai.html)

- [Japan Post Bank — rumus format rekening untuk transfer dari bank lain](https://www.jp-bank.japanpost.jp/kojin/sokin/koza/kj_sk_kz_furikomi_ksk.html)

- [Japan Post Bank — biaya transfer dari bank lain ditetapkan bank pengirim](https://www.jp-bank.japanpost.jp/kojin/sokin/furikomi/kj_sk_fm_furikomi.html)

- [Midtrans — biaya transaksi QRIS](https://docs.midtrans.com/docs/berapa-biaya-transaksi-untuk-qris)

- [Tarif Stripe di Jepang](https://saas.imitsu.jp/cate-payment/service/4390/price)

- [PayPay — pendaftaran akun bisnis untuk donasi](https://paymentnavi.com/?p=149172)
