import { getTranslations } from "next-intl/server";
import { ActionForm } from "@/components/client";
import { Card, PageHeader, inputClass, labelClass } from "@/components/ui";
import { changeOwnPassword } from "@/lib/actions/users";
import { isDemo } from "@/lib/db";
import { requireSession } from "@/lib/session";

export default async function AccountPage() {
  const user = await requireSession();
  const t = await getTranslations();
  return (
    <>
      <PageHeader tag={t("nav.groups.admin")} title={t("account.title")} description={t("account.hint")} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-muted">{t("users.fullName")}</dt>
              <dd className="font-medium">{user.full_name}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("login.email")}</dt>
              <dd className="break-all font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("users.role")}</dt>
              <dd className="font-medium text-accent">{t(`roles.${user.role}`)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted">{t("account.roleHint")}</p>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">{t("account.passwordTitle")}</h2>
          {isDemo ? (
            <p className="text-sm text-muted">{t("account.demo")}</p>
          ) : (
            <ActionForm action={changeOwnPassword} submitLabel={t("account.passwordSubmit")} successText={t("account.passwordSaved")} className="grid gap-3">
              <label className="block">
                <span className={labelClass}>{t("account.current")}</span>
                <input type="password" name="current" required autoComplete="current-password" className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>{t("account.new")}</span>
                <input type="password" name="password" required minLength={8} autoComplete="new-password" className={inputClass} />
                <span className="mt-1 block text-xs text-muted">{t("users.passwordHint")}</span>
              </label>
            </ActionForm>
          )}
        </Card>
      </div>
    </>
  );
}
