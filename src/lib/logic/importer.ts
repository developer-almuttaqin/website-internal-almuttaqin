/** Pembaca file impor (CSV/XLSX) tanpa ketergantungan pada server; fungsi murni agar mudah diuji. */

export type Cell = string | number | boolean | Date | null | undefined;

export function decodeText(buf: Uint8Array): string {
  const utf8 = new TextDecoder("utf-8").decode(buf);
  if (!utf8.includes("�")) return utf8.replace(/^﻿/, "");
  // CSV ゆうちょダイレクト memakai Shift_JIS.
  return new TextDecoder("shift_jis").decode(buf);
}

export function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : firstLine.includes("\t") && !firstLine.includes(",") ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

/** "Rp100.027", "¥3,000", "1.250.000,50", "-4500" menjadi angka; null bila bukan angka. */
export function parseAmount(value: Cell): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value == null || value instanceof Date || typeof value === "boolean") return null;
  let s = value.normalize("NFKC").replace(/[^\d.,-]/g, "");
  if (!/\d/.test(s)) return null;
  const negative = s.startsWith("-") || /^\(.*\)$/.test(value.trim());
  s = s.replace(/-/g, "");
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  if (lastDot >= 0 && lastComma >= 0) {
    const decimal = lastDot > lastComma ? "." : ",";
    const thousand = decimal === "." ? "," : ".";
    s = s.split(thousand).join("").replace(decimal, ".");
  } else {
    const sep = lastDot >= 0 ? "." : lastComma >= 0 ? "," : "";
    if (sep) {
      const parts = s.split(sep);
      const isThousands = parts.length > 2 || parts[parts.length - 1].length === 3;
      s = isThousands ? parts.join("") : parts.join(".");
    }
  }
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function valid(y: number, m: number, d: number): string | null {
  if (y < 1990 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Menerima Date (sel Excel), YYYY-MM-DD, YYYY/MM/DD, YYYYMMDD, DD/MM/YYYY, DD-MM-YYYY. */
export function parseDate(value: Cell): string | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  if (value == null || typeof value === "boolean") return null;
  const s = String(value).normalize("NFKC").trim();
  let m = s.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (m) return valid(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) return valid(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return valid(+m[3], +m[2], +m[1]);
  return null;
}

export type ColumnRole = "date" | "amount" | "amount_in" | "amount_out" | "description" | "name" | "category" | "type";

const HINTS: Record<ColumnRole, RegExp> = {
  date: /tanggal|tgl|date|waktu|time|日付|年月日|取引日|お取扱日/i,
  amount_in: /masuk|kredit|credit|pemasukan|debet masuk|入金|お預り|受入/i,
  amount_out: /keluar|debit|debet|pengeluaran|出金|お支払|払出/i,
  amount: /nominal|jumlah|amount|total|nilai|金額/i,
  name: /nama|pengirim|sender|name|customer|payer|依頼人|摘要|お取引内容/i,
  description: /keterangan|deskripsi|uraian|description|catatan|note|remark|berita|詳細|備考|メモ/i,
  category: /kategori|category|pos|科目/i,
  type: /jenis|tipe|type|種別/i,
};

/** Menebak kolom dari judulnya; pengguna tetap bisa mengubah pemetaan di layar impor. */
export function guessColumns(headers: string[]): Partial<Record<ColumnRole, number>> {
  const out: Partial<Record<ColumnRole, number>> = {};
  const order: ColumnRole[] = ["date", "amount_in", "amount_out", "amount", "category", "type", "name", "description"];
  const used = new Set<number>();
  for (const role of order) {
    const idx = headers.findIndex((h, i) => !used.has(i) && HINTS[role].test(String(h ?? "")));
    if (idx >= 0) {
      out[role] = idx;
      used.add(idx);
    }
  }
  return out;
}

export function cellText(value: Cell): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

/** Baris pertama yang berisi minimal dua sel teks dianggap judul kolom. */
export function splitHeader(rows: Cell[][]): { headers: string[]; body: Cell[][] } {
  const idx = rows.findIndex((r) => r.filter((c) => typeof c === "string" && c.trim() !== "" && parseAmount(c) === null).length >= 2);
  if (idx < 0) return { headers: (rows[0] ?? []).map((_, i) => `Kolom ${i + 1}`), body: rows };
  return { headers: rows[idx].map((c, i) => cellText(c) || `Kolom ${i + 1}`), body: rows.slice(idx + 1) };
}
