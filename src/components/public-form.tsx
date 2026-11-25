"use client";

import clsx from "clsx";
import { Languages, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { startTransition, useActionState, useEffect, type FormEvent } from "react";
import { savePublicRecord } from "@/lib/actions/publicweb";
import type { PubField } from "@/lib/publicweb/sections";
import { buttonClass, inputClass, labelClass, textareaClass } from "./ui";

const LOCALIZED = new Set(["ltext", "ltextarea", "lblocks"]);

/**
 * Formulir konten web publik. Isian tiga bahasa cukup ditulis dalam bahasa Indonesia; terjemahan
 * Inggris dan Jepang bersifat opsional dan disimpan di balik tombol "Terjemahan".
 */
export function PublicForm({ section, id, from, fields, initial }: { section: string; id?: string; from?: string; fields: PubField[]; initial: Record<string, string> }) {
  const t = useTranslations();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(savePublicRecord, null);
  const errors = state && !state.ok ? (state.error.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (state?.ok) {
      router.push(`/web/${section}?saved=${state.data.live ? "live" : "cached"}`);
      router.refresh();
    }
  }, [state, section, router]);

  const label = (f: PubField) => (
    <>
      {t(`web.fields.${f.name}`)}
      {f.required ? null : <span className="ml-1 font-normal text-muted">({t("common.optional")})</span>}
    </>
  );

  // Dikirim lewat transition, bukan lewat `action` bawaan, supaya isian tidak dikosongkan saat ada kesalahan.
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  };

  return (
    <form action={formAction} onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="_section" value={section} />
      <input type="hidden" name="_id" value={id ?? ""} />
      <input type="hidden" name="_from" value={from ?? ""} />
      {fields.map((f) => {
        const inputId = `p-${f.name}`;
        const error = errors[f.name];
        const invalid = error ? true : undefined;
        if (LOCALIZED.has(f.type)) {
          const long = f.type !== "ltext";
          const control = (lang: "id" | "en" | "ja", required: boolean) =>
            long ? (
              <textarea id={`${inputId}-${lang}`} name={`${f.name}.${lang}`} lang={lang} required={required} aria-invalid={invalid} defaultValue={initial[`${f.name}.${lang}`] ?? ""} className={textareaClass} />
            ) : (
              <input id={`${inputId}-${lang}`} name={`${f.name}.${lang}`} lang={lang} required={required} aria-invalid={invalid} defaultValue={initial[`${f.name}.${lang}`] ?? ""} className={inputClass} />
            );
          const translated = Boolean(initial[`${f.name}.en`] || initial[`${f.name}.ja`]);
          return (
            <div key={f.name} className="sm:col-span-2">
              <label htmlFor={`${inputId}-id`} className={labelClass}>
                {label(f)}
              </label>
              {control("id", Boolean(f.required))}
              {f.type === "lblocks" ? <p className="mt-1 text-xs text-muted">{t("web.form.blocksHint")}</p> : null}
              <details className="mt-2 rounded-md border border-border" open={translated}>
                <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-muted">
                  <Languages aria-hidden strokeWidth={1.5} className="size-4" />
                  {t("web.form.translations")}
                </summary>
                <div className="grid gap-3 border-t border-border p-3">
                  <p className="text-xs text-muted">{t("web.form.translationsHint")}</p>
                  {(["en", "ja"] as const).map((lang) => (
                    <div key={lang}>
                      <label htmlFor={`${inputId}-${lang}`} className={clsx(labelClass, "text-muted")}>
                        {t(`web.form.lang_${lang}`)}
                      </label>
                      {control(lang, false)}
                    </div>
                  ))}
                </div>
              </details>
              {error ? <p className="mt-1 text-xs text-danger">{t(error)}</p> : null}
            </div>
          );
        }
        const value = initial[f.name] ?? "";
        const common = { id: inputId, name: f.name, required: f.required, "aria-invalid": invalid } as const;
        return (
          <div key={f.name} className={clsx(f.type === "textarea" && "sm:col-span-2")}>
            {f.type === "bool" ? (
              <label className="flex h-11 items-center gap-3 text-sm font-medium">
                <input type="checkbox" name={f.name} defaultChecked={value === "true"} className="size-5 accent-[var(--primary)]" />
                {t(`web.fields.${f.name}`)}
              </label>
            ) : (
              <>
                <label htmlFor={inputId} className={labelClass}>
                  {label(f)}
                </label>
                {f.type === "textarea" ? (
                  <textarea {...common} defaultValue={value} className={textareaClass} />
                ) : f.type === "select" ? (
                  <select {...common} defaultValue={value} className={inputClass}>
                    <option value="">{t("common.choose")}</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {t(`web.options.${o}`)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...common}
                    defaultValue={value}
                    type={f.type === "date" ? "date" : f.type === "time" ? "time" : f.type === "datetime" ? "datetime-local" : f.type === "number" ? "number" : "text"}
                    inputMode={f.type === "number" ? "decimal" : undefined}
                    min={f.type === "number" ? 0 : undefined}
                    className={clsx(inputClass, f.type === "number" && "tabular")}
                  />
                )}
              </>
            )}
            {error ? <p className="mt-1 text-xs text-danger">{t(error)}</p> : null}
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass("primary")}>
          {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
          {pending ? t("common.saving") : t("web.form.save")}
        </button>
        <Link href={`/web/${section}`} className={buttonClass("ghost")}>
          {t("common.cancel")}
        </Link>
        {state && !state.ok ? (
          <p role="alert" className="text-sm text-danger">
            {t.has(state.error.message) ? t(state.error.message) : t("errors.internal")}
          </p>
        ) : null}
      </div>
    </form>
  );
}
