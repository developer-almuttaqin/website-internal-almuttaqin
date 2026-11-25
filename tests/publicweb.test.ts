import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import id from "../messages/id.json";
import ja from "../messages/ja.json";
import { isoToJstLocal } from "../src/lib/format";
import { ACCESS, canRead, canWrite } from "../src/lib/permissions";
import { blocksToText, excerptOf, fillL10n, monthlyStatement, pickL10n, readL10n, slugify, textToBlocks, transparencyData, uniqueSlug, writeBlocks } from "../src/lib/publicweb/content";
import { buildPublicSeed } from "../src/lib/publicweb/seed";
import { PUB_SECTIONS, findSection, toFormValues } from "../src/lib/publicweb/sections";

const lookup = (obj: unknown, path: string) => path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);

describe("teks tiga bahasa", () => {
  it("bahasa yang dikosongkan mengikuti bahasa Indonesia", () => {
    expect(fillL10n({ id: "Kerja bakti", en: "", ja: "" })).toEqual({ id: "Kerja bakti", en: "Kerja bakti", ja: "Kerja bakti" });
    expect(fillL10n({ id: "Kerja bakti", en: "Clean-up", ja: "" })).toEqual({ id: "Kerja bakti", en: "Clean-up", ja: "Kerja bakti" });
    expect(fillL10n({ id: "", en: "", ja: "" })).toBeNull();
  });
  it("membaca nilai yang rusak tanpa gagal", () => {
    expect(readL10n(null)).toEqual({ id: "", en: "", ja: "" });
    expect(pickL10n({ id: "A", en: "B" }, "ja")).toBe("A");
    expect(pickL10n({ id: "A", en: "B" }, "en")).toBe("B");
  });
  it("terjemahan yang sama dengan teks Indonesia ditampilkan kosong di formulir", () => {
    const section = findSection("jumat")!;
    const form = toFormValues(section, { date: "2026-11-27", topic: { id: "Sabar", en: "Sabar", ja: "忍耐" }, published: true }, isoToJstLocal);
    expect(form["topic.id"]).toBe("Sabar");
    expect(form["topic.en"]).toBe("");
    expect(form["topic.ja"]).toBe("忍耐");
    expect(form.published).toBe("true");
  });
});

describe("isi panjang", () => {
  it("teks menjadi paragraf dan daftar, lalu kembali ke teks yang sama", () => {
    const text = "Paragraf satu.\n\n- butir a\n- butir b\n\nParagraf dua.";
    const blocks = textToBlocks(text);
    expect(blocks).toEqual([{ type: "p", text: "Paragraf satu." }, { type: "ul", items: ["butir a", "butir b"] }, { type: "p", text: "Paragraf dua." }]);
    expect(blocksToText(blocks)).toBe(text);
  });
  it("blok asli dipertahankan bila teksnya tidak diubah", () => {
    const original = { id: [{ type: "h2", text: "Judul" }, { type: "quote", text: "Kutipan" }], en: [], ja: [] };
    const same = writeBlocks({ id: "Judul\n\nKutipan", en: "", ja: "" }, original);
    expect(same.id).toBe(original.id);
    const changed = writeBlocks({ id: "Judul baru", en: "", ja: "" }, original);
    expect(changed.id).toEqual([{ type: "p", text: "Judul baru" }]);
    expect(changed.en).toEqual([{ type: "p", text: "Judul baru" }]);
  });
  it("ringkasan dipotong di batas kata", () => {
    expect(excerptOf("pendek")).toBe("pendek");
    const long = excerptOf("kata ".repeat(80));
    expect(long.length).toBeLessThanOrEqual(163);
    expect(long.endsWith("...")).toBe(true);
  });
});

describe("slug", () => {
  it("hanya huruf kecil, angka, dan tanda hubung", () => {
    expect(slugify("Kajian Akbar: Ramadan 1448 H!")).toBe("kajian-akbar-ramadan-1448-h");
    expect(slugify("金曜礼拝")).toBe("");
  });
  it("tidak pernah bentrok", () => {
    expect(uniqueSlug("Kajian", ["kajian", "kajian-2"])).toBe("kajian-3");
    expect(uniqueSlug("金曜礼拝", [], "pengumuman-2026-11")).toBe("pengumuman-2026-11");
  });
});

describe("laporan transparansi", () => {
  const accounts = [
    { id: "jp", currency: "JPY", opening_balance: 100_000 },
    { id: "cash", currency: "JPY", opening_balance: 5_000 },
    { id: "idr", currency: "IDR", opening_balance: 9_000_000 },
  ];
  const entry = (account_id: string, currency: string, entry_date: string, type: "in" | "out", category: string, amount: number) => ({ account_id, currency, entry_date, type, category, amount });
  const entries = [
    entry("jp", "JPY", "2026-10-20", "in", "donation", 20_000),
    entry("jp", "JPY", "2026-10-25", "out", "utilities", 8_000),
    entry("jp", "JPY", "2026-11-03", "in", "donation", 30_000),
    entry("cash", "JPY", "2026-11-06", "in", "infaq_box", 12_000),
    entry("jp", "JPY", "2026-11-10", "out", "utilities", 9_000),
    entry("jp", "JPY", "2026-11-12", "in", "donation", 5_000),
    entry("idr", "IDR", "2026-11-12", "in", "donation", 1_000_000),
    entry("jp", "JPY", "2026-12-01", "out", "rent", 50_000),
  ];
  const statement = monthlyStatement(accounts, entries, "2026-11", "JPY");

  it("saldo awal memuat semua transaksi sebelum bulan itu dan Rupiah tidak ikut dihitung", () => {
    expect(statement.opening).toBe(117_000);
    expect(statement.income).toEqual([{ category: "donation", amount: 35_000 }, { category: "infaq_box", amount: 12_000 }]);
    expect(statement.expense).toEqual([{ category: "utilities", amount: 9_000 }]);
    expect(statement.closing).toBe(155_000);
  });
  it("bentuknya sesuai laporan web publik dan tanggal terbit pertama dipertahankan", () => {
    const label = (c: string) => ({ id: c, en: c, ja: c });
    const first = transparencyData("2026-11", statement, label, null, "2026-12-01T00:00:00.000Z");
    expect(first).toMatchObject({ period: "2026-11", currency: "JPY", openingBalance: 117_000, closingBalance: 155_000, publishedAt: "2026-12-01T00:00:00.000Z" });
    expect((first.title as { id: string }).id).toBe("Laporan keuangan November 2026");
    const again = transparencyData("2026-11", statement, label, { ...first, fileUrl: "reports/x.pdf" }, "2027-01-01T00:00:00.000Z");
    expect(again.publishedAt).toBe("2026-12-01T00:00:00.000Z");
    expect(again.fileUrl).toBe("reports/x.pdf");
  });
});

describe("bagian web publik", () => {
  it("setiap bagian, kolom, dan pilihan punya label di tiga bahasa", () => {
    for (const messages of [id, en, ja]) {
      for (const s of PUB_SECTIONS) {
        expect(lookup(messages, `nav.modules.${s.module}`), s.module).toBeTypeOf("string");
        expect(lookup(messages, `web.sections.${s.module}`), s.module).toBeTypeOf("string");
        for (const f of s.fields) {
          expect(lookup(messages, `web.fields.${f.name}`), `web.fields.${f.name}`).toBeTypeOf("string");
          for (const o of f.options ?? []) expect(lookup(messages, `web.options.${o}`), `web.options.${o}`).toBeTypeOf("string");
        }
      }
    }
  });
  it("modulnya terdaftar di hak akses, dan penulis juga pembaca", () => {
    for (const s of PUB_SECTIONS) {
      expect(ACCESS[s.module], s.module).toBeDefined();
      for (const role of ACCESS[s.module].write) expect(canRead(role, s.module)).toBe(true);
    }
  });
  it("rekening donasi hanya diubah direktur dan bendahara; pengumuman bukan urusan bendahara", () => {
    expect(canWrite("bendahara", "rekening")).toBe(true);
    expect(canWrite("sekretaris", "rekening")).toBe(false);
    expect(canRead("ibadah", "rekening")).toBe(false);
    expect(canWrite("ibadah", "jumat")).toBe(true);
    expect(canWrite("bendahara", "pengumuman")).toBe(false);
  });
  it("jadwal Jumat menolak tanggal yang bukan Jumat", () => {
    const jumat = findSection("jumat")!;
    expect(jumat.validate?.({ date: "2026-11-27" })).toBeNull();
    expect(jumat.validate?.({ date: "2026-11-26" })).toBe("web.errors.notFriday");
  });
  it("pengumuman: ringkasan dibuat otomatis dan waktu terbit pertama tidak berubah", () => {
    const section = findSection("pengumuman")!;
    const values = { title: { id: "Libur", en: "Libur", ja: "Libur" }, body: { id: "Masjid tutup sementara.", en: "Masjid tutup sementara.", ja: "Masjid tutup sementara." }, category: "general", status: "published", pinned: false, expires_on: "2026-12-01" };
    const created = section.write(values, null);
    expect(created.excerpt).toEqual({ id: "Masjid tutup sementara.", en: "Masjid tutup sementara.", ja: "Masjid tutup sementara." });
    expect(created.expires_at).toBe("2026-12-01T14:59:59.000Z");
    expect(created.published_at).toBeTypeOf("string");
    const updated = section.write(values, { ...created, published_at: "2026-11-01T00:00:00.000Z" });
    expect(updated.published_at).toBe("2026-11-01T00:00:00.000Z");
    expect(section.read?.(updated).expires_on).toBe("2026-12-01");
  });
  it("rekening: kolom opsional yang dikosongkan dihapus, gambar QR lama dipertahankan", () => {
    const section = findSection("rekening")!;
    const data = section.write({ bankName: "Bank A", currency: "JPY", method: "bank", accountNumber: "1", accountName: "ACC", branch: null, branchCode: null, accountType: null, primary: true, note: null }, { qrImage: "donations/qr.webp", branch: "018" });
    expect(data).toEqual({ qrImage: "donations/qr.webp", bankName: "Bank A", currency: "JPY", method: "bank", accountNumber: "1", accountName: "ACC", primary: true });
  });
  it("info masjid: isian kosong tidak menimpa nilai lama", () => {
    const section = findSection("profil")!;
    expect(section.write({ phone: "047-1", whatsapp: null, email: null }, { phone: "047-0", whatsapp: "8147", name: { id: "Al Muttaqin" } })).toEqual({ phone: "047-1", whatsapp: "8147", name: { id: "Al Muttaqin" } });
  });
  it("data contoh web publik tanpa emoji", () => {
    expect(JSON.stringify(buildPublicSeed())).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
