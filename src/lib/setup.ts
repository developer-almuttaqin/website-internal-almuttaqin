import "server-only";
import { hasServiceRole, supabaseAdmin } from "./db";

/**
 * Benar bila database Supabase sudah terpasang tetapi belum ada satu pun pengurus:
 * saat itu halaman /setup dibuka untuk membuat akun direktur pertama.
 */
export async function needsSetup(): Promise<boolean> {
  if (!hasServiceRole) return false;
  try {
    const { count, error } = await supabaseAdmin().from("profiles").select("id", { count: "exact", head: true });
    return !error && count === 0;
  } catch {
    return false;
  }
}
