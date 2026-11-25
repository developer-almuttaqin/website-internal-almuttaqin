import { CircleCheck, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { deletePublicRecord } from "@/lib/actions/publicweb";
import { formatDate, formatDateTime, formatNumber, isoToJstLocal } from "@/lib/format";
import { canWrite } from "@/lib/permissions";
import { pickL10n } from "@/lib/publicweb/content";
import { loadSection, type PubItem } from "@/lib/publicweb/read";
import { toFormValues, type PubField, type PubSection } from "@/lib/publicweb/sections";
import { publicSiteUrl, publicWebMode } from "@/lib/publicweb/store";
import type { Locale, Profile } from "@/lib/types";
import { ActionButton } from "./client";
import { PublicForm } from "./public-form";
import type { SearchParams } from "./resource-view";
import { Badge, Card, EmptyState, LinkButton, PageHeader, buttonClass } from "./ui";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
type Translate = Awaited<ReturnType<typeof getTranslations>>;

const TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "primary"> = {
  published: "success",
  draft: "warning",
  archived: "neutral",
  open: "success",
  closed: "neutral",
  completed: "primary",
  urgent: "danger",
};

function display(f: PubField, value: unknown, locale: Locale, t: Translate): ReactNode {
  if (f.type === "bool") return value ? <Badge tone="success">{t("common.yes")}</Badge> : <span className="text-muted">{t("common.no")}</span>;
  if (value === null || value === undefined || value === "") return <span className="text-muted">-</span>;
  switch (f.type) {
    case "ltext":
    case "ltextarea":
    case "lblocks":
      return pickL10n(value, locale) || <span className="text-muted">-</span>;
    case "date":
      return <span className="whitespace-nowrap">{formatDate(String(value), locale)}</span>;
    case "datetime":
      return <span className="whitespace-nowrap">{formatDateTime(String(value), locale)}</span>;
    case "number":
      return <span className="tabular">{formatNumber(Number(value), locale)}</span>;
    case "select": {
      const label = t(`web.options.${String(value)}`);
      return TONE[String(value)] ? <Badge tone={TONE[String(value)]}>{label}</Badge> : label;
    }
    default:
      return String(value);
  }
}

/** Petunjuk saat database web publik belum disambungkan. */
export async function PublicWebOff() {
  const t = await getTranslations("web");
  return (
    <Card className="border-primary">
      <h2 className="font-semibold">{t("off.title")}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">{t("off.hint")}</p>
      <ol className="mt-4 flex list-decimal flex-col gap-1 pl-5 text-sm">
        <li>{t("off.step1")}</li>
        <li>{t("off.step2")}</li>
        <li>{t("off.step3")}</li>
      </ol>
      <pre className="mt-4 overflow-x-auto rounded-md bg-surface p-3 text-xs">
        {["PUBLIC_WEB_SUPABASE_URL=", "PUBLIC_WEB_SUPABASE_SERVICE_ROLE_KEY=", "PUBLIC_WEB_URL=", "PUBLIC_WEB_REVALIDATE_SECRET="].join("\n")}
      </pre>
    </Card>
  );
}

/**
 * Tampilan sebuah bagian web publik: daftar isi yang sedang tampil ke jamaah, dan formulir untuk
 * menambah atau mengubahnya. Data dibaca dan ditulis langsung di database web publik.
 */
export async function PublicSectionView({ section, user, searchParams, prefill, from }: { section: PubSection; user: Profile; searchParams: SearchParams; prefill?: Record<string, string>; from?: string }) {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const base = `/web/${section.key}`;
  const writable = canWrite(user.role, section.module);
  const single = section.kind === "setting";
  const saved = one(searchParams.saved);
  const editId = one(searchParams.edit);
  const isNew = one(searchParams.new) === "1" || Boolean(prefill);

  const header = (actions?: ReactNode) => (
    <PageHeader tag={t("web.tag")} title={t(`nav.modules.${section.module}`)} description={t(`web.sections.${section.module}`)} actions={actions} />
  );
  if (publicWebMode === "off")
    return (
      <section>
        {header()}
        <PublicWebOff />
      </section>
    );

  let items: PubItem[];
  try {
    items = await loadSection(section);
  } catch {
    return (
      <section>
        {header()}
        <p role="alert" className="rounded-lg bg-primary-soft px-4 py-3 text-sm text-accent">{t("web.errors.failed")}</p>
      </section>
    );
  }
  if (section.sort) {
    const [by, dir] = section.sort;
    items.sort((a, b) => String(a.values[by] ?? "").localeCompare(String(b.values[by] ?? "")) * (dir === "asc" ? 1 : -1));
  }

  const editing = single ? items[0] : editId ? items.find((i) => i.id === editId) : undefined;
  const showForm = writable && (single || isNew || Boolean(editing));
  const initial = editing
    ? toFormValues(section, editing.values, isoToJstLocal)
    : { ...Object.fromEntries(section.fields.filter((f) => f.initial).map((f) => [f.name, f.initial!])), ...(prefill ?? {}) };
  const listFields = section.fields.filter((f) => f.list);
  const titleField = section.fields.find((f) => f.name === section.titleField) ?? listFields[0];
  const rest = listFields.filter((f) => f !== titleField);

  const controls = (item: PubItem) => (
    <span className="inline-flex flex-nowrap items-center justify-end">
      <Link href={`${base}?edit=${item.id}`} aria-label={t("common.edit")} title={t("common.edit")} className={`${buttonClass("ghost", "sm")} size-9 px-0`}>
        <Pencil aria-hidden strokeWidth={1.5} className="size-4" />
      </Link>
      <ActionButton action={deletePublicRecord} payload={{ section: section.key, id: item.id }} variant="ghost" confirm={t("web.confirmDelete")}>
        <Trash2 aria-hidden strokeWidth={1.5} className="size-4" />
        <span className="sr-only">{t("common.delete")}</span>
      </ActionButton>
    </span>
  );

  return (
    <section>
      {header(
        <>
          <a href={`${publicSiteUrl}/id${section.publicPath}`} target="_blank" rel="noreferrer" className={buttonClass("outline", "sm")}>
            <ExternalLink aria-hidden strokeWidth={1.5} className="size-4" />
            {t("web.viewOnSite")}
          </a>
          {writable && !single ? (
            <LinkButton href={`${base}?new=1`} size="sm">
              <Plus aria-hidden strokeWidth={1.5} className="size-4" />
              {t("common.add")}
            </LinkButton>
          ) : null}
        </>,
      )}

      {saved ? (
        <p role="status" className="mb-6 flex items-start gap-2 rounded-lg bg-surface px-4 py-3 text-sm">
          <CircleCheck aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-success" />
          {t(saved === "live" || publicWebMode === "demo" ? "web.savedLive" : "web.savedCached")}
        </p>
      ) : null}

      {showForm ? (
        <Card className="mb-6">
          <h2 className="mb-1 text-lg font-semibold">{single ? t("web.form.editSetting") : editing ? t("common.editItem") : t("common.newItem")}</h2>
          <p className="mb-4 text-sm text-muted">{t(single ? "web.form.settingHint" : "web.form.hint")}</p>
          <PublicForm key={editing?.id ?? "new"} section={section.key} id={single ? undefined : editing?.id} from={from} fields={section.fields} initial={initial} />
        </Card>
      ) : null}

      {single ? (
        writable ? null : (
          <Card>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {section.fields.map((f) => (
                <div key={f.name}>
                  <dt className="text-muted">{t(`web.fields.${f.name}`)}</dt>
                  <dd>{display(f, items[0]?.values[f.name], locale, t)}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )
      ) : items.length === 0 ? (
        <EmptyState title={t("common.empty")} hint={t("web.emptyHint")} />
      ) : (
        <>
          <ul className="flex flex-col gap-3 md:hidden">
            {items.map((item) => (
              <li key={item.id}>
                <Card className="p-4">
                  <p className="font-medium">{titleField ? display(titleField, item.values[titleField.name], locale, t) : item.id}</p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    {rest.map((f) => (
                      <div key={f.name} className="contents">
                        <dt className="text-muted">{t(`web.fields.${f.name}`)}</dt>
                        <dd className="min-w-0 break-words text-right">{display(f, item.values[f.name], locale, t)}</dd>
                      </div>
                    ))}
                  </dl>
                  {writable ? <div className="mt-3 flex justify-end border-t border-border pt-3">{controls(item)}</div> : null}
                </Card>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  {listFields.map((f) => (
                    <th key={f.name} scope="col" className="px-4 py-3 font-medium">
                      {t(`web.fields.${f.name}`)}
                    </th>
                  ))}
                  {writable ? (
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      {t("common.actions")}
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-border align-middle">
                    {listFields.map((f) => (
                      <td key={f.name} className="px-4 py-3">
                        {display(f, item.values[f.name], locale, t)}
                      </td>
                    ))}
                    {writable ? <td className="px-4 py-3 text-right">{controls(item)}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
