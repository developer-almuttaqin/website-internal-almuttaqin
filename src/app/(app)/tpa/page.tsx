import { getTranslations } from "next-intl/server";
import { ActionForm } from "@/components/client";
import { ResourceView, type SearchParams } from "@/components/resource-view";
import { Card, buttonClass, inputClass, labelClass } from "@/components/ui";
import { saveAttendance } from "@/lib/actions/workflow";
import { db } from "@/lib/db";
import { dateJst } from "@/lib/format";
import { canWrite } from "@/lib/permissions";
import { RESOURCES } from "@/lib/resources";
import { requireModule } from "@/lib/session";

const STATUSES = ["present", "permit", "sick", "absent"] as const;

export default async function TpaPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireModule("tpa");
  const t = await getTranslations();
  const sp = await searchParams;
  const requested = typeof sp.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : null;
  const date = requested ?? dateJst();
  const writable = canWrite(user.role, "tpa");
  const [students, attendance] = await Promise.all([db.list("tpa_students"), db.list("tpa_attendance")]);
  const active = students.filter((s) => s.active).sort((a, b) => a.full_name.localeCompare(b.full_name));
  const today = new Map(attendance.filter((a) => a.date === date).map((a) => [a.student_id, a.status]));

  const attendanceCard = (
        <Card className="mb-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-semibold">{t("tpa.attendanceTitle")}</h2>
            <form action="/tpa" className="flex items-end gap-2">
              <label className="block">
                <span className={labelClass}>{t("tpa.date")}</span>
                <input type="date" name="date" defaultValue={date} className={inputClass} />
              </label>
              <button type="submit" className={buttonClass("outline")}>
                {t("tpa.show")}
              </button>
            </form>
          </div>
          {active.length === 0 ? (
            <p className="text-sm text-muted">{t("tpa.noStudents")}</p>
          ) : (
            <ActionForm key={date} action={saveAttendance} submitLabel={t("tpa.save")} successText={t("tpa.saved")}>
              <input type="hidden" name="date" value={date} />
              <ul className="flex flex-col divide-y divide-border">
                {active.map((s) => (
                  <li key={s.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{s.full_name}</p>
                      <p className="text-sm text-muted">{s.class_name}</p>
                    </div>
                    <fieldset disabled={!writable} className="flex flex-wrap gap-2">
                      <legend className="sr-only">{s.full_name}</legend>
                      {STATUSES.map((status) => (
                        <label key={status} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-primary-soft has-checked:text-accent">
                          <input type="radio" name={`status_${s.id}`} value={status} defaultChecked={(today.get(s.id) ?? "present") === status} className="accent-[var(--primary)]" />
                          {t(`options.${status}`)}
                        </label>
                      ))}
                    </fieldset>
                  </li>
                ))}
              </ul>
            </ActionForm>
          )}
        </Card>
  );

  return (
    <ResourceView
      res={RESOURCES.tpa!}
      user={user}
      searchParams={sp}
      header={
        <>
          {attendanceCard}
          <h2 className="mb-3 text-lg font-semibold">{t("tpa.students")}</h2>
        </>
      }
    />
  );
}
