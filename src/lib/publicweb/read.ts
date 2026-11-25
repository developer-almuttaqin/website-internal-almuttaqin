import "server-only";
import type { PubSection, PubValues } from "./sections";
import { publicStore, type PubRow } from "./store";

export interface PubItem {
  id: string;
  values: PubValues;
}

/** Isi sebuah bagian web publik sebagai nilai logis (siap untuk daftar dan formulir). */
export async function loadSection(section: PubSection): Promise<PubItem[]> {
  const store = publicStore();
  const read = (stored: PubRow) => (section.read ? section.read(stored) : stored);
  if (section.kind === "table") return (await store.list(section.source)).map((r) => ({ id: String(r.id), values: read(r) }));
  if (section.kind === "collection") {
    const rows = await store.list("content_items", { collection: section.source });
    rows.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
    return rows.map((r) => ({ id: String(r.id), values: { ...read((r.data ?? {}) as PubRow), item_key: r.item_key, published: r.published } }));
  }
  const row = (await store.list("site_settings", { key: section.source }))[0];
  return [{ id: section.source, values: read((row?.value ?? {}) as PubRow) }];
}

/** Tanggal Jumat berikutnya (atau hari ini bila Jumat), 'YYYY-MM-DD' menurut tanggal yang diberikan. */
export function nextFriday(today: string): string {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + ((5 - d.getUTCDay() + 7) % 7));
  return d.toISOString().slice(0, 10);
}
