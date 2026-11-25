import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth-shell";
import { db, isDemo } from "@/lib/db";
import { needsSetup } from "@/lib/setup";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ akun?: string }> }) {
  // Database baru tanpa pengurus: arahkan ke pembuatan akun direktur pertama.
  if (await needsSetup()) redirect("/setup");
  const t = await getTranslations();
  const accounts = isDemo ? (await db.list("profiles")).filter((p) => p.active).map((p) => ({ id: p.id, name: p.full_name, role: t(`roles.${p.role}`) })) : [];

  return (
    <AuthShell tag={t("login.tag")} titleA={t("login.titleA")} titleB={t("login.titleB")} subtitle={t("login.subtitle")}>
      {isDemo ? <p className="mb-6 rounded-lg bg-surface p-4 text-sm text-muted">{t("app.demoBanner")}</p> : null}
      {(await searchParams).akun ? <p role="alert" className="mb-6 rounded-lg bg-primary-soft p-4 text-sm text-accent">{t("login.inactive")}</p> : null}
      <LoginForm accounts={accounts} />
    </AuthShell>
  );
}
