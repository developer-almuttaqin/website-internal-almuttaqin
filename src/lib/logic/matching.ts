import { dateJst } from "../format";
import type { Donation, StatementLine } from "../types";

/** Normalisasi nama: lebar penuh/setengah, huruf kecil, hiragana ke katakana, tanpa spasi dan tanda. */
export function normalizeName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
    .replace(/[ァィゥェォッャュョヮ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 1))
    .replace(/[\s　.,()（）・･\-ー]/g, "");
}

function bigrams(s: string): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return m;
}

/** Koefisien Dice atas bigram, 0 sampai 1. */
export function nameSimilarity(a: string | null | undefined, b: string | null | undefined): number {
  const x = normalizeName(a);
  const y = normalizeName(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  if (x.length < 2 || y.length < 2) return 0;
  if (x.includes(y) || y.includes(x)) return 0.9;
  const bx = bigrams(x);
  const by = bigrams(y);
  let overlap = 0;
  for (const [g, n] of bx) overlap += Math.min(n, by.get(g) ?? 0);
  return (2 * overlap) / (x.length - 1 + (y.length - 1));
}

function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(`${a.slice(0, 10)}T00:00:00Z`) - Date.parse(`${b.slice(0, 10)}T00:00:00Z`)) / 86_400_000);
}

export const NAME_THRESHOLD = 0.75;

export interface MatchCandidate {
  donation: Donation;
  score: number;
}

/**
 * Kandidat formulir donasi untuk satu baris mutasi.
 * Rupiah: nominal unik sama persis, dibayar 0-2 hari setelah formulir.
 * Yen: nominal sama, tanggal +/- 2 hari, skor dari kemiripan nama katakana.
 * Tanggal dibandingkan menurut Asia/Tokyo.
 */
export function candidatesFor(
  line: Pick<StatementLine, "amount" | "currency" | "occurred_on" | "sender_name">,
  donations: Donation[],
  /** Jendela tanggal; pencocokan manual memakai jendela lebih longgar agar bendahara tetap melihat kandidat. */
  windowDays = 2,
): MatchCandidate[] {
  const out: MatchCandidate[] = [];
  for (const d of donations) {
    if (d.status !== "pending" || d.currency !== line.currency || Number(d.amount) !== Number(line.amount)) continue;
    const diff = dayDiff(line.occurred_on, dateJst(new Date(d.submitted_at)));
    if (line.currency === "IDR") {
      if (diff >= 0 && diff <= windowDays) out.push({ donation: d, score: 1 });
    } else if (Math.abs(diff) <= windowDays) {
      const score = Math.max(nameSimilarity(line.sender_name, d.kana_name), nameSimilarity(line.sender_name, d.donor_name));
      out.push({ donation: d, score });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

export interface AutoMatch {
  lineIndex: number;
  donationId: string;
}

/** Pencocokan otomatis: satu baris mutasi hanya untuk satu donasi, dan sebaliknya. */
export function autoMatch(lines: Pick<StatementLine, "amount" | "currency" | "occurred_on" | "sender_name">[], donations: Donation[]): AutoMatch[] {
  const taken = new Set<string>();
  const result: AutoMatch[] = [];
  lines.forEach((line, lineIndex) => {
    if (Number(line.amount) <= 0) return;
    const cands = candidatesFor(line, donations).filter((c) => !taken.has(c.donation.id));
    if (!cands.length) return;
    const [best, second] = cands;
    const confident = line.currency === "IDR" ? cands.length === 1 : best.score >= NAME_THRESHOLD && (!second || second.score < best.score);
    if (confident) {
      taken.add(best.donation.id);
      result.push({ lineIndex, donationId: best.donation.id });
    }
  });
  return result;
}
