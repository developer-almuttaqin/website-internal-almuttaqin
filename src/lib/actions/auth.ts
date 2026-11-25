"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, isDemo, supabaseServer } from "../db";
import { DEMO_COOKIE, LOCALE_COOKIE, THEME_COOKIE } from "../session";
import { LOCALES } from "../types";

const YEAR = 60 * 60 * 24 * 365;
const WEEK = 60 * 60 * 24 * 7;

export async function login(_prev: { error: string } | null, form: FormData): Promise<{ error: string } | null> {
  if (isDemo) {
    const id = String(form.get("demo_user") ?? "");
    const profile = await db.get("profiles", id);
    if (!profile || !profile.active) return { error: "errors.login" };
    (await cookies()).set(DEMO_COOKIE, profile.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: WEEK, path: "/" });
  } else {
    const input = z.object({ email: z.string().email(), password: z.string().min(6).max(200) }).safeParse(Object.fromEntries(form.entries()));
    if (!input.success) return { error: "errors.login" };
    const sb = await supabaseServer();
    const { error } = await sb.auth.signInWithPassword(input.data);
    if (error) return { error: "errors.login" };
  }
  redirect("/");
}

export async function logout(): Promise<void> {
  if (isDemo) (await cookies()).delete(DEMO_COOKIE);
  else await (await supabaseServer()).auth.signOut();
  redirect("/login");
}

export async function setLocale(locale: string): Promise<void> {
  const value = z.enum(LOCALES).safeParse(locale);
  if (value.success) (await cookies()).set(LOCALE_COOKIE, value.data, { maxAge: YEAR, path: "/", sameSite: "lax" });
}

export async function setTheme(theme: string): Promise<void> {
  const value = z.enum(["light", "dark", "system"]).safeParse(theme);
  if (value.success) (await cookies()).set(THEME_COOKIE, value.data, { maxAge: YEAR, path: "/", sameSite: "lax" });
}
