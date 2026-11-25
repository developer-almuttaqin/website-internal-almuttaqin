import { getTranslations } from "next-intl/server";
import { ActionButton, ActionForm } from "@/components/client";
import { Badge, Card, PageHeader, inputClass, labelClass } from "@/components/ui";
import { createUser, resetUserPassword, setUserActive, updateUser } from "@/lib/actions/users";
import { db, isDemo } from "@/lib/db";
import { requireModule } from "@/lib/session";
import { ROLES } from "@/lib/types";

export default async function UsersPage() {
  const me = await requireModule("pengguna");
  const t = await getTranslations();
  const profiles = (await db.list("profiles")).sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role) || a.full_name.localeCompare(b.full_name));
  const missing = ROLES.filter((r) => !profiles.some((p) => p.role === r && p.active));
  const roleOptions = ROLES.map((r) => (
    <option key={r} value={r}>
      {t(`roles.${r}`)}
    </option>
  ));

  return (
    <>
      <PageHeader tag={t("nav.groups.admin")} title={t("nav.modules.pengguna")} description={t("pengguna.hint")} />

      {missing.length ? (
        <p className="mb-6 rounded-lg bg-surface px-4 py-3 text-sm text-muted">
          {t("users.missing")} <span className="font-medium text-foreground">{missing.map((r) => t(`roles.${r}`)).join(", ")}</span>
        </p>
      ) : null}

      <Card className="mb-6">
        <h2 className="font-semibold">{t("users.addTitle")}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t("users.addHint")}</p>
        <ActionForm action={createUser} submitLabel={t("users.addSubmit")} successText={t("users.added")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>{t("users.fullName")}</span>
              <input type="text" name="full_name" required minLength={2} maxLength={100} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>{t("login.email")}</span>
              <input type="email" name="email" required autoComplete="off" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>{t("users.role")}</span>
              <select name="role" required defaultValue={missing[0] ?? ""} className={inputClass}>
                <option value="">{t("common.choose")}</option>
                {roleOptions}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>{t("users.initialPassword")}</span>
              <input type="password" name="password" required minLength={8} autoComplete="new-password" className={inputClass} />
              <span className="mt-1 block text-xs text-muted">{t("users.passwordHint")}</span>
            </label>
          </div>
        </ActionForm>
      </Card>

      <ul className="grid gap-3 lg:grid-cols-2">
        {profiles.map((p) => (
          <li key={p.id}>
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.full_name}</p>
                  <p className="truncate text-sm text-muted">{p.email}</p>
                </div>
                <Badge tone={p.active ? "success" : "neutral"}>{p.active ? t("fields.active") : t("options.inactive")}</Badge>
              </div>
              <p className="mt-2 text-sm text-accent">{t(`roles.${p.role}`)}</p>
              <details className="mt-3 border-t border-border pt-3">
                <summary className="cursor-pointer text-sm font-medium text-accent">{t("users.manage")}</summary>
                <ActionForm action={updateUser} submitLabel={t("common.save")} successText={t("users.saved")} className="mt-3 grid gap-3">
                  <input type="hidden" name="id" value={p.id} />
                  <label className="block">
                    <span className={labelClass}>{t("users.fullName")}</span>
                    <input type="text" name="full_name" required minLength={2} maxLength={100} defaultValue={p.full_name} className={inputClass} />
                  </label>
                  <label className="block">
                    <span className={labelClass}>{t("users.role")}</span>
                    <select name="role" required defaultValue={p.role} className={inputClass}>
                      {roleOptions}
                    </select>
                  </label>
                </ActionForm>
                {isDemo ? null : (
                  <ActionForm action={resetUserPassword} submitLabel={t("users.resetSubmit")} successText={t("users.resetDone")} className="mt-4 grid gap-3 border-t border-border pt-4">
                    <input type="hidden" name="id" value={p.id} />
                    <label className="block">
                      <span className={labelClass}>{t("users.resetLabel")}</span>
                      <input type="password" name="password" required minLength={8} autoComplete="new-password" className={inputClass} />
                    </label>
                  </ActionForm>
                )}
                {p.id === me.id ? null : (
                  <div className="mt-4 border-t border-border pt-4">
                    <ActionButton action={setUserActive} payload={{ id: p.id, active: !p.active }} variant={p.active ? "danger" : "outline"} confirm={p.active ? t("users.deactivateConfirm") : undefined}>
                      {p.active ? t("users.deactivate") : t("users.activate")}
                    </ActionButton>
                  </div>
                )}
              </details>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
