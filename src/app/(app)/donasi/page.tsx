import { getLocale, getTranslations } from "next-intl/server";
import { ActionButton, ActionForm } from "@/components/client";
import { ResourceView, type SearchParams } from "@/components/resource-view";
import { Badge, Card, inputClass, labelClass } from "@/components/ui";
import { importStatement, markDonation, matchLine, resolveLine } from "@/lib/actions/workflow";
import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { candidatesFor } from "@/lib/logic/matching";
import { RESOURCES } from "@/lib/resources";
import { requireModule } from "@/lib/session";
import type { Locale } from "@/lib/types";

export default async function DonationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireModule("donasi");
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const treasurer = user.role === "bendahara";
  const [accounts, lines, donations] = await Promise.all([db.list("accounts"), db.list("statement_lines"), db.list("donations")]);
  const queue = lines.filter((l) => l.status === "unmatched").sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));

  const header = (
    <div className="mb-8 flex flex-col gap-8">
      <div>
        <p className="mb-6 max-w-3xl rounded-lg bg-surface p-4 text-sm text-muted">{t("donasi.hint")}</p>
        {treasurer ? (
          <Card>
            <h2 className="mb-4 font-semibold">{t("donasi.importTitle")}</h2>
            <ActionForm action={importStatement} submitLabel={t("donasi.importSubmit")} successText={t.raw("donasi.importResult") as string}>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className={labelClass}>{t("donasi.source")}</span>
                  <select name="source" required className={inputClass}>
                    <option value="qris_report">{t("options.qris_report")}</option>
                    <option value="yucho_csv">{t("options.yucho_csv")}</option>
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>{t("donasi.account")}</span>
                  <select name="account_id" required className={inputClass}>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>{t("donasi.file")}</span>
                  <input type="file" name="file" required accept=".csv,.txt,.xlsx" className={`${inputClass} py-2`} />
                </label>
              </div>
            </ActionForm>
          </Card>
        ) : null}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          {t("donasi.queueTitle")} <span className="tabular text-muted">({queue.length})</span>
        </h2>
        {queue.length === 0 ? (
          <p className="rounded-lg bg-surface p-4 text-sm text-muted">{t("donasi.queueEmpty")}</p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {queue.map((line) => {
              const candidates = candidatesFor(line, donations, 14).slice(0, 3);
              return (
                <li key={line.id}>
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="tabular text-lg font-semibold">{formatMoney(Number(line.amount), line.currency, locale)}</p>
                        <p className="text-sm text-muted">{[formatDate(line.occurred_on, locale), line.sender_name, line.description].filter(Boolean).join(" · ")}</p>
                      </div>
                      <Badge tone="warning">{t("options.unmatched")}</Badge>
                    </div>
                    <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted">{t("donasi.candidates")}</p>
                    {candidates.length === 0 ? (
                      <p className="mt-1 text-sm text-muted">{t("donasi.noCandidates")}</p>
                    ) : (
                      <ul className="mt-1 flex flex-col divide-y divide-border">
                        {candidates.map(({ donation, score }) => (
                          <li key={donation.id} className="flex items-center justify-between gap-3 py-2">
                            <div className="min-w-0 text-sm">
                              <p className="truncate font-medium">{donation.donor_name ?? "-"} {donation.kana_name ? <span className="font-normal text-muted">{donation.kana_name}</span> : null}</p>
                              <p className="text-muted">{donation.reference_code} · {formatDate(donation.submitted_at, locale)}{line.currency === "JPY" ? ` · ${t("donasi.score", { score: Math.round(score * 100) })}` : ""}</p>
                            </div>
                            {treasurer ? <ActionButton action={matchLine} payload={{ lineId: line.id, donationId: donation.id }} variant="primary">{t("donasi.match")}</ActionButton> : null}
                          </li>
                        ))}
                      </ul>
                    )}
                    {treasurer ? (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                        <ActionButton action={resolveLine} payload={{ lineId: line.id, as: "anonymous" as const }}>{t("donasi.asAnonymous")}</ActionButton>
                        <ActionButton action={resolveLine} payload={{ lineId: line.id, as: "ignored" as const }} variant="ghost" confirm={t("common.confirm")}>{t("donasi.ignore")}</ActionButton>
                      </div>
                    ) : null}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <h2 className="-mb-4 text-lg font-semibold">{t("donasi.listTitle")}</h2>
    </div>
  );

  return (
      <ResourceView
        res={RESOURCES.donasi!}
        user={user}
        searchParams={await searchParams}
        header={header}
        canEdit={(row) => row.status === "pending"}
        rowActions={(row) =>
          treasurer && row.status === "pending" ? (
            <>
              <ActionButton action={markDonation} payload={{ id: row.id, status: "expired" as const }} variant="ghost" confirm={t("common.confirm")}>{t("donasi.markExpired")}</ActionButton>
              <ActionButton action={markDonation} payload={{ id: row.id, status: "rejected" as const }} variant="danger" confirm={t("common.confirm")}>{t("donasi.markRejected")}</ActionButton>
            </>
          ) : null
        }
      />
  );
}
