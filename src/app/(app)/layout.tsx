import { cookies } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AutoSync } from "@/components/auto-sync";
import { BrandLockup } from "@/components/brand";
import { MobileDrawer, NavLink, TopControls } from "@/components/client";
import { Icon } from "@/components/ui";
import { isDemo } from "@/lib/db";
import { getMosqueInfo } from "@/lib/mosque";
import { NAV, canRead } from "@/lib/permissions";
import { publicWebMode } from "@/lib/publicweb/store";
import { getLocale, requireSession } from "@/lib/session";
import type { Role } from "@/lib/types";

async function Menu({ role }: { role: Role }) {
  const t = await getTranslations("nav");
  return (
    <nav className="flex flex-col gap-5">
      {NAV.map((group) => {
        const items = group.items.filter((i) => canRead(role, i.module));
        if (!items.length) return null;
        return (
          <div key={group.group}>
            <p className="mb-1.5 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">{t(`groups.${group.group}`)}</p>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href}>
                    <Icon name={item.icon} />
                    {t(`modules.${item.module}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Brand({ name, tagline }: { name: string; tagline: string }) {
  return (
    <Link href="/" className="block">
      <BrandLockup name={name} subtitle={tagline} />
    </Link>
  );
}

export default async function AppLayout({ children }: LayoutProps<"/">) {
  // Dimuat bersamaan, bukan berurutan: setiap pindah halaman menunggu yang paling lama saja.
  const [user, t, cookieStore, mosque] = await Promise.all([requireSession(), getTranslations(), cookies(), getLocale().then(getMosqueInfo)]);
  const themeCookie = cookieStore.get("acc_theme")?.value;
  const theme = themeCookie === "light" || themeCookie === "dark" ? themeCookie : "system";
  const brand = <Brand name={mosque.name} tagline={t("app.tagline")} />;

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[17rem_1fr]">
      <aside className="no-print sticky top-0 hidden h-screen flex-col gap-6 overflow-y-auto border-r border-border bg-background p-4 lg:flex">
        {brand}
        <div aria-hidden className="ornament-line shrink-0" />
        <Menu role={user.role} />
        <div className="mt-auto pt-4 text-xs text-muted">
          <div aria-hidden className="ornament-line mb-4" />
          <p className="font-semibold text-foreground">{mosque.logoName}</p>
          <p>{mosque.city}</p>
          <a href={mosque.website} target="_blank" rel="noreferrer" className="mt-1 inline-block text-accent hover:underline">
            {mosque.website.replace(/^https?:\/\//, "")}
          </a>
        </div>
      </aside>
      <div className="min-w-0">
        {isDemo ? <p className="no-print bg-hero px-4 py-2 text-center text-xs text-hero-foreground">{t("app.demoBanner")}</p> : null}
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <MobileDrawer>
              <div className="flex flex-col gap-6">
                {brand}
                <Menu role={user.role} />
              </div>
            </MobileDrawer>
            <Link href="/akun-saya" title={t("account.title")} className="min-w-0 rounded-md leading-tight hover:underline">
              <span className="block truncate text-sm font-semibold">{user.full_name}</span>
              <span className="block truncate text-xs text-muted">{t(`roles.${user.role}`)}</span>
            </Link>
          </div>
          <TopControls initialTheme={theme} />
        </header>
        {publicWebMode !== "off" ? <AutoSync /> : null}
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
