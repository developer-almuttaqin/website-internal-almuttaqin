import { Settings2 } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ActionForm } from "@/components/client";
import { Card, EmptyState, LinkButton, PageHeader, inputClass, labelClass } from "@/components/ui";
import { createLetter } from "@/lib/actions/workflow";
import { db } from "@/lib/db";
import { dateJst, formatDate } from "@/lib/format";
import { placeholders } from "@/lib/logic/misc";
import { canWrite } from "@/lib/permissions";
import { requireModule } from "@/lib/session";
import type { Locale } from "@/lib/types";

const pretty = (key: string) => key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export default async function LettersPage({ searchParams }: { searchParams: Promise<{ templat?: string }> }) {
  const user = await requireModule("surat");
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const writable = canWrite(user.role, "surat");
  const [templates, letters] = await Promise.all([db.list("letter_templates"), db.list("letters")]);
  const { templat } = await searchParams;
  const selected = templates.find((tpl) => tpl.id === templat);
  const sorted = [...letters].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <PageHeader
          tag={t("nav.groups.admin")}
          title={t("nav.modules.surat")}
          description={t("surat.hint")}
          actions={
            writable ? (
              <LinkButton href="/templat" variant="outline" size="sm">
                <Settings2 aria-hidden strokeWidth={1.5} className="size-4" />
                {t("surat.manageTemplates")}
              </LinkButton>
            ) : null
          }
        />
        {writable ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((tpl) => (
              <Link key={tpl.id} href={`/surat?templat=${tpl.id}`} aria-current={selected?.id === tpl.id ? "true" : undefined} className={`rounded-lg border p-4 hover:bg-surface ${selected?.id === tpl.id ? "border-primary bg-primary-soft" : "border-border"}`}>
                <p className="text-xs font-medium text-muted">{tpl.code}</p>
                <p className="mt-1 font-medium">{tpl.name}</p>
                <p className="mt-2 text-sm text-accent">{t("surat.pick")}</p>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {writable && selected ? (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">
            {t("surat.newTitle")}: {selected.name}
          </h2>
          <ActionForm key={selected.id} action={createLetter} submitLabel={t("surat.create")} redirectTo="/surat/{id}">
            <input type="hidden" name="template_id" value={selected.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>{t("surat.subject")}</span>
                <input name="subject" required defaultValue={selected.name} className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>{t("surat.issuedOn")}</span>
                <input type="date" name="issued_on" required defaultValue={dateJst()} className={inputClass} />
              </label>
              <p className="text-sm font-medium text-muted sm:col-span-2">{t("surat.fill")}</p>
              {placeholders(selected.body).map((key) => (
                <label key={key} className="block">
                  <span className={labelClass}>{pretty(key)}</span>
                  <input name={`f_${key}`} required className={inputClass} />
                </label>
              ))}
            </div>
          </ActionForm>
        </Card>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("surat.listTitle")}</h2>
        {sorted.length === 0 ? (
          <EmptyState title={t("common.empty")} hint={t("common.emptyHint")} />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {sorted.map((l) => (
              <li key={l.id}>
                <Link href={`/surat/${l.id}`} className="flex flex-col gap-1 px-4 py-3 hover:bg-surface sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium">{l.subject}</span>
                  <span className="tabular text-sm text-muted">
                    {l.number} · {formatDate(l.issued_on, locale)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
