"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { syncPublic } from "@/lib/actions/publicweb";

const KEY = "acc_public_sync";
const EVERY_MS = 3 * 60_000;

/**
 * Menarik formulir baru dari web publik di latar belakang (paling sering tiap 3 menit per tab),
 * supaya permintaan ruangan dan konfirmasi donasi muncul sendiri tanpa menekan tombol.
 */
export function AutoSync() {
  const router = useRouter();
  useEffect(() => {
    const last = Number(window.sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < EVERY_MS) return;
    window.sessionStorage.setItem(KEY, String(Date.now()));
    let cancelled = false;
    void syncPublic({}).then((result) => {
      if (cancelled || !result.ok) return;
      const { bookings, donations, donors } = result.data;
      if (bookings + donations + donors > 0) router.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [router]);
  return null;
}
