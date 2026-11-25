import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, isDemo, supabaseServer } from "./db";
import { canRead, type Module } from "./permissions";
import { LOCALES, type Locale, type Profile } from "./types";

export const DEMO_COOKIE = "acc_demo_user";
export const LOCALE_COOKIE = "acc_locale";
export const THEME_COOKIE = "acc_theme";

/** Id akun yang sedang masuk (Supabase Auth atau cookie demo), terlepas dari terdaftar tidaknya sebagai pengurus. */
const authUserId = cache(async (): Promise<string | undefined> => {
  if (isDemo) return (await cookies()).get(DEMO_COOKIE)?.value;
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  return data.user?.id;
});

/** Pengurus yang sedang masuk; null bila belum login atau akun dinonaktifkan. */
export const getSession = cache(async (): Promise<Profile | null> => {
  const id = await authUserId();
  if (!id) return null;
  const profile = await db.get("profiles", id);
  return profile && profile.active ? profile : null;
});

export async function requireSession(): Promise<Profile> {
  const user = await getSession();
  // Sudah masuk tetapi bukan pengurus aktif: ke halaman login dengan penjelasan, bukan berputar-putar.
  if (!user) redirect((await authUserId()) ? "/login?akun=nonaktif" : "/login");
  return user;
}

/** Dipakai di setiap halaman modul: peran yang tidak berhak dikembalikan ke dashboard. */
export async function requireModule(module: Module): Promise<Profile> {
  const user = await requireSession();
  if (!canRead(user.role, module)) redirect("/?denied=1");
  return user;
}

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value as Locale | undefined;
  return value && LOCALES.includes(value) ? value : "id";
}
