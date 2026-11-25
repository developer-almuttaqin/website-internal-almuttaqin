import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canRead, type Module } from "@/lib/permissions";
import { RESOURCES, scopeRows } from "@/lib/resources";
import { getSession } from "@/lib/session";
import type { AnyRow } from "@/lib/types";

function csvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  // Cegah rumus berbahaya saat file dibuka di Excel.
  if (/^[=+\-@]/.test(text) && typeof value !== "number") text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Ekspor CSV sebuah modul sesuai hak baca dan cakupan baris peran yang meminta. */
export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const user = await getSession();
  if (!user) return new NextResponse(null, { status: 401 });
  const key = (await params).resource as Module;
  const res = RESOURCES[key];
  if (!res || !canRead(user.role, key)) return new NextResponse(null, { status: 403 });

  const month = new URL(request.url).searchParams.get("bulan");
  let rows = scopeRows(key, user, (await db.list(res.table)) as unknown as AnyRow[]);
  if (key === "kas" && month && /^\d{4}-\d{2}$/.test(month)) rows = rows.filter((r) => String(r.entry_date).startsWith(month));

  const refFields = res.fields.filter((f) => f.type === "ref" && f.ref);
  const refs = new Map<string, Map<string, string>>();
  for (const f of refFields) {
    const list = (await db.list(f.ref!)) as unknown as AnyRow[];
    refs.set(f.name, new Map(list.map((r) => [r.id, String(r[f.refLabel!] ?? r.id)])));
  }
  const fields = res.fields.filter((f) => f.type !== "file");
  const extra = res.currencyField && !fields.some((f) => f.name === res.currencyField) ? [res.currencyField] : [];
  const lines = [[...fields.map((f) => f.name), ...extra].join(",")];
  for (const row of rows) {
    lines.push([...fields.map((f) => csvCell(f.type === "ref" ? (refs.get(f.name)?.get(String(row[f.name])) ?? "") : row[f.name])), ...extra.map((e) => csvCell(row[e]))].join(","));
  }
  return new NextResponse(`﻿${lines.join("\r\n")}`, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${key}${month ? `-${month}` : ""}.csv"` },
  });
}
