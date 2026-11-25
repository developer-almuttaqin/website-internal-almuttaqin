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
