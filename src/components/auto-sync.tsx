"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ActionResult } from "@/lib/actions/core";
import type { SyncResult } from "@/lib/publicweb/sync";

const KEY = "acc_public_sync";
const EVERY_MS = 3 * 60_000;

/**
 * Menarik formulir baru dari web publik di latar belakang (paling sering tiap 3 menit per tab),
 * supaya permintaan ruangan dan konfirmasi donasi muncul sendiri tanpa menekan tombol.
 * Memakai fetch biasa ke /api/sync agar tidak menahan navigasi (lihat route handler-nya).
 */
export function AutoSync() {
  const router = useRouter();
  useEffect(() => {
    let last = 0;
    try {
      last = Number(window.sessionStorage.getItem(KEY) ?? 0);
    } catch {
      // Penyimpanan sesi tidak tersedia: tetap tarik sekali.
    }
    if (Date.now() - last < EVERY_MS) return;
    const controller = new AbortController();
    // Ditunda sebentar supaya halaman pertama selesai dimuat lebih dulu.
    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(KEY, String(Date.now()));
      } catch {
        // Abaikan.
      }
      fetch("/api/sync", { method: "POST", signal: controller.signal, redirect: "manual" })
        .then((r) => (r.ok ? (r.json() as Promise<ActionResult<SyncResult>>) : null))
        .then((result) => {
          if (!result?.ok) return;
          const { bookings, donations, donors } = result.data;
          if (bookings + donations + donors > 0) router.refresh();
        })
        .catch(() => {
          // Gagal atau dibatalkan: dicoba lagi pada kunjungan berikutnya.
        });
    }, 1500);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [router]);
  return null;
}
