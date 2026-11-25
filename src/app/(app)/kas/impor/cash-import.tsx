"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { Card, buttonClass, inputClass, labelClass } from "@/components/ui";
import { importCashRows, parseCashFile, type ParsedFile } from "@/lib/actions/workflow";
import { parseAmount, parseDate } from "@/lib/logic/importer";
import { CASH_CATEGORIES } from "@/lib/resources";

type Mode = "signed" | "in" | "out";
const NONE = -1;

/** Impor kas tiga langkah: unggah file, cocokkan kolom, pratinjau lalu simpan. */
export function CashImport({ accounts }: { accounts: { id: string; name: string }[] }) {
  const t = useTranslations();
  const [pending, start] = useTransition();
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [account, setAccount] = useState(accounts[0]?.id ?? "");
  const [cols, setCols] = useState({ date: NONE, description: NONE, amount: NONE, amountIn: NONE, amountOut: NONE });
  const [mode, setMode] = useState<Mode>("signed");
  const [catIn, setCatIn] = useState<string>("other_income");
  const [catOut, setCatOut] = useState<string>("other_expense");
  const fail = (key: string) => setError(t.has(key) ? t(key) : t("errors.internal"));

  const mapped = useMemo(() => {
    if (!file) return { rows: [], skipped: 0 };
    const rows: { entry_date: string; type: "in" | "out"; amount: number; description: string; category: string }[] = [];
    let skipped = 0;
    for (const r of file.rows) {
      const entry_date = cols.date >= 0 ? parseDate(r[cols.date]) : null;
      let type: "in" | "out" | null = null;
      let amount = 0;
      const amtIn = cols.amountIn >= 0 ? parseAmount(r[cols.amountIn]) : null;
      const amtOut = cols.amountOut >= 0 ? parseAmount(r[cols.amountOut]) : null;
      const single = cols.amount >= 0 ? parseAmount(r[cols.amount]) : null;
      if (amtIn) [type, amount] = ["in", Math.abs(amtIn)];
      else if (amtOut) [type, amount] = ["out", Math.abs(amtOut)];
      else if (single) [type, amount] = [mode === "signed" ? (single < 0 ? "out" : "in") : mode, Math.abs(single)];
      const description = cols.description >= 0 ? (r[cols.description] ?? "").trim() : "";
      if (!entry_date || !type || !amount || !description) {
        skipped++;
        continue;
      }
      rows.push({ entry_date, type, amount, description: description.slice(0, 300), category: type === "in" ? catIn : catOut });
    }
    return { rows, skipped };
  }, [file, cols, mode, catIn, catOut]);

  const column = (key: keyof typeof cols, label: string) => (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select value={cols[key]} onChange={(e) => setCols({ ...cols, [key]: Number(e.target.value) })} className={inputClass}>
        <option value={NONE}>{t("kas.colNone")}</option>
        {file?.headers.map((h, i) => (
          <option key={i} value={i}>
            {h}
          </option>
        ))}
      </select>
    </label>
  );
  const category = (value: string, set: (v: string) => void, label: string) => (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)} className={inputClass}>
        {CASH_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t(`options.${c}`)}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-4 font-semibold">{t("kas.step1")}</h2>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            setError(null);
            setResult(null);
            start(async () => {
              const res = await parseCashFile(data);
              if (!res.ok) return fail(res.error.message);
              const g = res.data.guess;
              setFile(res.data);
              setCols({ date: g.date ?? NONE, description: g.description ?? g.name ?? NONE, amount: g.amount ?? NONE, amountIn: g.amount_in ?? NONE, amountOut: g.amount_out ?? NONE });
            });
          }}
        >
          <label className="block flex-1">
            <span className={labelClass}>{t("kas.file")}</span>
            <input type="file" name="file" required accept=".xlsx,.csv,.txt" className={`${inputClass} py-2`} />
          </label>
          <button type="submit" disabled={pending} className={buttonClass("primary")}>
            {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            {t("kas.read")}
          </button>
        </form>
      </Card>

      {file ? (
        <Card>
          <h2 className="mb-4 font-semibold">{t("kas.step2")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className={labelClass}>{t("kas.account")}</span>
              <select value={account} onChange={(e) => setAccount(e.target.value)} className={inputClass}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            {column("date", t("kas.colDate"))}
            {column("description", t("kas.colDescription"))}
            {column("amountIn", t("kas.colIn"))}
            {column("amountOut", t("kas.colOut"))}
            {column("amount", t("kas.colAmount"))}
            <label className="block">
              <span className={labelClass}>{t("kas.amountMode")}</span>
              <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className={inputClass}>
                <option value="signed">{t("kas.signed")}</option>
                <option value="in">{t("options.in")}</option>
                <option value="out">{t("options.out")}</option>
              </select>
            </label>
            {category(catIn, setCatIn, t("kas.categoryIn"))}
            {category(catOut, setCatOut, t("kas.categoryOut"))}
          </div>
        </Card>
      ) : null}

      {file ? (
        <Card>
          <h2 className="mb-2 font-semibold">{t("kas.step3")}</h2>
          <p className="mb-4 text-sm text-muted">{t("kas.previewHint", { valid: mapped.rows.length, skipped: mapped.skipped })}</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  {(["entry_date", "description", "type", "category", "amount"] as const).map((f) => (
                    <th key={f} scope="col" className="px-3 py-2 font-medium">
                      {t(`fields.${f}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mapped.rows.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="tabular px-3 py-2">{r.entry_date}</td>
                    <td className="px-3 py-2">{r.description}</td>
                    <td className="px-3 py-2">{t(`options.${r.type}`)}</td>
                    <td className="px-3 py-2">{t(`options.${r.category}`)}</td>
                    <td className="tabular px-3 py-2 text-right">{r.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            disabled={pending || !mapped.rows.length || !account}
            className={`${buttonClass("primary")} mt-4`}
            onClick={() => {
              setError(null);
              start(async () => {
                const res = await importCashRows({ account_id: account, rows: mapped.rows });
                if (!res.ok) return fail(res.error.message);
                setResult(t("kas.result", res.data));
                setFile(null);
              });
            }}
          >
            {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            {t("kas.submit", { count: mapped.rows.length })}
          </button>
        </Card>
      ) : null}

      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      {result ? <p role="status" className="rounded-lg bg-surface p-4 text-sm text-success">{result}</p> : null}
    </div>
  );
}
