import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { readUpload } from "@/lib/storage";

/** Bukti dan foto hanya bisa dibuka pengurus yang sedang masuk. */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!(await getSession())) return new NextResponse(null, { status: 401 });
  const file = await readUpload((await params).path.join("/"));
  if (!file) return new NextResponse(null, { status: 404 });
  if ("redirect" in file) return NextResponse.redirect(file.redirect);
  return new NextResponse(new Uint8Array(file.body), {
    headers: { "Content-Type": file.type, "Cache-Control": "private, max-age=300", "Content-Disposition": "inline" },
  });
}
