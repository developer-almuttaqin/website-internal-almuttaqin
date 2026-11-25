import { Download, Paperclip, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { deleteRecord } from "@/lib/actions/records";
import { db } from "@/lib/db";
import { formatDate, formatDateTime, formatMoney, formatNumber, isoToJstLocal } from "@/lib/format";
import { canWrite } from "@/lib/permissions";
import { STATUS_TONE, scopeRows, type FieldDef, type ResourceDef } from "@/lib/resources";
import type { AnyRow, Currency, Locale, Profile } from "@/lib/types";
import { ActionButton } from "./client";
import { RecordForm, type FormField } from "./record-form";
import { Badge, Card, EmptyState, LinkButton, PageHeader, buttonClass, inputClass } from "./ui";

const PAGE_SIZE = 50;

export type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

type Translate = Awaited<ReturnType<typeof getTranslations>>;

function display(f: FieldDef, row: AnyRow, res: ResourceDef, locale: Locale, t: Translate, refs: Record<string, Map<string, string>>): ReactNode {
  const v = row[f.name];
  if (v === null || v === undefined || v === "") return <span className="text-muted">-</span>;
  switch (f.type) {
    case "money":
      return <span className="tabular font-medium">{formatMoney(Number(v), ((res.currencyField && row[res.currencyField]) || "JPY") as Currency, locale)}</span>;
    case "number":
      return <span className="tabular">{f.name === "year" || f.name === "pay_day" ? String(v) : formatNumber(Number(v), locale)}</span>;
    case "date":
      return <span className="whitespace-nowrap">{formatDate(String(v), locale)}</span>;
    case "datetime":
      return <span className="whitespace-nowrap">{formatDateTime(String(v), locale)}</span>;
    case "select": {
      const label = t(`options.${String(v)}`);
      const tone = STATUS_TONE[String(v)];
      return tone ? <Badge tone={tone}>{label}</Badge> : label;
    }
    case "ref":
      return refs[f.name]?.get(String(v)) ?? "-";
    case "bool":
      return v ? t("common.yes") : t("common.no");
    case "file":
      return (
        <a href={`/api/files/${String(v)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent underline-offset-2 hover:underline">
          <Paperclip aria-hidden strokeWidth={1.5} className="size-4" />
          {t("common.view")}
        </a>
      );
    default:
      return String(v);
  }
}

/**
 * Tampilan generik sebuah modul: judul, pencarian, formulir tambah/ubah, dan daftar
 * (tabel di layar lebar, kartu di HP). Hak tulis dicek lagi di Server Action.
 */
export async function ResourceView({
  res,
  user,
  searchParams,
  header,
  rowActions,
  canEdit,
  formHint,
  filter,
  showHeader = true,
}: {
  res: ResourceDef;
  user: Profile;
  searchParams: SearchParams;
  header?: ReactNode;
  rowActions?: (row: AnyRow) => ReactNode;
  /** Baris yang tidak boleh diubah/dihapus (mis. sudah diputuskan) tidak menampilkan tombolnya. */
  canEdit?: (row: AnyRow) => boolean;
  formHint?: string;
  filter?: (row: AnyRow) => boolean;
  showHeader?: boolean;
}) {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const writable = canWrite(user.role, res.key);
  const base = `/${res.key}`;
  const q = one(searchParams.q).trim().toLowerCase();
  const editId = one(searchParams.edit);
  const isNew = one(searchParams.new) === "1";
  const page = Math.max(1, Number(one(searchParams.page)) || 1);

  const refFields = res.fields.filter((f) => f.type === "ref" && f.ref);
  const refRows = await Promise.all(refFields.map((f) => db.list(f.ref!)));
  const refs: Record<string, Map<string, string>> = {};
  const refOptions: Record<string, { value: string; label: string }[]> = {};
  refFields.forEach((f, i) => {
    const rows = refRows[i] as unknown as AnyRow[];
    refs[f.name] = new Map(rows.map((r) => [r.id, String(r[f.refLabel!] ?? r.id)]));
    refOptions[f.name] = rows.map((r) => ({ value: r.id, label: String(r[f.refLabel!] ?? r.id) }));
  });

  let rows = scopeRows(res.key, user, (await db.list(res.table)) as unknown as AnyRow[]);
  if (filter) rows = rows.filter(filter);
  const listFields = res.fields.filter((f) => f.list);
  if (q) {
    rows = rows.filter((r) =>
      res.fields.some((f) => {
        const v = r[f.name];
        if (v == null) return false;
        const text = f.type === "ref" ? refs[f.name]?.get(String(v)) : f.type === "select" ? t(`options.${String(v)}`) : String(v);
        return String(text ?? "").toLowerCase().includes(q);
      }),
    );
  }
  const [sortBy, dir] = res.sort;
  rows.sort((a, b) => String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? "")) * (dir === "asc" ? 1 : -1));
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const editing = editId ? rows.find((r) => r.id === editId && (canEdit?.(r) ?? true)) : undefined;
  const showForm = writable && (isNew || Boolean(editing));
  const formFields: FormField[] = res.fields.filter((f) => !f.readOnly).map((f) => ({ ...f, refOptions: refOptions[f.name] }));
  const initial: Record<string, string> = {};
  if (editing) for (const f of formFields) initial[f.name] = f.type === "datetime" && editing[f.name] ? isoToJstLocal(String(editing[f.name])) : String(editing[f.name] ?? "");

  const titleField = res.fields.find((f) => f.name === res.titleField) ?? listFields[0];
  const rest = listFields.filter((f) => f !== titleField);
  const pageHref = (p: number) => `${base}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  const controls = (row: AnyRow) => (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {rowActions?.(row)}
      {writable && (canEdit?.(row) ?? true) ? (
        <span className="inline-flex flex-nowrap items-center">
          <Link href={`${base}?edit=${row.id}`} aria-label={t("common.edit")} title={t("common.edit")} className={`${buttonClass("ghost", "sm")} size-9 px-0`}>
            <Pencil aria-hidden strokeWidth={1.5} className="size-4" />
          </Link>
          <ActionButton action={deleteRecord} payload={{ resource: res.key, id: row.id }} variant="ghost" confirm={t("common.confirmDelete")}>
            <Trash2 aria-hidden strokeWidth={1.5} className="size-4" />
            <span className="sr-only">{t("common.delete")}</span>
          </ActionButton>
        </span>
      ) : null}
    </div>
  );

  return (
    <section>
      {showHeader ? (
        <PageHeader
          tag={t(`nav.modules.${res.key}`)}
          title={t(`nav.modules.${res.key}`)}
          description={t("common.count", { count: total })}
          actions={
            <>
              <a href={`/api/export/${res.key}`} className={buttonClass("outline", "sm")}>
                <Download aria-hidden strokeWidth={1.5} className="size-4" />
                {t("common.export")}
              </a>
              {writable ? (
                <LinkButton href={`${base}?new=1`} size="sm">
                  <Plus aria-hidden strokeWidth={1.5} className="size-4" />
                  {t("common.add")}
                </LinkButton>
              ) : null}
            </>
          }
        />
      ) : null}
      {header}

      {showForm ? (
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">{editing ? t("common.editItem") : t("common.newItem")}</h2>
          <RecordForm key={editing?.id ?? "new"} resource={res.key} id={editing?.id} fields={formFields} initial={initial} hint={formHint} />
        </Card>
      ) : null}

      <form action={base} className="no-print mb-4 flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">{t("common.search")}</span>
          <Search aria-hidden strokeWidth={1.5} className="pointer-events-none absolute left-3 top-3 size-5 text-muted" />
          <input type="search" name="q" defaultValue={q} placeholder={t("common.searchPlaceholder")} className={`${inputClass} pl-10`} />
        </label>
        <button type="submit" className={buttonClass("outline")}>
          {t("common.search")}
        </button>
      </form>

      {visible.length === 0 ? (
        <EmptyState title={t("common.empty")} hint={t("common.emptyHint")} />
      ) : (
        <>
          <ul className="flex flex-col gap-3 md:hidden">
            {visible.map((row) => (
              <li key={row.id}>
                <Card className="p-4">
                  <p className="font-medium">{titleField ? display(titleField, row, res, locale, t, refs) : row.id}</p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    {rest.map((f) => (
                      <div key={f.name} className="contents">
                        <dt className="text-muted">{t(`fields.${f.name}`)}</dt>
                        <dd className="min-w-0 break-words text-right">{display(f, row, res, locale, t, refs)}</dd>
                      </div>
                    ))}
                  </dl>
                  {writable || rowActions ? <div className="no-print mt-3 border-t border-border pt-3">{controls(row)}</div> : null}
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
                      {t(`fields.${f.name}`)}
                    </th>
                  ))}
                  {writable || rowActions ? (
                    <th scope="col" className="no-print px-4 py-3 text-right font-medium">
                      {t("common.actions")}
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id} className="border-t border-border align-middle">
                    {listFields.map((f) => (
                      <td key={f.name} className="px-4 py-3">
                        {display(f, row, res, locale, t, refs)}
                      </td>
                    ))}
                    {writable || rowActions ? <td className="no-print px-4 py-3">{controls(row)}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 ? (
            <nav className="no-print mt-4 flex items-center justify-between text-sm">
              {page > 1 ? <LinkButton href={pageHref(page - 1)} variant="outline" size="sm">{t("common.prev")}</LinkButton> : <span />}
              <span className="text-muted tabular">{page} / {pages}</span>
              {page < pages ? <LinkButton href={pageHref(page + 1)} variant="outline" size="sm">{t("common.next")}</LinkButton> : <span />}
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
