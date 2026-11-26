import { ArrowDownLeft, ArrowUpRight, ChevronRight, MoonStar } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ActionButton } from "@/components/client";
import { Badge, Card } from "@/components/ui";
import { decideBooking, decideExpense } from "@/lib/actions/workflow";
import { db } from "@/lib/db";
import { addDays, dateJst, formatDate, formatDateTime, formatMoney, monthJst, prevMonth } from "@/lib/format";
import { balancesByCurrency, monthTotals } from "@/lib/logic/cash";
import { canRead, canWrite } from "@/lib/permissions";
import { pickL10n } from "@/lib/publicweb/content";
import { nextFriday } from "@/lib/publicweb/read";
import { publicStore, publicWebMode, type PubRow } from "@/lib/publicweb/store";
import { STATUS_TONE, scopeRows } from "@/lib/resources";
import { requireSession } from "@/lib/session";
import { CURRENCIES, type AnyRow, type Locale, type Role } from "@/lib/types";

function Panel({ title, href, viewAll, highlight, children }: { title: string; href?: string; viewAll?: string; highlight?: boolean; children: ReactNode }) {
  return (
    <Card className={highlight ? "border-primary" : undefined}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {href ? (
          <Link href={href} className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
            {viewAll}
            <ChevronRight aria-hidden strokeWidth={1.5} className="size-4" />
          </Link>
        ) : null}
      </div>
      {children}
    </Card>
  );
}

/** Pintasan per peran: pekerjaan yang paling sering dilakukan, satu ketukan dari dasbor. */
const QUICK: Record<Role, { key: string; href: string }[]> = {
  direktur: [{ key: "announce", href: "/web/pengumuman?new=1" }, { key: "report", href: "/laporan" }],
  bendahara: [{ key: "cash", href: "/kas?new=1" }, { key: "match", href: "/donasi" }, { key: "report", href: "/laporan" }],
  sekretaris: [{ key: "letter", href: "/surat" }, { key: "announce", href: "/web/pengumuman?new=1" }, { key: "congregant", href: "/jamaah?new=1" }],
  ibadah: [{ key: "jumuah", href: "/web/jumat?new=1" }, { key: "event", href: "/kegiatan?new=1" }],
  pendidikan: [{ key: "attendance", href: "/tpa" }, { key: "event", href: "/kegiatan?new=1" }],
  fasilitas: [{ key: "rooms", href: "/ruangan" }, { key: "inventory", href: "/inventaris?new=1" }],
  pembimbing: [{ key: "muallaf", href: "/muallaf" }],
};
const QUICK_ALL = [{ key: "expense", href: "/pengajuan?new=1" }, { key: "issue", href: "/kerusakan?new=1" }];

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireSession();
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const { denied } = await searchParams;
  const role = user.role;
  const finance = canRead(role, "kas");
  const today = dateJst();
  const month = monthJst();

  // Dari database web publik: jadwal Jumat terdekat dan kiriman jamaah yang belum ditangani.
  // Dimuat bersamaan dengan data internal supaya halaman tidak menunggu dua kali.
  const friday = nextFriday(today);
  const loadPublic = async (): Promise<{ ok: boolean; jumuah: PubRow | null; inboxNew: number }> => {
    if (publicWebMode === "off") return { ok: false, jumuah: null, inboxNew: 0 };
    try {
      const store = publicStore();
      const inbox = canRead(role, "kotakmasuk");
      const [schedules, programs, suggestions, contacts] = await Promise.all([
        store.list("jumuah_schedules", { date: friday }),
        inbox && role !== "fasilitas" ? store.list("program_registrations", { status: "new" }) : [],
        inbox && role !== "pendidikan" ? store.list("suggestions", { status: "new" }) : [],
        inbox && (role === "direktur" || role === "sekretaris") ? store.list("contact_messages", { status: "new" }) : [],
      ]);
      return {
        ok: true,
        jumuah: schedules.find((j) => j.published) ?? null,
        inboxNew: programs.length + (role === "fasilitas" ? suggestions.filter((x) => x.kind === "facility").length : suggestions.length) + contacts.length,
      };
    } catch {
      return { ok: false, jumuah: null, inboxNew: 0 };
    }
  };

  const [[accounts, entries, bills, donations, expenses, bookings, rooms, events, issues], pub] = await Promise.all([Promise.all([
    finance ? db.list("accounts") : [],
    finance ? db.list("cash_entries") : [],
    finance ? db.list("bills") : [],
    finance ? db.list("donations") : [],
    db.list("expense_requests"),
    canRead(role, "ruangan") ? db.list("room_bookings") : [],
    canRead(role, "ruangan") ? db.list("rooms") : [],
    db.list("events"),
    db.list("issues"),
  ]), loadPublic()]);

  const balances = balancesByCurrency(accounts, entries);
  const now = monthTotals(entries, month);
  const last = monthTotals(entries, prevMonth(month));
  const myExpenses = scopeRows("pengajuan", user, expenses as unknown as AnyRow[]) as unknown as typeof expenses;
  const waitingExpenses = myExpenses.filter((e) => e.status === "submitted");
  const waitingBookings = bookings.filter((b) => b.status === "requested");
  const toPay = expenses.filter((e) => e.status === "approved").length;
  const pendingDonations = donations.filter((d) => d.status === "pending").length;
  const weekEnd = addDays(today, 7);
  const week = events.filter((e) => dateJst(new Date(e.starts_at)) >= today && dateJst(new Date(e.starts_at)) <= weekEnd).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const openIssues = issues.filter((i) => i.status !== "done").sort((a, b) => a.reported_on.localeCompare(b.reported_on));
  const dueLimit = addDays(today, 14);
  const due = bills.filter((b) => b.active && b.next_due <= dueLimit).sort((a, b) => a.next_due.localeCompare(b.next_due));
  const dayDiff = (date: string) => Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
  const isDirector = role === "direktur";

  const { jumuah, inboxNew } = pub;
  const publicOk = pub.ok;
  const quick = [...QUICK[role], ...QUICK_ALL];

  return (
    <div className="flex flex-col gap-6">
      {denied ? <p role="alert" className="rounded-lg bg-primary-soft px-4 py-3 text-sm text-accent">{t("dashboard.denied")}</p> : null}

      <section className="pattern-hero rounded-xl p-6 text-hero-foreground sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-hero-muted/40 px-3 py-1 text-xs font-medium text-hero-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-primary" />
          {t("dashboard.tag")} · {formatDate(today, locale)}
        </span>
        <p className="mt-4 text-sm text-hero-muted">{t("dashboard.greeting", { name: user.full_name })}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {t("dashboard.titleA")} <span className="text-hero-accent">{t("dashboard.titleB")}</span>
        </h1>
        {finance ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {CURRENCIES.map((c, i) => (
              <div key={c} className={`rounded-lg p-5 ${i === 0 ? "bg-primary text-primary-foreground" : "border border-hero-muted/30"}`}>
                <p className="text-sm opacity-80">{t("dashboard.balance", { currency: c })}</p>
                <p className="tabular mt-1 text-3xl font-semibold">{formatMoney(balances[c], c, locale)}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {(["in", "out"] as const).map((type) => (
                    <div key={type}>
                      <dt className="flex items-center gap-1 opacity-80">
                        {type === "in" ? <ArrowDownLeft aria-hidden strokeWidth={1.5} className="size-4" /> : <ArrowUpRight aria-hidden strokeWidth={1.5} className="size-4" />}
                        {t(type === "in" ? "dashboard.incomeMonth" : "dashboard.expenseMonth")}
                      </dt>
                      <dd className="tabular mt-0.5 font-medium">{formatMoney(now[c][type], c, locale)}</dd>
                      <dd className="tabular text-xs opacity-70">{t("dashboard.lastMonth", { amount: formatMoney(last[c][type], c, locale) })}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <nav aria-label={t("dashboard.quickTitle")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {quick.map((q) => (
          <Link key={q.key} href={q.href} className="inline-flex h-10 shrink-0 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-surface">
            {t(`dashboard.quick.${q.key}`)}
          </Link>
        ))}
      </nav>

      {publicOk ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/web/jumat" className={`flex items-center gap-4 rounded-lg border bg-card p-4 shadow-card hover:bg-surface ${jumuah ? "border-border" : "border-primary"}`}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-accent">
              <MoonStar aria-hidden strokeWidth={1.5} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm text-muted">{t("dashboard.jumuahTitle", { date: formatDate(friday, locale) })}</span>
              {jumuah ? (
                <span className="block truncate font-medium">
                  {String(jumuah.time)} · {t("dashboard.jumuahKhatib", { name: String(jumuah.khatib) })}
                  {pickL10n(jumuah.topic, locale) ? ` · ${pickL10n(jumuah.topic, locale)}` : ""}
                </span>
              ) : (
                <span className="block font-medium text-warning">{t(canWrite(role, "jumat") ? "dashboard.jumuahFill" : "dashboard.jumuahMissing")}</span>
              )}
            </span>
          </Link>
          {canRead(role, "kotakmasuk") ? (
            <Link href="/web/kotak-masuk" className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-card hover:bg-surface">
              <span className="text-sm">{t("dashboard.inboxNew")}</span>
              <span className="tabular text-xl font-semibold">{inboxNew}</span>
            </Link>
          ) : null}
        </div>
      ) : null}

      {finance ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/donasi" className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-card hover:bg-surface">
            <span className="text-sm">{t("dashboard.donationsPending")}</span>
            <span className="tabular text-xl font-semibold">{pendingDonations}</span>
          </Link>
          <Link href="/pengajuan" className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-card hover:bg-surface">
            <span className="text-sm">{t("dashboard.toPay")}</span>
            <span className="tabular text-xl font-semibold">{toPay}</span>
          </Link>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={isDirector ? t("dashboard.pendingTitle") : t("dashboard.myRequests")} href="/pengajuan" viewAll={t("dashboard.viewAll")} highlight={isDirector && waitingExpenses.length + waitingBookings.length > 0}>
          {waitingExpenses.length + (isDirector ? waitingBookings.length : 0) === 0 ? (
            <p className="text-sm text-muted">{t("dashboard.pendingEmpty")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {waitingExpenses.map((e) => (
                <li key={e.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">{e.title}</p>
                    <p className="text-sm text-muted">
                      {t("dashboard.expensePending")} · {e.requested_by_name} · <span className="tabular">{formatMoney(Number(e.amount), e.currency, locale)}</span>
                    </p>
                  </div>
                  {isDirector ? (
                    <div className="flex shrink-0 gap-2">
                      <ActionButton action={decideExpense} payload={{ id: e.id, decision: "approved" as const }} variant="primary">{t("expense.approve")}</ActionButton>
                      <ActionButton action={decideExpense} payload={{ id: e.id, decision: "rejected" as const }} variant="danger" askNote={t("common.note")}>{t("expense.reject")}</ActionButton>
                    </div>
                  ) : (
                    <Badge tone="warning">{t(`options.${e.status}`)}</Badge>
                  )}
                </li>
              ))}
              {isDirector
                ? waitingBookings.map((b) => (
                    <li key={b.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium">{b.purpose}</p>
                        <p className="text-sm text-muted">
                          {t("dashboard.bookingsPending")} · {rooms.find((r) => r.id === b.room_id)?.name} · {formatDateTime(b.starts_at, locale)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <ActionButton action={decideBooking} payload={{ id: b.id, decision: "approved" as const }} variant="primary">{t("ruangan.approve")}</ActionButton>
                        <ActionButton action={decideBooking} payload={{ id: b.id, decision: "declined" as const }} variant="danger" askNote={t("common.note")}>{t("ruangan.decline")}</ActionButton>
                      </div>
                    </li>
                  ))
                : null}
            </ul>
          )}
        </Panel>

        <Panel title={t("dashboard.weekTitle")} href="/kegiatan" viewAll={t("dashboard.viewAll")}>
          {week.length === 0 ? (
            <p className="text-sm text-muted">{t("dashboard.weekEmpty")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {week.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium">{e.title}</p>
                    <p className="text-sm text-muted">{[e.officer, e.location].filter(Boolean).join(" · ")}</p>
                  </div>
                  <p className="tabular shrink-0 text-right text-sm text-muted">{formatDateTime(e.starts_at, locale)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("dashboard.issuesTitle")} href="/kerusakan" viewAll={t("dashboard.viewAll")}>
          {openIssues.length === 0 ? (
            <p className="text-sm text-muted">{t("dashboard.issuesEmpty")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {openIssues.slice(0, 6).map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium">{i.title}</p>
                    <p className="text-sm text-muted">{[i.location, formatDate(i.reported_on, locale)].filter(Boolean).join(" · ")}</p>
                  </div>
                  <Badge tone={STATUS_TONE[i.status]}>{t(`options.${i.status}`)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {finance ? (
          <Panel title={t("dashboard.dueTitle")} href="/tagihan" viewAll={t("dashboard.viewAll")}>
            {due.length === 0 ? (
              <p className="text-sm text-muted">{t("dashboard.dueEmpty")}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {due.map((b) => {
                  const d = dayDiff(b.next_due);
                  return (
                    <li key={b.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-medium">{b.name}</p>
                        <p className="tabular text-sm text-muted">{formatMoney(Number(b.amount), b.currency, locale)} · {formatDate(b.next_due, locale)}</p>
                      </div>
                      <Badge tone={d < 0 ? "danger" : d <= 3 ? "warning" : "neutral"}>{d < 0 ? t("dashboard.overdue", { days: -d }) : d === 0 ? t("dashboard.dueToday") : t("dashboard.dueIn", { days: d })}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
