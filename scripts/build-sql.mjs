// Menggabungkan semua migration dan data awal menjadi satu berkas: supabase/setup-all.sql.
// Tempel isi berkas itu sekali di Supabase Dashboard > SQL Editor pada proyek INTERNAL yang masih kosong.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "supabase");
const migrations = readdirSync(path.join(root, "migrations")).filter((f) => f.endsWith(".sql")).sort();
const parts = [
  "-- Web internal pengurus Al Muttaqin Cultural Center: skema lengkap + data awal.",
  "-- DIBUAT OTOMATIS oleh `npm run db:sql`; jangan diubah langsung. Jalankan SEKALI di proyek Supabase",
  "-- internal yang masih kosong (SQL Editor). Seluruh berkas berjalan dalam satu transaksi:",
  "-- bila ada yang gagal, tidak ada yang tersimpan.",
  "",
  "begin;",
  "",
];
for (const file of migrations) parts.push(`-- ===== migrations/${file} =====`, readFileSync(path.join(root, "migrations", file), "utf8").trim(), "");
parts.push("-- ===== seed.sql =====", readFileSync(path.join(root, "seed.sql"), "utf8").trim(), "", "commit;", "");
writeFileSync(path.join(root, "setup-all.sql"), parts.join("\n"));
console.log(`supabase/setup-all.sql: ${migrations.length} migration + seed`);
