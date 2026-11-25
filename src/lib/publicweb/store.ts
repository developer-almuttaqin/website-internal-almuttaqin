import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isDemo } from "../db";
import { buildPublicSeed } from "./seed";

/**
 * Database KEDUA: proyek Supabase milik web publik (almuttaqinculturalcenter.org).
 * Web internal membacanya dan menulis ke sana dari server memakai service role proyek itu, sehingga
 * konten yang tampil ke jamaah (jadwal Jumat, pengumuman, agenda, rekening donasi, laporan) cukup
 * diisi satu kali. Data internal (kas, jamaah, muallaf, dst.) TIDAK pernah disimpan di sana.
 */
export type PubRow = Record<string, unknown>;
export type Match = Record<string, string | number | boolean>;

export interface PublicStore {
  list(table: string, match?: Match): Promise<PubRow[]>;
  insert(table: string, row: PubRow): Promise<PubRow>;
  update(table: string, match: Match, patch: PubRow): Promise<PubRow[]>;
  remove(table: string, match: Match): Promise<void>;
}

const url = process.env.PUBLIC_WEB_SUPABASE_URL;
const key = process.env.PUBLIC_WEB_SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_WEB_SUPABASE_SECRET_KEY;

/**
 * live: terhubung ke Supabase web publik. demo: data contoh lokal (hanya saat web internal juga demo).
 * off: kunci belum diisi; halaman Web Publik menampilkan petunjuk penyambungan.
 */
export const publicWebMode: "live" | "demo" | "off" = url && key ? "live" : isDemo ? "demo" : "off";
export const publicSiteUrl = (process.env.PUBLIC_WEB_URL || "https://almuttaqinculturalcenter.org").replace(/\/+$/, "");

export class PublicWebError extends Error {
  constructor(public code: "OFF" | "CONFLICT" | "FAILED", message?: string) {
    super(message ?? code);
  }
}

/* ------------------------------ live (Supabase web publik) ------------------------------ */

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  client ??= createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

function check(error: { message: string; code?: string } | null): void {
  if (!error) return;
  throw new PublicWebError(error.code === "23505" ? "CONFLICT" : "FAILED", error.message);
}

const liveStore: PublicStore = {
  async list(table, match = {}) {
    const { data, error } = await sb().from(table).select("*").match(match).limit(2000);
    check(error);
    return (data ?? []) as PubRow[];
  },
  async insert(table, row) {
    const { data, error } = await sb().from(table).insert(row).select("*").single();
    check(error);
    return data as PubRow;
  },
  async update(table, match, patch) {
    const { data, error } = await sb().from(table).update(patch).match(match).select("*");
    check(error);
    return (data ?? []) as PubRow[];
  },
  async remove(table, match) {
    const { error } = await sb().from(table).delete().match(match);
    check(error);
  },
};

/* ------------------------------ demo (file lokal) ------------------------------ */

type DemoPublic = Record<string, PubRow[]>;
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "public-web.json");
const globalStore = globalThis as unknown as { __accPublicDemo?: DemoPublic };

/** Kolom unik per tabel, meniru batasan di skema web publik. */
const UNIQUE: Record<string, string[]> = {
  jumuah_schedules: ["date"],
  announcements: ["slug"],
  events: ["slug"],
  content_items: ["collection", "item_key"],
  site_settings: ["key"],
};

function loadDemo(): DemoPublic {
  if (globalStore.__accPublicDemo) return globalStore.__accPublicDemo;
  let data: DemoPublic | null = null;
  try {
    if (existsSync(DATA_FILE)) data = JSON.parse(readFileSync(DATA_FILE, "utf8")) as DemoPublic;
  } catch {
    data = null;
  }
  if (!data) {
    data = buildPublicSeed();
    persist(data);
  }
  globalStore.__accPublicDemo = data;
  return data;
}

function persist(data: DemoPublic) {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(data));
  } catch {
    // Sistem berkas hanya-baca: data demo cukup di memori.
  }
}

const matches = (row: PubRow, match: Match) => Object.entries(match).every(([k, v]) => row[k] === v);

function assertUnique(table: string, rows: PubRow[], candidate: PubRow, self?: PubRow) {
  const cols = UNIQUE[table];
  if (cols && rows.some((r) => r !== self && cols.every((c) => r[c] === candidate[c]))) throw new PublicWebError("CONFLICT");
}

const demoStore: PublicStore = {
  async list(table, match = {}) {
    return (loadDemo()[table] ?? []).filter((r) => matches(r, match)).map((r) => ({ ...r }));
  },
  async insert(table, row) {
    const data = loadDemo();
    const rows = (data[table] ??= []);
    const now = new Date().toISOString();
    const created: PubRow = { ...(table === "site_settings" ? {} : { id: crypto.randomUUID() }), created_at: now, updated_at: now, ...row };
    assertUnique(table, rows, created);
    rows.push(created);
    persist(data);
    return { ...created };
  },
  async update(table, match, patch) {
    const data = loadDemo();
    const rows = data[table] ?? [];
    const out: PubRow[] = [];
    for (const row of rows) {
      if (!matches(row, match)) continue;
      const next = { ...row, ...patch, updated_at: new Date().toISOString() };
      assertUnique(table, rows, next, row);
      Object.assign(row, next);
      out.push({ ...row });
    }
    persist(data);
    return out;
  },
  async remove(table, match) {
    const data = loadDemo();
    data[table] = (data[table] ?? []).filter((r) => !matches(r, match));
    persist(data);
  },
};

export function publicStore(): PublicStore {
  if (publicWebMode === "off") throw new PublicWebError("OFF");
  return publicWebMode === "live" ? liveStore : demoStore;
}

/* ------------------------------ efek samping di web publik ------------------------------ */

/**
 * Minta web publik membuang cache-nya supaya perubahan langsung terlihat jamaah. Tanpa
 * PUBLIC_WEB_REVALIDATE_SECRET, perubahan tetap tersimpan tetapi baru tampil setelah cache web publik
 * kedaluwarsa (paling lama satu jam). Kegagalan di sini tidak menggagalkan penyimpanan.
 */
export async function refreshPublicSite(paths: string[]): Promise<boolean> {
  const secret = process.env.PUBLIC_WEB_REVALIDATE_SECRET;
  if (publicWebMode !== "live" || !secret) return false;
  try {
    const res = await fetch(`${publicSiteUrl}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
      body: JSON.stringify({ paths }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const canRefreshPublicSite = publicWebMode === "live" && Boolean(process.env.PUBLIC_WEB_REVALIDATE_SECRET);

/** Catat di log aktivitas panel admin web publik bahwa perubahan datang dari web internal. */
export async function logPublicActivity(action: string, entity: string, entityId: string | null, actorName: string): Promise<void> {
  try {
    await publicStore().insert("activity_log", { admin_id: null, action, entity, entity_id: entityId, detail: { via: "pengurus-acc", actor: actorName } });
  } catch {
    // Log tidak boleh menggagalkan aksi yang sudah berhasil.
  }
}
