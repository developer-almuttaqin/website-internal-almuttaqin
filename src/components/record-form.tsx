"use client";

import clsx from "clsx";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { startTransition, useActionState, useEffect, type FormEvent } from "react";
import { saveRecord } from "@/lib/actions/records";
import type { FieldDef } from "@/lib/resources";
import { buttonClass, inputClass, labelClass, textareaClass } from "./ui";

export interface FormField extends FieldDef {
  refOptions?: { value: string; label: string }[];
}

/** Formulir generik untuk semua modul data; kolomnya berasal dari konfigurasi resource. */
export function RecordForm({ resource, id, fields, initial, hint }: { resource: string; id?: string; fields: FormField[]; initial: Record<string, string>; hint?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveRecord, null);
  const errors = state && !state.ok ? (state.error.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (state?.ok) {
      router.push(`/${resource}`);
      router.refresh();
    }
  }, [state, resource, router]);

  // Dikirim lewat transition, bukan lewat `action` bawaan, supaya isian tidak dikosongkan saat ada kesalahan.
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  };

  return (
    <form action={formAction} onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="_resource" value={resource} />
      <input type="hidden" name="_id" value={id ?? ""} />
      {fields.map((f) => {
        const inputId = `f-${f.name}`;
        const error = errors[f.name];
        const common = { id: inputId, name: f.name, required: f.required, "aria-invalid": error ? true : undefined } as const;
        const value = initial[f.name] ?? "";
        const wide = f.type === "textarea";
        return (
          <div key={f.name} className={clsx(wide && "sm:col-span-2")}>
            {f.type === "bool" ? (
              <label className="flex h-11 items-center gap-3 text-sm font-medium">
                <input type="checkbox" name={f.name} defaultChecked={value === "true"} className="size-5 accent-[var(--primary)]" />
                {t(`fields.${f.name}`)}
              </label>
            ) : (
              <>
                <label htmlFor={inputId} className={labelClass}>
                  {t(`fields.${f.name}`)}
                  {f.required ? null : <span className="ml-1 font-normal text-muted">({t("common.optional")})</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea {...common} defaultValue={value} className={textareaClass} />
                ) : f.type === "select" ? (
                  <select {...common} defaultValue={value} className={inputClass}>
                    <option value="">{t("common.choose")}</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {t(`options.${o}`)}
                      </option>
                    ))}
                  </select>
                ) : f.type === "ref" ? (
                  <select {...common} defaultValue={value} className={inputClass}>
                    <option value="">{t("common.choose")}</option>
                    {f.refOptions?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "file" ? (
                  <>
                    <input id={inputId} name={f.name} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className={clsx(inputClass, "py-2")} />
                    <p className="mt-1 text-xs text-muted">{value ? `${t("common.currentFile")}. ` : ""}{t("common.fileHint")}</p>
                  </>
                ) : (
                  <input
                    {...common}
                    defaultValue={value}
                    type={f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : f.type === "number" || f.type === "money" ? "number" : "text"}
                    inputMode={f.type === "number" || f.type === "money" ? "decimal" : undefined}
                    min={f.type === "number" || f.type === "money" ? 0 : undefined}
                    step={f.type === "money" ? "any" : undefined}
                    className={clsx(inputClass, (f.type === "number" || f.type === "money") && "tabular")}
                  />
                )}
              </>
            )}
            {error ? <p className="mt-1 text-xs text-danger">{t(error)}</p> : null}
          </div>
        );
      })}
      {hint ? <p className="text-xs text-muted sm:col-span-2">{hint}</p> : null}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass("primary")}>
          {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
          {pending ? t("common.saving") : t("common.save")}
        </button>
        <Link href={`/${resource}`} className={buttonClass("ghost")}>
          {t("common.cancel")}
        </Link>
        {state && !state.ok ? <p role="alert" className="text-sm text-danger">{t.has(state.error.message) ? t(state.error.message) : t("errors.internal")}</p> : null}
      </div>
    </form>
  );
}
