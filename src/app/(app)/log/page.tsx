import { getLocale, getTranslations } from "next-intl/server";
import { EmptyState, PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { requireModule } from "@/lib/session";
import type { Locale } from "@/lib/types";

export default async function LogPage() {
  await requireModule("log");
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const logs = (await db.list("activity_logs")).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 200);

  return (
    <>
      <PageHeader tag={t("nav.groups.admin")} title={t("nav.modules.log")} description={t("common.count", { count: logs.length })} />
      {logs.length === 0 ? (
        <EmptyState title={t("common.empty")} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                {(["time", "actor", "action", "detail"] as const).map((k) => (
                  <th key={k} scope="col" className="px-4 py-3 font-medium">
                    {t(`log.${k}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="tabular whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(l.created_at, locale)}</td>
                  <td className="px-4 py-3">{l.actor_name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                  <td className="px-4 py-3 text-muted">{l.summary ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
