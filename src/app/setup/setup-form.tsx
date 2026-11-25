"use client";

import { useTranslations } from "next-intl";
import { startTransition, useActionState, type FormEvent } from "react";
import { buttonClass, inputClass, labelClass } from "@/components/ui";
import { bootstrapDirector } from "@/lib/actions/users";

export function SetupForm() {
  const t = useTranslations();
  const [state, action, pending] = useActionState(bootstrapDirector, null);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };
  return (
    <form action={action} onSubmit={submit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{t("setup.formTitle")}</h2>
      <label className="block">
        <span className={labelClass}>{t("setup.code")}</span>
        <input type="password" name="code" required autoComplete="off" className={inputClass} />
        <span className="mt-1 block text-xs text-muted">{t("setup.codeHint")}</span>
      </label>
      <label className="block">
        <span className={labelClass}>{t("users.fullName")}</span>
        <input type="text" name="full_name" required minLength={2} maxLength={100} autoComplete="name" className={inputClass} />
      </label>
      <label className="block">
        <span className={labelClass}>{t("login.email")}</span>
        <input type="email" name="email" required autoComplete="username" className={inputClass} />
      </label>
      <label className="block">
        <span className={labelClass}>{t("login.password")}</span>
        <input type="password" name="password" required minLength={8} autoComplete="new-password" className={inputClass} />
        <span className="mt-1 block text-xs text-muted">{t("users.passwordHint")}</span>
      </label>
      <button type="submit" disabled={pending} className={buttonClass("primary")}>
        {t("setup.submit")}
      </button>
      {state?.error ? (
        <p role="alert" className="text-sm text-danger">
          {t.has(state.error) ? t(state.error) : t("errors.internal")}
        </p>
      ) : null}
    </form>
  );
}
