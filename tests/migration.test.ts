import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Menjalankan migration dan seed terhadap Postgres sungguhan (PGlite, tanpa Docker) lalu menguji
 * aturan RLS yang paling penting. Skema `auth` dan `storage` milik Supabase diganti tiruan kecil.
 */
const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated, service_role;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
`;

const dir = path.join(__dirname, "..", "supabase");
const read = (file: string) => readFileSync(path.join(dir, file), "utf8").replace(/create extension[^;]*;/gi, "");
const migrations = readdirSync(path.join(dir, "migrations")).filter((f) => f.endsWith(".sql")).sort();

const ids = {
  direktur: "00000000-0000-4000-8000-000000000001",
  bendahara: "00000000-0000-4000-8000-000000000002",
  sekretaris: "00000000-0000-4000-8000-000000000003",
  pembimbing: "00000000-0000-4000-8000-000000000004",
  pembimbingLain: "00000000-0000-4000-8000-000000000005",
} as const;

let pg: PGlite;

/** Jalankan SQL sebagai pengurus tertentu (peran Postgres `authenticated` + auth.uid()). */
async function as<T = Record<string, unknown>>(user: keyof typeof ids | null, sql: string): Promise<T[]> {
  await pg.exec(`set role ${user ? "authenticated" : "anon"}; select set_config('request.jwt.claim.sub', '${user ? ids[user] : ""}', false);`);
  try {
    return (await pg.query<T>(sql)).rows;
  } finally {
    await pg.exec("reset role;");
  }
}

beforeAll(async () => {
  pg = new PGlite();
  await pg.exec(SUPABASE_STUB);
  for (const file of migrations) await pg.exec(read(path.join("migrations", file)));
  await pg.exec(read("seed.sql"));
  for (const [role, id] of Object.entries(ids)) {
    await pg.query("insert into auth.users (id, email) values ($1, $2)", [id, `${role}@contoh.test`]);
    await pg.query("insert into profiles (id, full_name, email, role) values ($1, $2, $3, $4)", [id, role, `${role}@contoh.test`, role === "pembimbingLain" ? "pembimbing" : role]);
  }
}, 60_000);

describe("migration Supabase internal", () => {
  it("skema dan data awal terpasang", async () => {
    const tables = await pg.query<{ n: number }>("select count(*)::int as n from information_schema.tables where table_schema = 'public'");
    expect(tables.rows[0].n).toBe(22);
    const seeded = await pg.query<{ accounts: number; rooms: number; templates: number }>(
      "select (select count(*)::int from accounts) as accounts, (select count(*)::int from rooms) as rooms, (select count(*)::int from letter_templates) as templates",
    );
    expect(seeded.rows[0]).toEqual({ accounts: 3, rooms: 2, templates: 4 });
  });

  it("setiap tabel memakai RLS", async () => {
    const open = await pg.query<{ relname: string }>(
      "select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity",
    );
    expect(open.rows).toEqual([]);
  });

  it("pengunjung tanpa sesi tidak bisa membaca apa pun", async () => {
    await expect(as(null, "select * from accounts")).rejects.toThrow(/permission denied/);
    await expect(as(null, "select * from profiles")).rejects.toThrow(/permission denied/);
  });

  it("data keuangan hanya untuk direktur dan bendahara", async () => {
    expect(await as("bendahara", "select id from accounts")).toHaveLength(3);
    expect(await as("direktur", "select id from accounts")).toHaveLength(3);
    expect(await as("sekretaris", "select id from accounts")).toHaveLength(0);
    await expect(as("sekretaris", "insert into accounts (name, currency, kind) values ('x', 'JPY', 'cash')")).rejects.toThrow(/row-level security/);
  });

  it("hanya direktur yang menyetujui pengeluaran; hanya bendahara yang membayar", async () => {
    const [req] = await as<{ id: string }>(
      "sekretaris",
      `insert into expense_requests (title, category, amount, currency, requested_by, requested_by_name) values ('Spidol', 'education', 1200, 'JPY', '${ids.sekretaris}', 'sekretaris') returning id`,
    );
    await expect(as("bendahara", `update expense_requests set status = 'approved' where id = '${req.id}'`)).rejects.toThrow(/Hanya direktur/);
    await expect(as("bendahara", `update expense_requests set status = 'paid' where id = '${req.id}'`)).rejects.toThrow(/Hanya bendahara/);
    await as("direktur", `update expense_requests set status = 'approved', decided_by = '${ids.direktur}' where id = '${req.id}'`);
    await expect(as("direktur", `update expense_requests set status = 'paid' where id = '${req.id}'`)).rejects.toThrow(/Hanya bendahara/);
    await as("bendahara", `update expense_requests set status = 'paid', paid_by = '${ids.bendahara}' where id = '${req.id}'`);
    const [row] = await as<{ status: string }>("direktur", `select status from expense_requests where id = '${req.id}'`);
    expect(row.status).toBe("paid");
  });

  it("hanya direktur yang menyetujui peminjaman ruangan, termasuk yang datang dari web publik", async () => {
    const room = (await pg.query<{ id: string }>("select id from rooms limit 1")).rows[0].id;
    const [booking] = await as<{ id: string }>(
      "sekretaris",
      `insert into room_bookings (room_id, purpose, organizer_name, starts_at, ends_at, source, public_ref) values ('${room}', 'Akad nikah', 'Keluarga A', now(), now() + interval '2 hours', 'public', 'web-1') returning id`,
    );
    await expect(as("sekretaris", `update room_bookings set status = 'approved' where id = '${booking.id}'`)).rejects.toThrow(/Hanya direktur/);
    await as("direktur", `update room_bookings set status = 'approved' where id = '${booking.id}'`);
    await expect(
      pg.query(`insert into room_bookings (room_id, purpose, organizer_name, starts_at, ends_at, public_ref) values ('${room}', 'Ganda', 'B', now(), now() + interval '1 hour', 'web-1')`),
    ).rejects.toThrow(/duplicate key/);
  });

  it("pembimbing hanya melihat muallaf dampingannya", async () => {
    await pg.query("insert into muallaf (full_name, mentor_id) values ('A', $1), ('B', $2)", [ids.pembimbing, ids.pembimbingLain]);
    expect(await as<{ full_name: string }>("pembimbing", "select full_name from muallaf")).toEqual([{ full_name: "A" }]);
    expect(await as("sekretaris", "select full_name from muallaf")).toHaveLength(2);
  });

  it("log aktivitas hanya bisa ditambah dan hanya dibaca direktur", async () => {
    await as("sekretaris", `insert into activity_logs (actor_id, actor_name, action, entity) values ('${ids.sekretaris}', 'sekretaris', 'record.save', 'record')`);
    await expect(as("sekretaris", `insert into activity_logs (actor_id, actor_name, action, entity) values ('${ids.direktur}', 'palsu', 'x', 'x')`)).rejects.toThrow(/row-level security/);
    expect(await as("sekretaris", "select id from activity_logs")).toHaveLength(0);
    expect(await as("direktur", "select id from activity_logs")).toHaveLength(1);
    await expect(as("direktur", "delete from activity_logs")).rejects.toThrow(/permission denied/);
  });
});
