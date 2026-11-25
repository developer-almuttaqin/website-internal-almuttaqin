import "server-only";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { buildSeed, type DemoData } from "./seed";
import type { TableName, Tables } from "../types";

export const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type NewRow<K extends TableName> = Omit<Tables[K], "id" | "created_at"> & { id?: string };

/** Akses data seragam: mode demo memakai file lokal, mode produksi memakai Supabase (RLS aktif). */
export interface Db {
  list<K extends TableName>(table: K): Promise<Tables[K][]>;
  get<K extends TableName>(table: K, id: string): Promise<Tables[K] | null>;
  insert<K extends TableName>(table: K, row: NewRow<K>): Promise<Tables[K]>;
  insertMany<K extends TableName>(table: K, rows: NewRow<K>[]): Promise<Tables[K][]>;
  update<K extends TableName>(table: K, id: string, patch: Partial<Tables[K]>): Promise<Tables[K]>;
  remove<K extends TableName>(table: K, id: string): Promise<void>;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "demo-db.json");
const globalStore = globalThis as unknown as { __accDemo?: DemoData };

function loadDemo(): DemoData {
  if (globalStore.__accDemo) return globalStore.__accDemo;
  let data: DemoData | null = null;
  try {
    if (existsSync(DATA_FILE)) data = { ...buildSeedShape(), ...(JSON.parse(readFileSync(DATA_FILE, "utf8")) as DemoData) };
  } catch {
    data = null;
  }
  if (!data) {
    data = buildSeed();
    persist(data);
  }
  globalStore.__accDemo = data;
  return data;
}

function buildSeedShape(): DemoData {
  const seed = buildSeed();
  for (const key of Object.keys(seed) as TableName[]) (seed[key] as unknown[]) = [];
  return seed;
}

function persist(data: DemoData) {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(data));
  } catch {
    // Sistem berkas hanya-baca (mis. serverless): data demo cukup di memori.
  }
}

const demoDb: Db = {
  async list(table) {
    return [...(loadDemo()[table] as unknown[])] as never;
  },
  async get(table, id) {
    return (loadDemo()[table] as { id: string }[]).find((r) => r.id === id) as never ?? null;
  },
  async insert(table, row) {
    return (await this.insertMany(table, [row]))[0];
  },
  async insertMany(table, rows) {
    const data = loadDemo();
    const created = rows.map((row) => ({ ...row, id: row.id ?? crypto.randomUUID(), created_at: new Date().toISOString() }));
    (data[table] as unknown[]).push(...created);
    persist(data);
    return created as never;
  },
  async update(table, id, patch) {
    const data = loadDemo();
    const rows = data[table] as { id: string }[];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("NOT_FOUND");
    rows[idx] = { ...rows[idx], ...patch, id };
    persist(data);
    return rows[idx] as never;
  },
  async remove(table, id) {
    const data = loadDemo();
    (data[table] as { id: string }[]) = (data[table] as { id: string }[]).filter((r) => r.id !== id) as never;
    persist(data);
  },
};

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Dipanggil dari Server Component: cookie diperbarui oleh proxy.
        }
      },
    },
  });
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

/** Klien service role untuk proyek INTERNAL: hanya dipakai server (sinkron web publik, kelola akun). */
export function supabaseAdmin(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (isDemo || !key) throw new Error("SERVICE_ROLE_MISSING");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const hasServiceRole = !isDemo && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);

function makeSupabaseDb(client: () => Promise<SupabaseClient> | SupabaseClient): Db {
  return {
    async list(table) {
      const sb = await client();
      const { data, error } = await sb.from(table).select("*").limit(5000);
      fail(error);
      return (data ?? []) as never;
    },
    async get(table, id) {
      const sb = await client();
      const { data, error } = await sb.from(table).select("*").eq("id", id).maybeSingle();
      fail(error);
      return (data ?? null) as never;
    },
    async insert(table, row) {
      return (await this.insertMany(table, [row]))[0];
    },
    async insertMany(table, rows) {
      if (!rows.length) return [];
      const sb = await client();
      const { data, error } = await sb.from(table).insert(rows as never).select("*");
      fail(error);
      return (data ?? []) as never;
    },
    async update(table, id, patch) {
      const sb = await client();
      const { data, error } = await sb.from(table).update(patch as never).eq("id", id).select("*").single();
      fail(error);
      return data as never;
    },
    async remove(table, id) {
      const sb = await client();
      const { error } = await sb.from(table).delete().eq("id", id);
      fail(error);
    },
  };
}

export const db: Db = isDemo ? demoDb : makeSupabaseDb(supabaseServer);

/**
 * Akses tanpa sesi pengurus (melewati RLS) untuk pekerjaan sistem: mengimpor formulir dari web publik.
 * Jangan dipakai untuk aksi yang berasal dari masukan pengguna; hak peran dicek pemanggilnya.
 */
export const systemDb: Db = isDemo ? demoDb : makeSupabaseDb(supabaseAdmin);
