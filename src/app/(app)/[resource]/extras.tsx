import { FileSpreadsheet, Globe, Landmark } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ActionButton, ActionForm } from "@/components/client";
import { Badge, Card, LinkButton, inputClass, labelClass } from "@/components/ui";
import { billToExpense, confirmBooking, decideBooking, decideExpense, markDonorPaid, payExpense, setIssueStatus } from "@/lib/actions/workflow";
import { db } from "@/lib/db";
import { dateJst, formatMoney, monthJst } from "@/lib/format";
import { accountBalance, budgetRealization } from "@/lib/logic/cash";
import { canWrite, type Module } from "@/lib/permissions";
import { publicWebMode } from "@/lib/publicweb/store";
import type { AnyRow, Locale, Profile } from "@/lib/types";

export interface Extras {
  header?: ReactNode;
  rowActions?: (row: AnyRow) => ReactNode;
  canEdit?: (row: AnyRow) => boolean;
  formHint?: string;
}

/** Tambahan per modul di atas tampilan generik: ringkasan dan tombol alur kerja. */
export async function getExtras(key: Module, user: Profile): Promise<Extras> {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const role = user.role;

  switch (key) {
    case "kas": {
      const [accounts, entries] = await Promise.all([db.list("accounts"), db.list("cash_entries")]);
      return {
        canEdit: (row) => row.source === "manual" || row.source === "import",
        header: (
          <div className="mb-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-muted">{t("kas.balances")}</h2>
              <div className="no-print flex flex-wrap gap-2">
                <LinkButton href="/akun" variant="outline" size="sm">
                  <Landmark aria-hidden strokeWidth={1.5} className="size-4" />
                  {t("nav.modules.akun")}
                </LinkButton>
                {role === "bendahara" ? (
                  <LinkButton href="/kas/impor" variant="outline" size="sm">
                    <FileSpreadsheet aria-hidden strokeWidth={1.5} className="size-4" />
                    {t("kas.import")}
                  </LinkButton>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((a) => (
                <Card key={a.id} className="bg-surface">
                  <p className="text-sm text-muted">{a.name}</p>
                  <p className="tabular mt-1 text-2xl font-semibold">{formatMoney(accountBalance(a, entries), a.currency, locale)}</p>
                </Card>
              ))}
            </div>
          </div>
        ),
      };
    }
    case "anggaran": {
      const [budgets, entries] = await Promise.all([db.list("budgets"), db.list("cash_entries")]);
      return {
        header: (
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {budgets.map((b) => {
              const r = budgetRealization(b, entries);
              return (
                <Card key={b.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium">{b.program} <span className="text-sm font-normal text-muted">{b.year}</span></p>
                    <p className="tabular text-sm font-medium">{r.percent}%</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.min(r.percent, 100)} aria-valuemin={0} aria-valuemax={100} aria-label={b.program}>
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(r.percent, 100)}%` }} />
                  </div>
                  <p className="tabular mt-2 text-sm text-muted">
                    {t("anggaran.spent", { amount: formatMoney(r.spent, b.currency, locale) })} {t("anggaran.of", { amount: formatMoney(Number(b.amount), b.currency, locale) })}
                  </p>
                  <p className={`tabular text-sm ${r.remaining < 0 ? "text-danger" : "text-muted"}`}>{t("anggaran.remaining", { amount: formatMoney(r.remaining, b.currency, locale) })}</p>
                </Card>
              );
            })}
          </div>
        ),
      };
    }
    case "pengajuan": {
      const accounts = role === "bendahara" ? await db.list("accounts") : [];
      return {
        canEdit: (row) => row.status === "submitted" && row.requested_by === user.id,
        header: <p className="mb-6 max-w-3xl rounded-lg bg-surface p-4 text-sm text-muted">{t("expense.flowHint")}</p>,
        rowActions: (row) => {
          if (role === "direktur" && row.status === "submitted")
            return (
              <>
                <ActionButton action={decideExpense} payload={{ id: row.id, decision: "approved" as const }} variant="primary">{t("expense.approve")}</ActionButton>
                <ActionButton action={decideExpense} payload={{ id: row.id, decision: "rejected" as const }} variant="danger" askNote={t("common.note")}>{t("expense.reject")}</ActionButton>
              </>
            );
          if (role === "bendahara" && row.status === "approved")
            return (
              <details className="w-full min-w-64 text-left">
                <summary className="cursor-pointer text-sm font-medium text-accent">{t("expense.pay")}</summary>
                <ActionForm action={payExpense} submitLabel={t("expense.markPaid")} className="mt-3 grid gap-3">
                  <input type="hidden" name="id" value={row.id} />
                  <label className="block">
                    <span className={labelClass}>{t("expense.account")}</span>
                    <select name="account_id" required className={inputClass}>
                      {accounts.filter((a) => a.currency === row.currency).map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className={labelClass}>{t("expense.paidOn")}</span>
                    <input type="date" name="paid_on" required defaultValue={dateJst()} className={inputClass} />
                  </label>
                  <label className="block">
                    <span className={labelClass}>{t("expense.receipt")}</span>
                    <input type="file" name="receipt" accept="image/jpeg,image/png,image/webp,application/pdf" className={`${inputClass} py-2`} />
                  </label>
                </ActionForm>
              </details>
            );
          if (row.decision_note) return <span className="text-xs text-muted">{t("expense.decisionNote", { note: String(row.decision_note) })}</span>;
          return null;
        },
      };
    }
    case "tagihan":
      return {
        rowActions: (row) => (role === "bendahara" && row.active ? <ActionButton action={billToExpense} payload={{ id: row.id }}>{t("tagihan.request")}</ActionButton> : null),
      };
    case "donatur": {
      const month = monthJst();
      return {
        rowActions: (row) => {
          const paid = String(row.last_paid_on ?? "").slice(0, 7) === month;
          return (
            <>
              <Badge tone={paid ? "success" : "warning"}>{paid ? t("donatur.paid") : t("donatur.notPaid")}</Badge>
              {!paid && role === "bendahara" ? <ActionButton action={markDonorPaid} payload={{ id: row.id }}>{t("donatur.markPaid")}</ActionButton> : null}
            </>
          );
        },
      };
    }
    case "ruangan":
      return {
        rowActions: (row) => {
          const origin = row.source === "public" ? <Badge tone="primary">{t("web.fromSite")}</Badge> : null;
          if (role === "direktur" && row.status === "requested")
            return (
              <>
                {origin}
                <ActionButton action={decideBooking} payload={{ id: row.id, decision: "approved" as const }} variant="primary">{t("ruangan.approve")}</ActionButton>
                <ActionButton action={decideBooking} payload={{ id: row.id, decision: "declined" as const }} variant="danger" askNote={t("common.note")}>{t("ruangan.decline")}</ActionButton>
              </>
            );
          if (role === "fasilitas" && row.status === "approved")
            return (
              <>
                {origin}
                <ActionButton action={confirmBooking} payload={{ id: row.id }} variant="primary">{t("ruangan.confirm")}</ActionButton>
              </>
            );
          return origin;
        },
      };
    case "kerusakan":
      return {
        rowActions: (row) =>
          row.status === "open" ? (
            <ActionButton action={setIssueStatus} payload={{ id: row.id, status: "in_progress" as const }}>{t("kerusakan.start")}</ActionButton>
          ) : row.status === "in_progress" ? (
            <ActionButton action={setIssueStatus} payload={{ id: row.id, status: "done" as const }} variant="primary">{t("kerusakan.finish")}</ActionButton>
          ) : null,
      };
    case "kegiatan": {
      if (publicWebMode === "off" || !canWrite(role, "agenda")) return {};
      return {
        header: <p className="mb-6 max-w-3xl rounded-lg bg-surface p-4 text-sm text-muted">{t("web.eventHint")}</p>,
        rowActions: (row) =>
          row.public_ref ? (
            <LinkButton href={`/web/agenda?edit=${String(row.public_ref)}`} variant="ghost" size="sm">
              <Globe aria-hidden strokeWidth={1.5} className="size-4 text-success" />
              {t("web.eventLinked")}
            </LinkButton>
          ) : (
            <LinkButton href={`/web/agenda?dari=${row.id}`} variant="outline" size="sm">
              <Globe aria-hidden strokeWidth={1.5} className="size-4" />
              {t("web.eventPublish")}
            </LinkButton>
          ),
      };
    }
    case "templat":
      return { formHint: t("surat.templateHint") };
    default:
      return {};
  }
}
