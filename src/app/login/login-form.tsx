"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { buttonClass, inputClass, labelClass } from "@/components/ui";
import { login } from "@/lib/actions/auth";

export function LoginForm({ accounts }: { accounts: { id: string; name: string; role: string }[] }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState(login, null);
  const error = state?.error ? <p role="alert" className="mt-3 text-sm text-danger">{t(state.error)}</p> : null;

  if (accounts.length) {
    return (
      <form action={action}>
        <h2 className="text-xl font-semibold">{t("login.demoTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{t("login.demoHint")}</p>
        <ul className="mt-5 flex flex-col gap-2">
          {accounts.map((a) => (
            <li key={a.id}>
              <button type="submit" name="demo_user" value={a.id} disabled={pending} className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-left hover:bg-surface disabled:opacity-60">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{a.role}</span>
                  <span className="block truncate text-sm text-muted">{a.name}</span>
                </span>
                <ChevronRight aria-hidden strokeWidth={1.5} className="size-5 shrink-0 text-muted" />
              </button>
            </li>
          ))}
        </ul>
        {error}
      </form>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{t("login.submit")}</h2>
      <label className="block">
        <span className={labelClass}>{t("login.email")}</span>
        <input type="email" name="email" required autoComplete="username" className={inputClass} />
      </label>
      <label className="block">
        <span className={labelClass}>{t("login.password")}</span>
        <input type="password" name="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <button type="submit" disabled={pending} className={buttonClass("primary")}>
        {t("login.submit")}
      </button>
      {error}
    </form>
  );
}
