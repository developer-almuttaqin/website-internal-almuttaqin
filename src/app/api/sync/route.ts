import { NextResponse } from "next/server";
import { syncPublic } from "@/lib/actions/publicweb";

/**
 * Penarikan formulir web publik di latar belakang (dipanggil AutoSync). Sengaja berupa route handler,
 * bukan Server Action: Server Action yang sedang berjalan menahan navigasi berikutnya di peramban,
 * sehingga klik menu pertama setelah membuka web terasa tertahan sampai penarikan selesai.
 * Sesi, peran, batas laju, dan log tetap diperiksa oleh syncPublic (createAction).
 */
export async function POST(request: Request) {
  // Hanya dari halaman web internal sendiri.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) return NextResponse.json({ ok: false }, { status: 403 });
  const result = await syncPublic({});
  return NextResponse.json(result, { status: result.ok ? 200 : 400, headers: { "Cache-Control": "no-store" } });
}
