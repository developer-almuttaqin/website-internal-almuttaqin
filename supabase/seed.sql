-- Data awal web internal. Rekening bertanda DEMO: ganti dengan data asli dari pengurus.
insert into accounts (name, currency, kind, opening_balance) values
  ('Japan Post Bank (DEMO)', 'JPY', 'bank', 0),
  ('Kas tunai masjid', 'JPY', 'cash', 0),
  ('Rekening Indonesia / QRIS (DEMO)', 'IDR', 'qris', 0);

insert into rooms (name, capacity) values
  ('Ruang serbaguna', 40),
  ('Ruang kelas', 15);

insert into letter_templates (code, name, body) values
  ('UND', 'Undangan kegiatan', E'Kepada Yth.\n{{penerima}}\ndi tempat\n\nAssalamu''alaikum warahmatullahi wabarakatuh.\n\nDengan hormat, kami mengundang Bapak/Ibu untuk menghadiri {{nama_kegiatan}} yang akan diselenggarakan pada:\n\nHari, tanggal : {{hari_tanggal}}\nWaktu         : {{waktu}}\nTempat        : {{tempat}}\n\nDemikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.\n\nWassalamu''alaikum warahmatullahi wabarakatuh.'),
  ('KET', 'Surat keterangan', E'Yang bertanda tangan di bawah ini, pengurus Al Muttaqin Cultural Center, menerangkan bahwa:\n\nNama   : {{nama}}\nAlamat : {{alamat}}\n\nadalah benar {{keterangan}}.\n\nSurat keterangan ini dibuat untuk {{keperluan}} dan dapat dipergunakan sebagaimana mestinya.'),
  ('MLF', 'Keterangan muallaf', E'Yang bertanda tangan di bawah ini, pengurus Al Muttaqin Cultural Center, menerangkan bahwa:\n\nNama            : {{nama}}\nKewarganegaraan : {{kewarganegaraan}}\n\ntelah mengucapkan dua kalimat syahadat di Al Muttaqin Cultural Center, Matsudo, Chiba, pada tanggal {{tanggal_syahadah}}, disaksikan oleh {{saksi_1}} dan {{saksi_2}}.\n\nDemikian surat keterangan ini dibuat dengan sebenar-benarnya.'),
  ('RNG', 'Persetujuan peminjaman ruangan', E'Kepada Yth.\n{{pemohon}}\n\nMenanggapi permohonan peminjaman ruangan, dengan ini kami menyetujui pemakaian {{ruangan}} pada {{hari_tanggal}} pukul {{waktu}} untuk keperluan {{keperluan}}.\n\nPemohon wajib menjaga kebersihan, mengosongkan ruangan saat waktu salat berjamaah, dan mengembalikan perlengkapan ke tempat semula.');

-- Setelah membuat 7 pengguna di Supabase Auth (Authentication > Users), daftarkan perannya:
-- insert into profiles (id, full_name, email, role)
-- select id, 'Nama Direktur', email, 'direktur' from auth.users where email = 'direktur@contoh.org';
-- Ulangi untuk: bendahara, sekretaris, ibadah, pendidikan, fasilitas, pembimbing.
