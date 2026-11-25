import type { Account, Budget, CashEntry, Currency } from "../types";

export interface Totals {
  in: number;
  out: number;
}
export type CurrencyTotals = Record<Currency, Totals>;

export function emptyTotals(): CurrencyTotals {
  return { JPY: { in: 0, out: 0 }, IDR: { in: 0, out: 0 } };
}

/** Kunci untuk menolak data ganda saat impor: tanggal, akun, jenis, nominal, keterangan. */
export function dedupeHash(e: Pick<CashEntry, "entry_date" | "account_id" | "type" | "amount" | "description">): string {
  return [e.entry_date, e.account_id, e.type, Math.round(e.amount * 100), e.description.trim().toLowerCase().replace(/\s+/g, " ")].join("|");
}

export function accountBalance(account: Account, entries: CashEntry[]): number {
  return entries
    .filter((e) => e.account_id === account.id)
    .reduce((sum, e) => sum + (e.type === "in" ? e.amount : -e.amount), Number(account.opening_balance) || 0);
}

/** Saldo per mata uang. Yen dan Rupiah tidak pernah dijumlahkan satu sama lain. */
export function balancesByCurrency(accounts: Account[], entries: CashEntry[]): Record<Currency, number> {
  const out: Record<Currency, number> = { JPY: 0, IDR: 0 };
  for (const a of accounts) out[a.currency] += accountBalance(a, entries);
  return out;
}

export function monthTotals(entries: CashEntry[], ym: string): CurrencyTotals {
  const t = emptyTotals();
  for (const e of entries) {
    if (e.entry_date.slice(0, 7) !== ym) continue;
    t[e.currency][e.type] += Number(e.amount);
  }
  return t;
}

export function categoryTotals(entries: CashEntry[], ym: string): { currency: Currency; type: "in" | "out"; category: string; amount: number }[] {
  const map = new Map<string, { currency: Currency; type: "in" | "out"; category: string; amount: number }>();
  for (const e of entries) {
    if (e.entry_date.slice(0, 7) !== ym) continue;
    const key = `${e.currency}|${e.type}|${e.category}`;
    const row = map.get(key) ?? { currency: e.currency, type: e.type, category: e.category, amount: 0 };
    row.amount += Number(e.amount);
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => a.currency.localeCompare(b.currency) || a.type.localeCompare(b.type) || b.amount - a.amount);
}

export function budgetRealization(budget: Budget, entries: CashEntry[]): { spent: number; remaining: number; percent: number } {
  const spent = entries
    .filter((e) => e.budget_id === budget.id && e.type === "out" && e.currency === budget.currency)
    .reduce((s, e) => s + Number(e.amount), 0);
  const amount = Number(budget.amount);
  return { spent, remaining: amount - spent, percent: amount > 0 ? Math.round((spent / amount) * 100) : 0 };
}
