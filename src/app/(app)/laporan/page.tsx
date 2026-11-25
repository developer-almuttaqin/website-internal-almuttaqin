import { Download } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ActionButton, PrintButton } from "@/components/client";
import { Badge, Card, PageHeader, buttonClass, inputClass, labelClass } from "@/components/ui";
import { publishTransparency, unpublishTransparency } from "@/lib/actions/publicweb";
import { db } from "@/lib/db";
import { formatDateTime, formatMoney, monthJst } from "@/lib/format";
import { accountBalance, categoryTotals, monthTotals } from "@/lib/logic/cash";
import { canWrite } from "@/lib/permissions";
import { monthlyStatement } from "@/lib/publicweb/content";
import { canRefreshPublicSite, publicSiteUrl, publicStore, publicWebMode } from "@/lib/publicweb/store";
import { requireModule } from "@/lib/session";
import { CURRENCIES, type Locale } from "@/lib/types";

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ bulan?: string }> }) {
  const user = await requireModule("laporan");
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const requested = (await searchParams).bulan;
  const month = requested && /^\d{4}-\d{2}$/.test(requested) ? requested : monthJst();
  const [accounts, entries] = await Promise.all([db.list("accounts"), db.list("cash_entries")]);
  const totals = monthTotals(entries, month);
  const categories = categoryTotals(entries, month);

  // Laporan transparansi di web publik: diterbitkan dari buku kas Yen bulan ini, tanpa diketik ulang.
  const statement = monthlyStatement(accounts, entries, month, "JPY");
  let published: { at: string; closing: number } | null = null;
  let publicFailed = false;
  if (publicWebMode !== "off") {
    try {
      const row = (await publicStore().list("content_items", { collection: "transparency_reports", item_key: month }))[0];
      const data = (row?.data ?? {}) as { publishedAt?: string; closingBalance?: number };
      if (row?.published) published = { at: String(row.updated_at ?? data.publishedAt ?? ""), closing: Number(data.closingBalance) || 0 };
    } catch {
      publicFailed = true;
    }
  }
  const canPublish = canWrite(user.role, "transparansi") && publicWebMode !== "off" && !publicFailed && month <= monthJst();

  return (
    <div className="print-page">
      <PageHeader
        tag={t("laporan.tag")}
        title={t("laporan.titleA")}
        accent={t("laporan.titleB")}
        description={`${t("app.name")} · ${month} · ${t("laporan.currencyNote")}`}
        actions={
          <>
            <a href={`/api/export/kas?bulan=${month}`} className={buttonClass("outline", "sm")}>
              <Download aria-hidden strokeWidth={1.5} className="size-4" />
              {t("common.export")}
            </a>
            <PrintButton label={t("common.print")} />
          </>
        }
      />
      <form action="/laporan" className="no-print mb-6 flex items-end gap-2">
        <label className="block">
          <span className={labelClass}>{t("laporan.month")}</span>
          <input type="month" name="bulan" defaultValue={month} className={inputClass} />
        </label>
        <button type="submit" className={buttonClass("outline")}>
          {t("laporan.show")}
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {CURRENCIES.map((c) => {
          const rows = categories.filter((r) => r.currency === c);
          return (
            <Card key={c}>
              <h2 className="text-lg font-semibold">{t(`options.${c}`)}</h2>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                {(
                  [
                    ["income", totals[c].in],
                    ["expense", totals[c].out],
                    ["net", totals[c].in - totals[c].out],
                  ] as const
                ).map(([key, value]) => (
                  <div key={key} className="rounded-md bg-surface p-3">
                    <dt className="text-muted">{t(`laporan.${key}`)}</dt>
                    <dd className={`tabular mt-1 font-semibold ${key === "net" && value < 0 ? "text-danger" : ""}`}>{formatMoney(value, c, locale)}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-6 text-sm font-medium text-muted">{t("laporan.byCategory")}</h3>
              {rows.length === 0 ? (
                <p className="mt-2 text-sm text-muted">{t("laporan.noData")}</p>
              ) : (
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {rows.map((r) => (
                      <tr key={`${r.type}-${r.category}`} className="border-t border-border">
                        <td className="py-2">{t(`options.${r.category}`)}</td>
                        <td className="py-2 text-muted">{t(`options.${r.type}`)}</td>
                        <td className="tabular py-2 text-right font-medium">{formatMoney(r.amount, c, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="no-print mt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-semibold">{t("web.transparency.title")}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">{t("web.transparency.hint")}</p>
          </div>
          <Badge tone={published ? "success" : "neutral"}>{published ? t("web.transparency.published") : t("web.transparency.notPublished")}</Badge>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
          {(
            [
              ["opening", statement.opening],
              ["income", statement.income.reduce((sum, i) => sum + i.amount, 0)],
              ["expense", statement.expense.reduce((sum, i) => sum + i.amount, 0)],
              ["closing", statement.closing],
            ] as const
          ).map(([key, value]) => (
            <div key={key} className="rounded-md bg-surface p-3">
              <dt className="text-muted">{t(`web.transparency.${key}`)}</dt>
              <dd className="tabular mt-1 font-semibold">{formatMoney(value, "JPY", locale)}</dd>
            </div>
          ))}
        </dl>
        {publicWebMode === "off" || publicFailed ? (
          <p className="mt-4 text-sm text-muted">{t(publicFailed ? "web.errors.failed" : "web.errors.off")}</p>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {canPublish ? (
              <ActionButton action={publishTransparency} payload={{ month }} variant="primary" confirm={t("web.transparency.confirm", { month })}>
                {published ? t("web.transparency.republish") : t("web.transparency.publish")}
              </ActionButton>
            ) : null}
            {published && canPublish ? (
              <ActionButton action={unpublishTransparency} payload={{ month }} variant="danger" confirm={t("web.transparency.confirmUnpublish")}>
                {t("web.transparency.unpublish")}
              </ActionButton>
            ) : null}
            {published ? (
              <a href={`${publicSiteUrl}/id/transparency`} target="_blank" rel="noreferrer" className="text-sm text-accent underline-offset-2 hover:underline">
                {t("web.viewOnSite")}
              </a>
            ) : null}
            <p className="w-full text-xs text-muted">
              {published ? `${t("web.transparency.publishedAt", { date: formatDateTime(published.at, locale) })} ` : ""}
              {published && published.closing !== statement.closing ? `${t("web.transparency.outdated")} ` : ""}
              {t(canRefreshPublicSite || publicWebMode === "demo" ? "web.hub.instant" : "web.hub.cached")}
            </p>
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">{t("laporan.balances")}</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="py-2">{a.name}</td>
                <td className="tabular py-2 text-right font-medium">{formatMoney(accountBalance(a, entries), a.currency, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
