import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth-shell";
import { needsSetup } from "@/lib/setup";
import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

/** Langkah pertama setelah database terpasang: membuat akun direktur. Tertutup begitu ada satu pengurus. */
export default async function SetupPage() {
  if (!(await needsSetup())) redirect("/login");
  const t = await getTranslations();
  return (
    <AuthShell tag={t("setup.tag")} titleA={t("setup.titleA")} titleB={t("setup.titleB")} subtitle={t("setup.subtitle")}>
      <SetupForm />
    </AuthShell>
  );
}
