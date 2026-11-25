import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { LogoMark } from "@/components/brand";
import { PrintButton } from "@/components/client";
import { LinkButton } from "@/components/ui";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getMosqueInfo } from "@/lib/mosque";
import { requireModule } from "@/lib/session";
import type { Locale } from "@/lib/types";

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  await requireModule("surat");
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const letter = await db.get("letters", (await params).id);
  if (!letter) notFound();
  const mosque = await getMosqueInfo(locale);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex flex-wrap justify-between gap-2">
        <LinkButton href="/surat" variant="outline" size="sm">
          {t("common.back")}
        </LinkButton>
        <PrintButton label={t("common.print")} />
      </div>
      <article className="print-page rounded-lg border border-border bg-card p-8 shadow-card sm:p-12">
        <header className="flex items-center gap-4 border-b-2 border-primary pb-4">
          <LogoMark className="size-16" />
          <div className="min-w-0">
            <p className="text-xl font-bold tracking-tight text-accent">{mosque.name}</p>
            <p className="text-sm font-medium">
              {mosque.logoName} · {mosque.logoTagline}
            </p>
            <p className="text-sm text-muted">
              〒{mosque.postalCode} {mosque.address}
            </p>
            <p className="text-sm text-muted">{[mosque.phone, mosque.email, mosque.website.replace(/^https?:\/\//, "")].filter(Boolean).join(" · ")}</p>
          </div>
        </header>
        <div className="mt-6 flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
          <p>
            {t("surat.number")}: <span className="tabular font-medium">{letter.number}</span>
            <br />
            {t("surat.subject")}: <span className="font-medium">{letter.subject}</span>
          </p>
          <p>
            {t("surat.place")}, {formatDate(letter.issued_on, locale)}
          </p>
        </div>
        <div className="mt-8 whitespace-pre-wrap leading-relaxed">{letter.body}</div>
        <footer className="mt-12 flex justify-end">
          <div className="text-center text-sm">
            <p>{t("surat.signature")}</p>
            <div className="h-20" />
            <p className="border-t border-foreground px-8 pt-1">&nbsp;</p>
          </div>
        </footer>
      </article>
    </div>
  );
}
