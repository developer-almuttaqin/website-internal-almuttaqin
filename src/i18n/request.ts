import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALES, type Locale } from "@/lib/types";

/** Bahasa antarmuka disimpan di cookie (tanpa prefiks rute); bawaan bahasa Indonesia. */
export default getRequestConfig(async () => {
  const value = (await cookies()).get("acc_locale")?.value as Locale | undefined;
  const locale: Locale = value && LOCALES.includes(value) ? value : "id";
  return {
    locale,
    timeZone: "Asia/Tokyo",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
