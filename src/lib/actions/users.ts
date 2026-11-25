"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isDemo, supabaseAdmin, supabaseServer } from "../db";
import { needsSetup } from "../setup";
import { ROLES } from "../types";
import { ActionError, createAction, rateLimited } from "./core";

const name = z.string().trim().min(2).max(100);
const email = z.string().trim().toLowerCase().email().max(200);
const password = z.string().min(8).max(200);
const role = z.enum(ROLES);

function fields<S extends z.ZodType>(schema: S, form: FormData): z.infer<S> {
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) throw new ActionError("VALIDATION", "errors.validation", Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), "errors.field"])));
  return parsed.data;
}

/* ------------------------------ Akun direktur pertama ------------------------------ */

/**
 * Hanya berjalan selama belum ada pengurus sama sekali, dan hanya dengan SETUP_CODE dari
 * pengaturan server, supaya orang lain tidak bisa mendahului membuat akun direktur.
 */
export async function bootstrapDirector(_prev: { error: string } | null, form: FormData): Promise<{ error: string } | null> {
  if (rateLimited("setup")) return { error: "errors.rateLimited" };
  if (!(await needsSetup())) return { error: "setup.errors.done" };
  const input = z.object({ code: z.string().min(1).max(200), full_name: name, email, password }).safeParse(Object.fromEntries(form.entries()));
  if (!input.success) return { error: "setup.errors.invalid" };
  const expected = process.env.SETUP_CODE ?? "";
  const given = input.data.code.trim();
  if (expected.length < 12 || given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return { error: "setup.errors.code" };

  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({ email: input.data.email, password: input.data.password, email_confirm: true, user_metadata: { full_name: input.data.full_name } });
  if (error || !data.user) return { error: /already|registered|exists/i.test(error?.message ?? "") ? "users.errors.emailTaken" : "errors.internal" };
  const { error: profileError } = await admin.from("profiles").insert({ id: data.user.id, full_name: input.data.full_name, email: input.data.email, role: "direktur", active: true });
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    console.error("[setup]", profileError.message);
    return { error: "errors.internal" };
  }
  const sb = await supabaseServer();
  await sb.auth.signInWithPassword({ email: input.data.email, password: input.data.password });
  redirect("/");
}

/* ------------------------------ Kelola pengurus (direktur) ------------------------------ */

export const createUser = createAction({ name: "user.create", roles: ["direktur"], schema: z.instanceof(FormData), summary: (f) => `${String(f.get("email"))} (${String(f.get("role"))})`.slice(0, 200) }, async (form, { db }) => {
  const input = fields(z.object({ full_name: name, email, role, password }), form);
  if ((await db.list("profiles")).some((p) => p.email.toLowerCase() === input.email)) throw new ActionError("CONFLICT", "users.errors.emailTaken");
  if (isDemo) return db.insert("profiles", { full_name: input.full_name, email: input.email, role: input.role, active: true });

  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({ email: input.email, password: input.password, email_confirm: true, user_metadata: { full_name: input.full_name } });
  if (error || !data.user) {
    if (/already|registered|exists/i.test(error?.message ?? "")) throw new ActionError("CONFLICT", "users.errors.emailTaken");
    throw new Error(error?.message ?? "createUser");
  }
  const { error: profileError } = await admin.from("profiles").insert({ id: data.user.id, full_name: input.full_name, email: input.email, role: input.role, active: true });
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw new Error(profileError.message);
  }
  return { id: data.user.id };
});

export const updateUser = createAction({ name: "user.update", roles: ["direktur"], schema: z.instanceof(FormData), summary: (f) => `${String(f.get("full_name"))} (${String(f.get("role"))})`.slice(0, 200) }, async (form, { db, user }) => {
  const input = fields(z.object({ id: z.string().min(1), full_name: name, role }), form);
  // Direktur tidak bisa menurunkan perannya sendiri: selalu harus ada yang bisa menyetujui.
  if (input.id === user.id && input.role !== "direktur") throw new ActionError("CONFLICT", "users.errors.self");
  await db.update("profiles", input.id, { full_name: input.full_name, role: input.role });
  return { id: input.id };
});

export const setUserActive = createAction({ name: "user.active", roles: ["direktur"], schema: z.object({ id: z.string().min(1), active: z.boolean() }), summary: (i) => (i.active ? "aktif" : "nonaktif") }, async ({ id, active }, { db, user }) => {
  if (id === user.id) throw new ActionError("CONFLICT", "users.errors.self");
  await db.update("profiles", id, { active });
  return { id };
});

export const resetUserPassword = createAction({ name: "user.password", roles: ["direktur"], schema: z.instanceof(FormData), summary: () => "kata sandi diganti" }, async (form, { db }) => {
  const input = fields(z.object({ id: z.string().min(1), password }), form);
  if (!(await db.get("profiles", input.id))) throw new ActionError("NOT_FOUND", "errors.notFound");
  if (isDemo) throw new ActionError("CONFLICT", "account.demo");
  const { error } = await supabaseAdmin().auth.admin.updateUserById(input.id, { password: input.password });
  if (error) throw new Error(error.message);
  return { id: input.id };
});

/* ------------------------------ Akun sendiri ------------------------------ */

export const changeOwnPassword = createAction({ name: "account.password", schema: z.instanceof(FormData), summary: () => "kata sandi sendiri" }, async (form, { user }) => {
  const input = fields(z.object({ current: z.string().min(1).max(200), password }), form);
  if (isDemo) throw new ActionError("CONFLICT", "account.demo");
  const sb = await supabaseServer();
  const check = await sb.auth.signInWithPassword({ email: user.email, password: input.current });
  if (check.error) throw new ActionError("VALIDATION", "account.wrongCurrent", { current: "errors.field" });
  const { error } = await sb.auth.updateUser({ password: input.password });
  if (error) throw new ActionError("VALIDATION", "account.rejected");
  return { id: user.id };
});
