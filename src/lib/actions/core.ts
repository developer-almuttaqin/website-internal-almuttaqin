import "server-only";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db, type Db } from "../db";
import { getSession } from "../session";
import { PublicWebError } from "../publicweb/store";
import { UploadError } from "../storage";
import type { Profile, Role } from "../types";

export type ActionErrorCode = "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN" | "RATE_LIMITED" | "NOT_FOUND" | "CONFLICT" | "INTERNAL";

/** Bentuk hasil seragam (PRD-12). `message` berisi kunci terjemahan, bukan kalimat jadi. */
export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ActionErrorCode; message: string; fieldErrors?: Record<string, string> } };

export class ActionError extends Error {
  constructor(
    public code: ActionErrorCode,
    public messageKey: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(messageKey);
  }
}

const MESSAGE: Record<ActionErrorCode, string> = {
  VALIDATION: "errors.validation",
  UNAUTHORIZED: "errors.unauthorized",
  FORBIDDEN: "errors.forbidden",
  RATE_LIMITED: "errors.rateLimited",
  NOT_FOUND: "errors.notFound",
  CONFLICT: "errors.conflict",
  INTERNAL: "errors.internal",
};

const hits = new Map<string, number[]>();
const LIMIT = 60;
const WINDOW_MS = 60_000;

/** Batas 60 aksi per menit per pengguna; cukup untuk 7 akun dan menahan kiriman berulang. */
export function rateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > LIMIT;
}

export interface ActionContext {
  user: Profile;
  db: Db;
}

interface Options<S extends z.ZodType> {
  /** Nama aksi untuk log aktivitas, mis. "expense.approve". */
  name: string;
  schema: S;
  roles?: readonly Role[];
  /** Ringkasan untuk log aktivitas. */
  summary?: (input: z.infer<S>) => string;
  /** Lewati log aktivitas bila aksi tidak mengubah apa pun (mis. sinkron otomatis tanpa data baru). */
  quiet?: (result: unknown) => boolean;
}

/**
 * Pembungkus semua mutasi: validasi Zod, cek sesi dan peran, rate limit,
 * catat ke log aktivitas (siapa, apa, kapan), lalu revalidate.
 */
export function createAction<S extends z.ZodType, T>(opts: Options<S>, handler: (input: z.infer<S>, ctx: ActionContext) => Promise<T>) {
  return async (raw: unknown): Promise<ActionResult<T>> => {
    try {
      const user = await getSession();
      if (!user) throw new ActionError("UNAUTHORIZED", MESSAGE.UNAUTHORIZED);
      if (opts.roles && !opts.roles.includes(user.role)) throw new ActionError("FORBIDDEN", MESSAGE.FORBIDDEN);
      if (rateLimited(user.id)) throw new ActionError("RATE_LIMITED", MESSAGE.RATE_LIMITED);

      const parsed = opts.schema.safeParse(raw);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "_")] ??= "errors.field";
        return { ok: false, error: { code: "VALIDATION", message: MESSAGE.VALIDATION, fieldErrors } };
      }

      const data = await handler(parsed.data, { user, db });
      const entityId = data && typeof data === "object" && "id" in data ? String((data as { id: unknown }).id) : null;
      try {
        if (!opts.quiet?.(data)) await db.append("activity_logs", {
          actor_id: user.id,
          actor_name: user.full_name,
          action: opts.name,
          entity: opts.name.split(".")[0],
          entity_id: entityId,
          summary: opts.summary?.(parsed.data) ?? null,
        });
      } catch (logError) {
        // Log tidak boleh menggagalkan aksi yang sudah berhasil, tetapi kegagalannya harus terlihat di log server.
        console.error(`[action ${opts.name}] log aktivitas gagal:`, logError instanceof Error ? logError.message : logError);
      }
      revalidatePath("/", "layout");
      return { ok: true, data };
    } catch (err) {
      if (err instanceof ActionError) return { ok: false, error: { code: err.code, message: err.messageKey, fieldErrors: err.fieldErrors } };
      if (err instanceof UploadError) return { ok: false, error: { code: "VALIDATION", message: err.message } };
      if (err instanceof PublicWebError) {
        if (err.code === "FAILED") console.error(`[action ${opts.name}] web publik:`, err.message);
        return { ok: false, error: { code: err.code === "FAILED" ? "INTERNAL" : "CONFLICT", message: `web.errors.${err.code.toLowerCase()}` } };
      }
      if (err instanceof Error && err.message === "NOT_FOUND") return { ok: false, error: { code: "NOT_FOUND", message: MESSAGE.NOT_FOUND } };
      console.error(`[action ${opts.name}]`, err);
      return { ok: false, error: { code: "INTERNAL", message: MESSAGE.INTERNAL } };
    }
  };
}
