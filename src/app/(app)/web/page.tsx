import { ArrowRight, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ActionButton } from "@/components/client";
import { PublicWebOff } from "@/components/public-section-view";
import { Badge, Card, Icon, PageHeader, buttonClass } from "@/components/ui";
import { syncPublic } from "@/lib/actions/publicweb";
import { db } from "@/lib/db";
import { dateJst, formatDate } from "@/lib/format";
import { canRead } from "@/lib/permissions";
import { loadSection, nextFriday } from "@/lib/publicweb/read";
import { PUB_SECTIONS, type PubSection } from "@/lib/publicweb/sections";
import { canRefreshPublicSite, publicSiteUrl, publicStore, publicWebMode } from "@/lib/publicweb/store";
import { requireModule } from "@/lib/session";
import type { Locale } from "@/lib/types";

const FLOW = ["jumat", "pengumuman", "agenda", "ruangan", "donasi", "laporan", "rekening", "kotakmasuk", "internal"] as const;

export default async function PublicWebHub() {
  const user = await requireModule("web");
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const role = user.role;
  const today = dateJst();
  const sections = PUB_SECTIONS.filter((s) => canRead(role, s.module));
  const finance = canRead(role, "donasi");
  const rooms = canRead(role, "ruangan");
  const inbox = canRead(role, "kotakmasuk");

  // Data internal dimulai lebih dulu dan dimuat bersamaan dengan data web publik.
  const internal = Promise.all([rooms ? db.list("room_bookings") : [], finance ? db.list("donations") : []]);
  const summaries: Record<string, { text: string; warn?: boolean }> = {};
  let inboxNew = 0;
  let failed = false;
  if (publicWebMode !== "off") {
    try {
      const summarize = async (s: PubSection) => {
        const items = await loadSection(s);
        if (s.key === "jumat") {
          const friday = nextFriday(today);
          const row = items.find((i) => i.values.date === friday && i.values.published);
          summaries[s.key] = row ? { text: t("web.hub.jumatSet", { date: formatDate(friday, locale), khatib: String(row.values.khatib) }) } : { text: t("web.hub.jumatMissing", { date: formatDate(friday, locale) }), warn: true };
        } else if (s.key === "pengumuman") summaries[s.key] = { text: t("web.hub.countLive", { count: items.filter((i) => i.values.status === "published").length }) };
        else if (s.key === "agenda") summaries[s.key] = { text: t("web.hub.countUpcoming", { count: items.filter((i) => i.values.status === "published" && String(i.values.ends_at) >= new Date().toISOString()).length }) };
        else if (s.kind === "collection") summaries[s.key] = { text: t("web.hub.countLive", { count: items.filter((i) => i.values.published).length }) };
      };
      const store = publicStore();
      const [, programs, suggestions, contacts] = await Promise.all([
        Promise.all(sections.map(summarize)),
        inbox ? store.list("program_registrations", { status: "new" }) : [],
        inbox ? store.list("suggestions", { status: "new" }) : [],
        inbox ? store.list("contact_messages", { status: "new" }) : [],
      ]);
      inboxNew = role === "pendidikan" ? programs.length : role === "fasilitas" ? suggestions.filter((s) => s.kind === "facility").length : programs.length + suggestions.length + contacts.length;
    } catch {
      failed = true;
    }
  }

  const [bookings, donations] = await internal;
  const waitingBookings = bookings.filter((b) => b.source === "public" && b.status === "requested").length;
  const waitingDonations = donations.filter((d) => d.public_ref && d.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        tag={t("web.tag")}
        title={t("web.hub.titleA")}
        accent={t("web.hub.titleB")}
        description={t("web.hub.description")}
        actions={
          <a href={publicSiteUrl} target="_blank" rel="noreferrer" className={buttonClass("outline", "sm")}>
            <ExternalLink aria-hidden strokeWidth={1.5} className="size-4" />
            {t("web.hub.openSite")}
          </a>
        }
      />

      {publicWebMode === "off" ? (
        <PublicWebOff />
      ) : (
        <Card className="flex flex-col gap-3 bg-surface sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={failed ? "danger" : publicWebMode === "live" ? "success" : "warning"}>{t(failed ? "web.hub.statusFailed" : `web.hub.status_${publicWebMode}`)}</Badge>
              <span className="truncate text-sm text-muted">{publicSiteUrl.replace(/^https?:\/\//, "")}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{t(failed ? "web.errors.failed" : canRefreshPublicSite || publicWebMode === "demo" ? "web.hub.instant" : "web.hub.cached")}</p>
          </div>
          <ActionButton action={syncPublic} payload={{}} variant="outline">
            <RefreshCw aria-hidden strokeWidth={1.5} className="size-4" />
            {t("web.hub.syncNow")}
          </ActionButton>
        </Card>
      )}

      {publicWebMode !== "off" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => (
              <Link key={s.key} href={`/web/${s.key}`} className="group flex flex-col rounded-lg border border-border bg-card p-5 shadow-card transition-transform duration-200 hover:-translate-y-0.5">
                <span className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-accent">
                    <Icon name={s.icon} />
                  </span>
                  <span className="font-medium">{t(`nav.modules.${s.module}`)}</span>
                  <ArrowRight aria-hidden strokeWidth={1.5} className="ml-auto size-4 text-muted group-hover:text-accent" />
                </span>
                <span className="mt-3 text-sm text-muted">{t(`web.sections.${s.module}`)}</span>
                {summaries[s.key] ? <span className={`mt-3 text-sm font-medium ${summaries[s.key].warn ? "text-warning" : ""}`}>{summaries[s.key].text}</span> : null}
              </Link>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {rooms || finance ? (
              <Card>
                <h2 className="font-semibold">{t("web.hub.formsTitle")}</h2>
                <p className="mt-1 text-sm text-muted">{t("web.hub.formsHint")}</p>
                <ul className="mt-4 flex flex-col divide-y divide-border text-sm">
                  {rooms ? (
                    <li className="flex items-center justify-between gap-3 py-2.5">
                      <Link href="/ruangan" className="hover:underline">{t("web.hub.bookingsWaiting")}</Link>
                      <span className="tabular text-lg font-semibold">{waitingBookings}</span>
                    </li>
                  ) : null}
                  {finance ? (
                    <li className="flex items-center justify-between gap-3 py-2.5">
                      <Link href="/donasi" className="hover:underline">{t("web.hub.donationsWaiting")}</Link>
                      <span className="tabular text-lg font-semibold">{waitingDonations}</span>
                    </li>
                  ) : null}
                </ul>
              </Card>
            ) : null}
            {inbox ? (
              <Card>
                <h2 className="font-semibold">{t("nav.modules.kotakmasuk")}</h2>
                <p className="mt-1 text-sm text-muted">{t("web.sections.kotakmasuk")}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm">{t("web.hub.inboxNew")}</span>
                  <span className="tabular text-lg font-semibold">{inboxNew}</span>
                </div>
                <Link href="/web/kotak-masuk" className={`${buttonClass("outline", "sm")} mt-4`}>{t("web.hub.openInbox")}</Link>
              </Card>
            ) : null}
            {finance ? (
              <Card>
                <h2 className="font-semibold">{t("web.transparency.title")}</h2>
                <p className="mt-1 text-sm text-muted">{t("web.transparency.hint")}</p>
                <Link href="/laporan" className={`${buttonClass("outline", "sm")} mt-4`}>{t("web.hub.openReport")}</Link>
              </Card>
            ) : null}
          </div>
        </>
      ) : null}

      <Card>
        <h2 className="font-semibold">{t("web.flow.title")}</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">{t("web.flow.hint")}</p>
        <dl className="mt-4 flex flex-col divide-y divide-border text-sm">
          {FLOW.map((key) => (
            <div key={key} className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr] sm:gap-4">
              <dt className="font-medium">{t(`web.flow.${key}.title`)}</dt>
              <dd className="text-muted">{t(`web.flow.${key}.text`)}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
