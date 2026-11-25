-- Web internal pengurus Al Muttaqin Cultural Center: skema lengkap + data awal.
-- DIBUAT OTOMATIS oleh `npm run db:sql`; jangan diubah langsung. Jalankan SEKALI di proyek Supabase
-- internal yang masih kosong (SQL Editor). Seluruh berkas berjalan dalam satu transaksi:
-- bila ada yang gagal, tidak ada yang tersimpan.

begin;

-- ===== migrations/20261121000000_init.sql =====
-- Web internal pengurus Al Muttaqin Cultural Center (pengurus-acc.online)
-- Proyek Supabase INTERNAL, terpisah dari proyek web publik.
-- Nama kolom sama persis dengan src/lib/types.ts. RLS aktif di semua tabel.
-- CATATAN: migration ini belum dijalankan terhadap Postgres saat ditulis; jalankan `supabase db reset`
-- di lingkungan uji sebelum dipakai produksi.

create extension if not exists pgcrypto;

create type app_role as enum ('direktur', 'bendahara', 'sekretaris', 'ibadah', 'pendidikan', 'fasilitas', 'pembimbing');
create type currency_code as enum ('JPY', 'IDR');

-- ---------------------------------------------------------------- profil & peran
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role app_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.has_role(roles app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and active and role = any (roles));
$$;

create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and active);
$$;

alter table profiles enable row level security;
create policy "members read profiles" on profiles for select to authenticated using (is_member());
create policy "director manages profiles" on profiles for all to authenticated
  using (has_role(array['direktur']::app_role[])) with check (has_role(array['direktur']::app_role[]));

-- ---------------------------------------------------------------- keuangan
create table accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency currency_code not null,
  kind text not null check (kind in ('bank', 'cash', 'qris')),
  opening_balance numeric not null default 0,
  created_at timestamptz not null default now()
);

create table budgets (
  id uuid primary key default gen_random_uuid(),
  program text not null,
  year int not null,
  currency currency_code not null,
  amount numeric not null check (amount >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table bills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  vendor text,
  amount numeric not null check (amount >= 0),
  currency currency_code not null,
  frequency text not null check (frequency in ('monthly', 'quarterly', 'yearly')),
  next_due date not null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table cash_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  account_id uuid not null references accounts (id),
  currency currency_code not null,
  type text not null check (type in ('in', 'out')),
  category text not null,
  amount numeric not null check (amount > 0),
  description text not null,
  proof_path text,
  budget_id uuid references budgets (id) on delete set null,
  source text not null default 'manual' check (source in ('manual', 'import', 'expense', 'donation')),
  ref_id uuid,
  dedupe_hash text not null,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);
create index cash_entries_date_idx on cash_entries (entry_date);
create index cash_entries_hash_idx on cash_entries (dedupe_hash);

create table expense_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  amount numeric not null check (amount > 0),
  currency currency_code not null,
  budget_id uuid references budgets (id) on delete set null,
  bill_id uuid references bills (id) on delete set null,
  needed_by date,
  notes text,
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'rejected', 'paid')),
  requested_by uuid not null references profiles (id),
  requested_by_name text not null,
  decided_by uuid references profiles (id),
  decided_at timestamptz,
  decision_note text,
  paid_by uuid references profiles (id),
  paid_at timestamptz,
  account_id uuid references accounts (id),
  receipt_path text,
  cash_entry_id uuid references cash_entries (id) on delete set null,
  created_at timestamptz not null default now()
);
create index expense_requests_status_idx on expense_requests (status);

create table donations (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  donor_name text,
  kana_name text,
  contact text,
  program text,
  amount numeric not null check (amount > 0),
  currency currency_code not null,
  channel text not null check (channel in ('qris', 'yucho', 'cash')),
  status text not null default 'pending' check (status in ('pending', 'matched', 'expired', 'rejected')),
  submitted_at timestamptz not null default now(),
  matched_line_id uuid unique,
  matched_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index donations_status_idx on donations (status);

create table statement_imports (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('qris_report', 'yucho_csv')),
  account_id uuid not null references accounts (id),
  file_name text not null,
  file_hash text not null unique, -- file yang sama tidak bisa diimpor dua kali
  row_count int not null default 0,
  matched_count int not null default 0,
  imported_by uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

create table statement_lines (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references statement_imports (id) on delete cascade,
  account_id uuid not null references accounts (id),
  occurred_on date not null,
  amount numeric not null,
  currency currency_code not null,
  sender_name text,
  description text,
  status text not null default 'unmatched' check (status in ('unmatched', 'matched', 'ignored')),
  donation_id uuid unique references donations (id), -- satu baris mutasi hanya untuk satu donasi
  created_at timestamptz not null default now()
);

create table recurring_donors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact text,
  amount numeric not null check (amount >= 0),
  currency currency_code not null,
  method text not null check (method in ('qris', 'yucho', 'cash')),
  pay_day int check (pay_day between 1 and 31),
  last_paid_on date,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- jamaah, aset, administrasi
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null,
  category text not null,
  location text not null,
  quantity numeric not null default 1,
  condition text not null check (condition in ('good', 'needs_repair', 'broken', 'lost')),
  acquired_on date,
  photo_path text,
  notes text,
  created_at timestamptz not null default now()
);

create table congregants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact text,
  city text,
  nationality text,
  consent_news boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table muallaf (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact text,
  shahada_date date,
  mentor_id uuid references profiles (id) on delete set null,
  needs text,
  progress_notes text,
  status text not null default 'active' check (status in ('active', 'independent', 'inactive')),
  created_at timestamptz not null default now()
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity int not null default 0,
  created_at timestamptz not null default now()
);

create table room_bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id),
  purpose text not null,
  organizer_name text not null,
  contact text,
  attendees int,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'requested' check (status in ('requested', 'approved', 'declined', 'confirmed')),
  decision_note text,
  decided_by uuid references profiles (id),
  source text not null default 'internal' check (source in ('internal', 'public')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  severity text not null check (severity in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  reported_on date not null default current_date,
  reported_by_name text,
  notes text,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null check (kind in ('jumuah', 'kajian', 'class', 'meeting', 'other')),
  starts_at timestamptz not null,
  location text,
  officer text,
  notes text,
  created_at timestamptz not null default now()
);

create table tpa_students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  guardian_contact text,
  class_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table tpa_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references tpa_students (id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'permit', 'sick', 'absent')),
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

create table letter_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table letters (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references letter_templates (id),
  number text not null unique,
  subject text not null,
  data jsonb not null default '{}',
  body text not null,
  issued_on date not null,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  actor_name text not null,
  action text not null,
  entity text not null,
  entity_id text,
  summary text,
  created_at timestamptz not null default now()
);
create index activity_logs_created_idx on activity_logs (created_at desc);

-- ---------------------------------------------------------------- RLS standar (baca / tulis per peran)
-- Sama dengan ACCESS di src/lib/permissions.ts.
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('accounts',          '{direktur,bendahara}',                      '{direktur,bendahara}'),
      ('budgets',           '{direktur,bendahara}',                      '{direktur,bendahara}'),
      ('bills',             '{direktur,bendahara}',                      '{bendahara}'),
      ('cash_entries',      '{direktur,bendahara}',                      '{bendahara}'),
      ('donations',         '{direktur,bendahara}',                      '{bendahara}'),
      ('statement_imports', '{direktur,bendahara}',                      '{bendahara}'),
      ('statement_lines',   '{direktur,bendahara}',                      '{bendahara}'),
      ('recurring_donors',  '{direktur,bendahara}',                      '{bendahara}'),
      ('inventory_items',   '{direktur,bendahara,sekretaris,fasilitas}', '{fasilitas}'),
      ('congregants',       '{direktur,sekretaris}',                     '{sekretaris}'),
      ('rooms',             '{direktur,sekretaris,fasilitas}',           '{fasilitas}'),
      ('room_bookings',     '{direktur,sekretaris,fasilitas}',           '{direktur,sekretaris,fasilitas}'),
      ('events',            '{direktur,bendahara,sekretaris,ibadah,pendidikan,fasilitas,pembimbing}', '{direktur,sekretaris,ibadah,pendidikan}'),
      ('issues',            '{direktur,bendahara,sekretaris,ibadah,pendidikan,fasilitas,pembimbing}', '{direktur,bendahara,sekretaris,ibadah,pendidikan,fasilitas,pembimbing}'),
      ('tpa_students',      '{direktur,pendidikan}',                     '{pendidikan}'),
      ('tpa_attendance',    '{direktur,pendidikan}',                     '{pendidikan}'),
      ('letter_templates',  '{direktur,sekretaris}',                     '{sekretaris}'),
      ('letters',           '{direktur,sekretaris}',                     '{sekretaris}')
    ) as t (tbl, readers, writers)
  loop
    execute format('alter table %I enable row level security', r.tbl);
    execute format('create policy "role read" on %I for select to authenticated using (has_role(%L::app_role[]))', r.tbl, r.readers);
    execute format('create policy "role insert" on %I for insert to authenticated with check (has_role(%L::app_role[]))', r.tbl, r.writers);
    execute format('create policy "role update" on %I for update to authenticated using (has_role(%L::app_role[])) with check (has_role(%L::app_role[]))', r.tbl, r.writers, r.writers);
    execute format('create policy "role delete" on %I for delete to authenticated using (has_role(%L::app_role[]))', r.tbl, r.writers);
  end loop;
end $$;

-- ---------------------------------------------------------------- RLS khusus
-- Pengajuan: semua pengurus bisa mengajukan; direktur & bendahara melihat semua, yang lain hanya miliknya.
alter table expense_requests enable row level security;
create policy "expense read" on expense_requests for select to authenticated
  using (has_role(array['direktur', 'bendahara']::app_role[]) or (is_member() and requested_by = auth.uid()));
create policy "expense insert" on expense_requests for insert to authenticated
  with check (is_member() and requested_by = auth.uid() and status = 'submitted');
create policy "expense update" on expense_requests for update to authenticated
  using (has_role(array['direktur', 'bendahara']::app_role[]) or (is_member() and requested_by = auth.uid() and status = 'submitted'))
  with check (has_role(array['direktur', 'bendahara']::app_role[]) or (requested_by = auth.uid() and status = 'submitted'));
create policy "expense delete" on expense_requests for delete to authenticated
  using (is_member() and requested_by = auth.uid() and status = 'submitted');

-- Keputusan direktur: hanya direktur yang bisa menyetujui/menolak; hanya bendahara yang menandai dibayar,
-- dan hanya dari status "approved". Berlaku juga bila seseorang melewati aplikasi.
create or replace function public.guard_expense_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    if new.status in ('approved', 'rejected') then
      if old.status <> 'submitted' or not has_role(array['direktur']::app_role[]) then
        raise exception 'Hanya direktur yang bisa memutuskan pengajuan yang masih menunggu';
      end if;
    elsif new.status = 'paid' then
      if old.status <> 'approved' or not has_role(array['bendahara']::app_role[]) then
        raise exception 'Hanya bendahara yang bisa membayar pengajuan yang sudah disetujui';
      end if;
    else
      raise exception 'Perubahan status tidak diizinkan';
    end if;
  elsif old.status <> 'submitted' and (new.amount, new.currency, new.title) is distinct from (old.amount, old.currency, old.title) then
    raise exception 'Pengajuan yang sudah diputuskan tidak bisa diubah';
  end if;
  return new;
end $$;
create trigger expense_status_guard before update on expense_requests
  for each row execute function guard_expense_status();

-- Peminjaman ruangan: disetujui direktur, lalu dikonfirmasi koordinator fasilitas.
create or replace function public.guard_booking_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    if new.status in ('approved', 'declined') and not has_role(array['direktur']::app_role[]) then
      raise exception 'Hanya direktur yang bisa menyetujui peminjaman ruangan';
    elsif new.status = 'confirmed' and (old.status <> 'approved' or not has_role(array['fasilitas']::app_role[])) then
      raise exception 'Hanya koordinator fasilitas yang bisa mengonfirmasi jadwal yang sudah disetujui';
    end if;
  end if;
  return new;
end $$;
create trigger booking_status_guard before update on room_bookings
  for each row execute function guard_booking_status();

-- Muallaf: pembimbing hanya melihat dan mengubah muallaf dampingannya.
alter table muallaf enable row level security;
create policy "muallaf read" on muallaf for select to authenticated
  using (has_role(array['direktur', 'sekretaris']::app_role[]) or (has_role(array['pembimbing']::app_role[]) and mentor_id = auth.uid()));
create policy "muallaf insert" on muallaf for insert to authenticated
  with check (has_role(array['sekretaris']::app_role[]) or (has_role(array['pembimbing']::app_role[]) and mentor_id = auth.uid()));
create policy "muallaf update" on muallaf for update to authenticated
  using (has_role(array['sekretaris']::app_role[]) or (has_role(array['pembimbing']::app_role[]) and mentor_id = auth.uid()))
  with check (has_role(array['sekretaris']::app_role[]) or (has_role(array['pembimbing']::app_role[]) and mentor_id = auth.uid()));
create policy "muallaf delete" on muallaf for delete to authenticated
  using (has_role(array['sekretaris']::app_role[]) or (has_role(array['pembimbing']::app_role[]) and mentor_id = auth.uid()));

-- Log aktivitas: setiap pengurus menulis atas namanya sendiri; hanya direktur yang membaca; tidak bisa diubah/dihapus.
alter table activity_logs enable row level security;
create policy "log insert" on activity_logs for insert to authenticated with check (is_member() and actor_id = auth.uid());
create policy "log read" on activity_logs for select to authenticated using (has_role(array['direktur']::app_role[]));

-- ---------------------------------------------------------------- storage (bukti, kuitansi, foto inventaris)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('internal-files', 'internal-files', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy "members read internal files" on storage.objects for select to authenticated
  using (bucket_id = 'internal-files' and public.is_member());
create policy "members upload internal files" on storage.objects for insert to authenticated
  with check (bucket_id = 'internal-files' and public.is_member());

-- ===== migrations/20261125000000_bridge.sql =====
-- Jembatan ke web publik (almuttaqinculturalcenter.org) dan hak akses eksplisit.
-- Database internal tetap terpisah: kolom di bawah hanya menyimpan RUJUKAN ke baris di database
-- web publik, supaya formulir yang sama tidak diimpor dua kali dan keputusan pengurus bisa
-- dikirim balik. Aman dijalankan ulang.

-- Ruangan internal dipasangkan dengan ruangan di web publik lewat kuncinya (content_items.item_key).
alter table rooms add column if not exists public_key text;
create unique index if not exists rooms_public_key_idx on rooms (public_key) where public_key is not null;

-- Formulir dari web publik: id baris asalnya.
alter table room_bookings add column if not exists public_ref text;
create unique index if not exists room_bookings_public_ref_idx on room_bookings (public_ref) where public_ref is not null;

alter table donations add column if not exists public_ref text;
create unique index if not exists donations_public_ref_idx on donations (public_ref) where public_ref is not null;

alter table recurring_donors add column if not exists public_ref text;
create unique index if not exists recurring_donors_public_ref_idx on recurring_donors (public_ref) where public_ref is not null;

alter table tpa_students add column if not exists public_ref text;
create unique index if not exists tpa_students_public_ref_idx on tpa_students (public_ref) where public_ref is not null;

alter table issues add column if not exists public_ref text;
create unique index if not exists issues_public_ref_idx on issues (public_ref) where public_ref is not null;

-- Kegiatan internal yang sudah ditampilkan sebagai agenda di web publik.
alter table events add column if not exists public_ref text;

-- ---------------------------------------------------------------- hak akses eksplisit
-- Proyek Supabase baru tidak selalu memberi hak tabel secara otomatis. RLS tetap menjadi penjaga
-- utama; GRANT hanya membuka pintu tabel bagi pengurus yang sudah masuk. Pengunjung tanpa sesi
-- (anon) tidak mendapat hak apa pun di database internal.
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on function public.has_role(app_role[]), public.is_member() to authenticated, service_role;
revoke all on all tables in schema public from anon;

-- Log aktivitas hanya boleh ditambah, tidak diubah atau dihapus, juga oleh pengurus yang masuk.
revoke update, delete on activity_logs from authenticated;

-- ===== seed.sql =====
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

commit;
