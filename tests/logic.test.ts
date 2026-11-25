import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import id from "../messages/id.json";
import ja from "../messages/ja.json";
import { buildSeed } from "../src/lib/db/seed";
import { addMonths, dateJst, isoToJstLocal, jstLocalToIso } from "../src/lib/format";
import { accountBalance, balancesByCurrency, budgetRealization, dedupeHash, monthTotals } from "../src/lib/logic/cash";
import { decodeText, guessColumns, parseAmount, parseCsv, parseDate, splitHeader } from "../src/lib/logic/importer";
import { autoMatch, candidatesFor, nameSimilarity, normalizeName } from "../src/lib/logic/matching";
import { findConflict, letterNumber, nextDue, placeholders, renderLetter } from "../src/lib/logic/misc";
import { ACCESS, APPROVER, NAV, canRead, canWrite } from "../src/lib/permissions";
import { RESOURCES, scopeRows } from "../src/lib/resources";
import { ROLES, type Donation } from "../src/lib/types";

const keys = (obj: unknown, prefix = ""): string[] =>
  Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => (typeof v === "object" && v ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
const lookup = (path: string) => path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], id);

describe("terjemahan", () => {
  it("ketiga bahasa punya kunci yang sama", () => {
    expect(keys(en).sort()).toEqual(keys(id).sort());
    expect(keys(ja).sort()).toEqual(keys(id).sort());
  });
  it("setiap kolom, pilihan, dan modul punya label", () => {
    for (const res of Object.values(RESOURCES)) {
      expect(lookup(`nav.modules.${res.key}`), res.key).toBeTypeOf("string");
      for (const f of res.fields) {
        expect(lookup(`fields.${f.name}`), `fields.${f.name}`).toBeTypeOf("string");
        for (const o of f.options ?? []) expect(lookup(`options.${o}`), `options.${o}`).toBeTypeOf("string");
      }
    }
    for (const g of NAV) for (const i of g.items) expect(lookup(`nav.modules.${i.module}`)).toBeTypeOf("string");
    for (const r of ROLES) expect(lookup(`roles.${r}`)).toBeTypeOf("string");
  });
  it("tanpa emoji", () => {
    expect(JSON.stringify([id, en, ja])).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(JSON.stringify(buildSeed())).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});

describe("hak akses", () => {
  it("hanya direktur yang menyetujui; bendahara tidak", () => {
    expect(APPROVER).toBe("direktur");
    expect(canWrite("bendahara", "kas")).toBe(true);
    expect(canWrite("direktur", "kas")).toBe(false);
  });
  it("data keuangan tertutup bagi peran non-keuangan", () => {
    for (const role of ["sekretaris", "ibadah", "pendidikan", "fasilitas", "pembimbing"] as const) {
      for (const m of ["kas", "donasi", "tagihan", "anggaran", "donatur", "laporan"] as const) expect(canRead(role, m), `${role}/${m}`).toBe(false);
    }
  });
  it("setiap peran penulis juga boleh membaca, kecuali modul tanpa hak baca", () => {
    for (const [m, a] of Object.entries(ACCESS)) for (const r of a.write) expect((a.read as readonly string[]).includes(r), `${m}/${r}`).toBe(true);
  });
  it("pembimbing hanya melihat muallaf dampingannya", () => {
    const rows = [
      { id: "1", created_at: "", mentor_id: "u-pembimbing" },
      { id: "2", created_at: "", mentor_id: "lain" },
    ];
    expect(scopeRows("muallaf", { id: "u-pembimbing", role: "pembimbing" }, rows).map((r) => r.id)).toEqual(["1"]);
    expect(scopeRows("muallaf", { id: "x", role: "sekretaris" }, rows)).toHaveLength(2);
  });
  it("pengaju biasa hanya melihat pengajuannya sendiri", () => {
    const rows = [
      { id: "1", created_at: "", requested_by: "a" },
      { id: "2", created_at: "", requested_by: "b" },
    ];
    expect(scopeRows("pengajuan", { id: "a", role: "fasilitas" }, rows)).toHaveLength(1);
    expect(scopeRows("pengajuan", { id: "z", role: "direktur" }, rows)).toHaveLength(2);
  });
});

describe("kas", () => {
  const seed = buildSeed(new Date("2026-11-21T03:00:00Z"));
  it("saldo = saldo awal + masuk - keluar, per rekening", () => {
    const tunai = seed.accounts.find((a) => a.id === "acc-tunai")!;
    const manual = seed.cash_entries.filter((e) => e.account_id === tunai.id).reduce((s, e) => s + (e.type === "in" ? e.amount : -e.amount), tunai.opening_balance);
    expect(accountBalance(tunai, seed.cash_entries)).toBe(manual);
  });
  it("Yen dan Rupiah tidak dijumlahkan", () => {
    const b = balancesByCurrency(seed.accounts, seed.cash_entries);
    expect(b.IDR).toBe(5_000_000 + 750_000 + 1_250_000 - 2_000_000);
    expect(b.JPY).toBeLessThan(1_000_000);
  });
  it("total bulanan hanya menghitung bulan yang diminta", () => {
    const t = monthTotals(seed.cash_entries, "2026-11");
    expect(t.IDR.out).toBe(2_000_000);
    expect(monthTotals(seed.cash_entries, "2020-01").JPY.in).toBe(0);
  });
  it("realisasi anggaran dari pengeluaran yang terkait", () => {
    const r = budgetRealization(seed.budgets.find((b) => b.id === "bud-tpa")!, seed.cash_entries);
    expect(r.spent).toBe(12_800);
    expect(r.remaining).toBe(300_000 - 12_800);
  });
  it("hash data ganda mengabaikan spasi dan huruf besar", () => {
    const base = { entry_date: "2026-11-01", account_id: "a", type: "in" as const, amount: 1000 };
    expect(dedupeHash({ ...base, description: "Kotak  Infaq" })).toBe(dedupeHash({ ...base, description: "kotak infaq " }));
    expect(dedupeHash({ ...base, description: "x" })).not.toBe(dedupeHash({ ...base, amount: 1001, description: "x" }));
  });
});

describe("pembaca impor", () => {
  it("nominal dalam berbagai format", () => {
    expect(parseAmount("Rp100.027")).toBe(100027);
    expect(parseAmount("¥3,000")).toBe(3000);
    expect(parseAmount("1.250.000,50")).toBe(1250000.5);
    expect(parseAmount("-4500")).toBe(-4500);
    expect(parseAmount("１０，０００")).toBe(10000);
    expect(parseAmount("abc")).toBeNull();
  });
  it("tanggal dalam berbagai format", () => {
    expect(parseDate("2026-11-02")).toBe("2026-11-02");
    expect(parseDate("20261102")).toBe("2026-11-02");
    expect(parseDate("02/11/2026")).toBe("2026-11-02");
    expect(parseDate("2026年11月2日")).toBe("2026-11-02");
    expect(parseDate("31/02/2026")).toBeNull();
  });
  it("CSV dengan tanda kutip dan titik koma", () => {
    expect(parseCsv('a,b\n"x, y","he said ""hi"""\n')).toEqual([["a", "b"], ["x, y", 'he said "hi"']]);
    expect(parseCsv("a;b\r\n1;2")).toEqual([["a", "b"], ["1", "2"]]);
  });
  it("mendeteksi Shift_JIS dan menebak kolom Japan Post Bank", () => {
    // "日付,入金" dalam Shift_JIS
    const sjis = new Uint8Array([0x93, 0xfa, 0x95, 0x74, 0x2c, 0x93, 0xfc, 0x8b, 0xe0]);
    const [header] = parseCsv(decodeText(sjis));
    expect(header).toEqual(["日付", "入金"]);
    expect(guessColumns(header)).toMatchObject({ date: 0, amount_in: 1 });
  });
  it("menebak kolom laporan berbahasa Indonesia", () => {
    expect(guessColumns(["Tanggal", "Keterangan", "Masuk", "Keluar"])).toMatchObject({ date: 0, description: 1, amount_in: 2, amount_out: 3 });
    const { headers, body } = splitHeader([["Laporan kas"], ["Tanggal", "Keterangan", "Nominal"], ["2026-11-01", "Infaq", 1000]]);
    expect(headers).toEqual(["Tanggal", "Keterangan", "Nominal"]);
    expect(body).toHaveLength(1);
  });
});

describe("pencocokan donasi", () => {
  const don = (over: Partial<Donation>): Donation => ({
    id: "d1", created_at: "", reference_code: "AM-INF-AAAAAA", donor_name: null, kana_name: null, contact: null, program: null, amount: 10000, currency: "JPY", channel: "yucho", status: "pending", submitted_at: "2026-11-10T03:00:00Z", matched_line_id: null, matched_at: null, notes: null, ...over,
  });
  it("menormalkan katakana lebar setengah dan hiragana", () => {
    expect(normalizeName("ﾀﾅｶ ﾕｽﾌ")).toBe(normalizeName("タナカ　ユスフ"));
    expect(normalizeName("たなか")).toBe("タナカ");
    expect(nameSimilarity("ﾀﾅｶ ﾕｽﾌ", "タナカ ユスフ")).toBe(1);
    expect(nameSimilarity("スズキ ケンジ", "タナカ ユスフ")).toBeLessThan(0.3);
  });
  it("Rupiah cocok lewat nominal unik dalam 0-2 hari", () => {
    const d = don({ currency: "IDR", amount: 100027, channel: "qris" });
    expect(autoMatch([{ amount: 100027, currency: "IDR", occurred_on: "2026-11-11", sender_name: null }], [d])).toEqual([{ lineIndex: 0, donationId: "d1" }]);
    expect(autoMatch([{ amount: 100027, currency: "IDR", occurred_on: "2026-11-20", sender_name: null }], [d])).toEqual([]);
    expect(autoMatch([{ amount: 100000, currency: "IDR", occurred_on: "2026-11-11", sender_name: null }], [d])).toEqual([]);
  });
  it("Yen butuh nominal, tanggal, dan nama yang mirip", () => {
    const d = don({ kana_name: "タナカ ユスフ" });
    const line = { amount: 10000, currency: "JPY" as const, occurred_on: "2026-11-11" };
    expect(autoMatch([{ ...line, sender_name: "ﾀﾅｶ ﾕｽﾌ" }], [d])).toHaveLength(1);
    expect(autoMatch([{ ...line, sender_name: "ｽｽﾞｷ ｹﾝｼﾞ" }], [d])).toHaveLength(0);
    expect(candidatesFor({ ...line, sender_name: "ｽｽﾞｷ ｹﾝｼﾞ" }, [d])).toHaveLength(1);
  });
  it("satu donasi hanya untuk satu baris mutasi, dan yang sudah cocok dilewati", () => {
    const d = don({ currency: "IDR", amount: 50123 });
    const lines = [1, 2].map(() => ({ amount: 50123, currency: "IDR" as const, occurred_on: "2026-11-10", sender_name: null }));
    expect(autoMatch(lines, [d])).toHaveLength(1);
    expect(autoMatch(lines, [don({ currency: "IDR", amount: 50123, status: "matched" })])).toHaveLength(0);
  });
});

describe("ruangan, tagihan, surat, waktu", () => {
  const booking = { id: "b1", created_at: "", room_id: "r1", purpose: "", organizer_name: "", contact: null, attendees: null, starts_at: "2026-11-25T01:00:00Z", ends_at: "2026-11-25T03:00:00Z", status: "approved" as const, decision_note: null, decided_by: null, source: "internal" as const };
  it("mendeteksi bentrok jadwal ruangan", () => {
    expect(findConflict({ room_id: "r1", starts_at: "2026-11-25T02:00:00Z", ends_at: "2026-11-25T04:00:00Z" }, [booking])).toBeDefined();
    expect(findConflict({ room_id: "r1", starts_at: "2026-11-25T03:00:00Z", ends_at: "2026-11-25T04:00:00Z" }, [booking])).toBeUndefined();
    expect(findConflict({ room_id: "r2", starts_at: "2026-11-25T02:00:00Z", ends_at: "2026-11-25T04:00:00Z" }, [booking])).toBeUndefined();
    expect(findConflict({ room_id: "r1", starts_at: "2026-11-25T02:00:00Z", ends_at: "2026-11-25T04:00:00Z" }, [{ ...booking, status: "requested" }])).toBeUndefined();
    expect(findConflict({ id: "b1", room_id: "r1", starts_at: "2026-11-25T02:00:00Z", ends_at: "2026-11-25T04:00:00Z" }, [booking])).toBeUndefined();
  });
  it("jatuh tempo berikutnya mengikuti frekuensi", () => {
    expect(nextDue({ next_due: "2026-01-31", frequency: "monthly" })).toBe("2026-02-28");
    expect(nextDue({ next_due: "2026-11-15", frequency: "quarterly" })).toBe("2027-02-15");
    expect(addMonths("2026-12-10", 1)).toBe("2027-01-10");
  });
  it("nomor surat berurutan per tahun", () => {
    expect(letterNumber([], "UND", "2026-11-21")).toBe("001/ACC/UND/XI/2026");
    expect(letterNumber(["001/ACC/UND/XI/2026", "002/ACC/KET/XI/2026", "009/ACC/UND/I/2025"], "ket", "2026-12-01")).toBe("003/ACC/KET/XII/2026");
  });
  it("isian templat surat", () => {
    expect(placeholders("Yth. {{nama}} di {{ tempat }}, {{nama}}")).toEqual(["nama", "tempat"]);
    expect(renderLetter("Yth. {{nama}} di {{ tempat }}", { nama: "Ahmad" })).toBe("Yth. Ahmad di ");
  });
  it("waktu memakai Asia/Tokyo", () => {
    expect(dateJst(new Date("2026-11-20T16:00:00Z"))).toBe("2026-11-21");
    expect(jstLocalToIso("2026-11-21T10:00")).toBe("2026-11-21T01:00:00.000Z");
    expect(isoToJstLocal("2026-11-21T01:00:00.000Z")).toBe("2026-11-21T10:00");
  });
});
