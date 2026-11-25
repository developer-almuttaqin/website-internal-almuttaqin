import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ActionButton } from "@/components/client";
import { PublicWebOff } from "@/components/public-section-view";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { inboxToIssue, inboxToTpa, setInboxStatus } from "@/lib/actions/publicweb";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { publicStore, publicWebMode, type PubRow } from "@/lib/publicweb/store";
import { requireModule } from "@/lib/session";
import type { Locale } from "@/lib/types";

const TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "primary"> = { new: "warning", in_progress: "primary", accepted: "success", done: "success", waitlist: "neutral", rejected: "danger", spam: "neutral" };
const byNewest = (a: PubRow, b: PubRow) => String(b.created_at).localeCompare(String(a.created_at));
const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

export default async function InboxPage() {
  const user = await requireModule("kotakmasuk");
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const role = user.role;
  const header = <PageHeader tag={t("web.tag")} title={t("nav.modules.kotakmasuk")} description={t("web.sections.kotakmasuk")} />;
  if (publicWebMode === "off")
    return (
      <>
        {header}
        <PublicWebOff />
      </>
    );

  const seesPrograms = role !== "fasilitas";
  const seesSuggestions = role !== "pendidikan";
  const seesContacts = role === "direktur" || role === "sekretaris";
  let programs: PubRow[] = [];
  let suggestions: PubRow[] = [];
  let contacts: PubRow[] = [];
  try {
    const store = publicStore();
    [programs, suggestions, contacts] = await Promise.all([seesPrograms ? store.list("program_registrations") : [], seesSuggestions ? store.list("suggestions") : [], seesContacts ? store.list("contact_messages") : []]);
  } catch {
    return (
      <>
        {header}
        <p role="alert" className="rounded-lg bg-primary-soft px-4 py-3 text-sm text-accent">{t("web.errors.failed")}</p>
      </>
    );
  }
  if (role === "fasilitas") suggestions = suggestions.filter((s) => s.kind === "facility");
  suggestions = suggestions.filter((s) => s.status !== "spam");
  const [students, issues] = await Promise.all([role === "pendidikan" ? db.list("tpa_students") : [], db.list("issues")]);
  const importedStudents = new Set(students.map((s) => s.public_ref).filter(Boolean));
  const importedIssues = new Set(issues.map((i) => i.public_ref).filter(Boolean));

  const item = (row: PubRow, title: string, lines: (string | null)[], body: string | null, actions: ReactNode) => (
    <li key={String(row.id)}>
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="min-w-0 font-medium">{title}</p>
          <Badge tone={TONE[String(row.status)] ?? "neutral"}>{t(`web.options.${String(row.status)}`)}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted">{[...lines, formatDateTime(String(row.created_at), locale)].filter(Boolean).join(" · ")}</p>
        {body ? <p className="mt-3 whitespace-pre-line text-sm">{body}</p> : null}
        {actions ? <div className="mt-3 flex flex-wrap items-start gap-2 border-t border-border pt-3">{actions}</div> : null}
      </Card>
    </li>
  );

  const group = (title: string, hint: string, rows: PubRow[], render: (row: PubRow) => ReactNode) => (
    <section>
      <h2 className="text-lg font-semibold">
        {title} <span className="tabular text-sm font-normal text-muted">{rows.filter((r) => r.status === "new").length}</span>
      </h2>
      <p className="mb-3 mt-1 text-sm text-muted">{hint}</p>
      {rows.length === 0 ? <EmptyState title={t("web.inbox.empty")} /> : <ul className="grid gap-3 lg:grid-cols-2">{rows.sort(byNewest).slice(0, 60).map(render)}</ul>}
    </section>
  );

  return (
    <div className="flex flex-col gap-8">
      {header}
      {seesPrograms
        ? group(t("web.inbox.programs"), t("web.inbox.programsHint"), programs, (r) =>
            item(
              r,
              String(r.participant_name || r.full_name),
              [t.has(`web.programs.${String(r.program_id)}`) ? t(`web.programs.${String(r.program_id)}`) : String(r.program_id), r.participant_name ? String(r.full_name) : null, text(r.contact), r.participant_age ? t("web.inbox.age", { age: Number(r.participant_age) }) : null],
              text(r.notes),
              <>
                {role === "pendidikan" && r.program_id === "tpa" && !importedStudents.has(String(r.id)) ? (
                  <ActionButton action={inboxToTpa} payload={{ id: String(r.id) }} variant="primary">{t("web.inbox.toTpa")}</ActionButton>
                ) : null}
                {importedStudents.has(String(r.id)) ? <span className="text-sm text-success">{t("web.inbox.inTpa")}</span> : null}
                {r.status === "new" ? (
                  <>
                    <ActionButton action={setInboxStatus} payload={{ kind: "program" as const, id: String(r.id), status: "accepted" }}>{t("web.inbox.accept")}</ActionButton>
                    <ActionButton action={setInboxStatus} payload={{ kind: "program" as const, id: String(r.id), status: "waitlist" }}>{t("web.inbox.waitlist")}</ActionButton>
                    <ActionButton action={setInboxStatus} payload={{ kind: "program" as const, id: String(r.id), status: "rejected" }} variant="danger">{t("web.inbox.reject")}</ActionButton>
                  </>
                ) : null}
              </>,
            ),
          )
        : null}
      {seesSuggestions
        ? group(t("web.inbox.suggestions"), t("web.inbox.suggestionsHint"), suggestions, (r) =>
            item(
              r,
              t(`web.kinds.${String(r.kind)}`),
              [text(r.sender_name), text(r.sender_contact)],
              text(r.message),
              <>
                {importedIssues.has(String(r.id)) ? (
                  <span className="text-sm text-success">{t("web.inbox.inIssues")}</span>
                ) : r.kind === "facility" && r.status !== "done" ? (
                  <ActionButton action={inboxToIssue} payload={{ id: String(r.id) }} variant="primary">{t("web.inbox.toIssue")}</ActionButton>
                ) : null}
                {r.status !== "done" ? <ActionButton action={setInboxStatus} payload={{ kind: "suggestion" as const, id: String(r.id), status: "done" }}>{t("web.inbox.done")}</ActionButton> : null}
                {r.status === "new" && role !== "fasilitas" ? <ActionButton action={setInboxStatus} payload={{ kind: "suggestion" as const, id: String(r.id), status: "spam" }} variant="ghost" confirm={t("web.inbox.spamConfirm")}>{t("web.inbox.spam")}</ActionButton> : null}
              </>,
            ),
          )
        : null}
      {seesContacts
        ? group(t("web.inbox.contacts"), t("web.inbox.contactsHint"), contacts, (r) =>
            item(
              r,
              String(r.subject),
              [text(r.full_name), text(r.email)],
              text(r.message),
              <>
                {text(r.email) ? (
                  <a href={`mailto:${String(r.email)}?subject=${encodeURIComponent(`Re: ${String(r.subject)}`)}`} className="inline-flex h-9 items-center rounded-full border border-border px-3.5 text-sm font-medium hover:bg-surface">{t("web.inbox.reply")}</a>
                ) : null}
                {r.status !== "done" ? <ActionButton action={setInboxStatus} payload={{ kind: "contact" as const, id: String(r.id), status: "done" }}>{t("web.inbox.done")}</ActionButton> : null}
              </>,
            ),
          )
        : null}
    </div>
  );
}
