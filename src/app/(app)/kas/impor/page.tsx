import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LinkButton, PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { canWrite } from "@/lib/permissions";
import { requireModule } from "@/lib/session";
import { CashImport } from "./cash-import";

export default async function CashImportPage() {
  const user = await requireModule("kas");
  if (!canWrite(user.role, "kas")) redirect("/kas");
  const t = await getTranslations("kas");
  const accounts = (await db.list("accounts")).map((a) => ({ id: a.id, name: a.name }));
  return (
    <>
      <PageHeader
        tag={t("importTag")}
        title={t("importTitleA")}
        accent={t("importTitleB")}
        actions={
          <LinkButton href="/kas" variant="outline" size="sm">
            {t("toCash")}
          </LinkButton>
        }
      />
      <CashImport accounts={accounts} />
    </>
  );
}
