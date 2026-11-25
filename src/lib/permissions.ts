import type { Role } from "./types";

const ALL: Role[] = ["direktur", "bendahara", "sekretaris", "ibadah", "pendidikan", "fasilitas", "pembimbing"];
const FINANCE: Role[] = ["direktur", "bendahara"];

/**
 * Hak akses per modul. Aturan direktur: hanya direktur yang menyetujui pengeluaran dan
 * peminjaman ruangan; bendahara mengajukan dan membayar tetapi tidak bisa menyetujui.
 */
export const ACCESS = {
  dashboard: { read: ALL, write: [] },
  pengajuan: { read: ALL, write: ALL },
  kas: { read: FINANCE, write: ["bendahara"] },
  akun: { read: FINANCE, write: ["bendahara", "direktur"] },
  anggaran: { read: FINANCE, write: ["bendahara", "direktur"] },
  tagihan: { read: FINANCE, write: ["bendahara"] },
  donasi: { read: FINANCE, write: ["bendahara"] },
  donatur: { read: FINANCE, write: ["bendahara"] },
  laporan: { read: FINANCE, write: [] },
  jamaah: { read: ["direktur", "sekretaris"], write: ["sekretaris"] },
  muallaf: { read: ["direktur", "sekretaris", "pembimbing"], write: ["sekretaris", "pembimbing"] },
  tpa: { read: ["direktur", "pendidikan"], write: ["pendidikan"] },
  kegiatan: { read: ALL, write: ["direktur", "sekretaris", "ibadah", "pendidikan"] },
  inventaris: { read: ["direktur", "bendahara", "sekretaris", "fasilitas"], write: ["fasilitas"] },
  kerusakan: { read: ALL, write: ALL },
  ruangan: { read: ["direktur", "sekretaris", "fasilitas"], write: ["sekretaris", "fasilitas"] },
  surat: { read: ["direktur", "sekretaris"], write: ["sekretaris"] },
  templat: { read: ["direktur", "sekretaris"], write: ["sekretaris"] },
  pengguna: { read: ["direktur"], write: ["direktur"] },
  log: { read: ["direktur"], write: [] },
  // Web publik (database kedua): konten yang tampil ke jamaah diisi dari sini, satu kali saja.
  web: { read: ALL, write: [] },
  jumat: { read: ALL, write: ["direktur", "sekretaris", "ibadah"] },
  pengumuman: { read: ALL, write: ["direktur", "sekretaris"] },
  agenda: { read: ALL, write: ["direktur", "sekretaris", "ibadah", "pendidikan"] },
  kotakmasuk: { read: ["direktur", "sekretaris", "pendidikan", "fasilitas"], write: ["direktur", "sekretaris", "pendidikan", "fasilitas"] },
  rekening: { read: FINANCE, write: FINANCE },
  programdonasi: { read: FINANCE, write: ["bendahara"] },
  transparansi: { read: FINANCE, write: FINANCE },
  profil: { read: ["direktur", "sekretaris"], write: ["direktur", "sekretaris"] },
} as const satisfies Record<string, { read: readonly Role[]; write: readonly Role[] }>;

export type Module = keyof typeof ACCESS;

export function canRead(role: Role, module: Module): boolean {
  return (ACCESS[module].read as readonly Role[]).includes(role);
}

export function canWrite(role: Role, module: Module): boolean {
  return (ACCESS[module].write as readonly Role[]).includes(role);
}

export const APPROVER: Role = "direktur";
export const PAYER: Role = "bendahara";

/** Susunan menu; modul hanya tampil bila peran boleh membacanya. */
export const NAV: { group: string; items: { module: Module; href: string; icon: string }[] }[] = [
  { group: "main", items: [{ module: "dashboard", href: "/", icon: "LayoutDashboard" }, { module: "pengajuan", href: "/pengajuan", icon: "ClipboardCheck" }] },
  {
    group: "finance",
    items: [
      { module: "kas", href: "/kas", icon: "Wallet" },
      { module: "donasi", href: "/donasi", icon: "HandCoins" },
      { module: "tagihan", href: "/tagihan", icon: "Receipt" },
      { module: "anggaran", href: "/anggaran", icon: "ChartPie" },
      { module: "donatur", href: "/donatur", icon: "HeartHandshake" },
      { module: "laporan", href: "/laporan", icon: "FileChartColumn" },
    ],
  },
  {
    group: "people",
    items: [
      { module: "jamaah", href: "/jamaah", icon: "Users" },
      { module: "muallaf", href: "/muallaf", icon: "UserRoundPlus" },
      { module: "tpa", href: "/tpa", icon: "GraduationCap" },
      { module: "kegiatan", href: "/kegiatan", icon: "CalendarDays" },
    ],
  },
  {
    group: "facility",
    items: [
      { module: "ruangan", href: "/ruangan", icon: "DoorOpen" },
      { module: "inventaris", href: "/inventaris", icon: "Package" },
      { module: "kerusakan", href: "/kerusakan", icon: "Wrench" },
    ],
  },
  {
    group: "web",
    items: [
      { module: "web", href: "/web", icon: "Globe" },
      { module: "jumat", href: "/web/jumat", icon: "MoonStar" },
      { module: "pengumuman", href: "/web/pengumuman", icon: "Megaphone" },
      { module: "agenda", href: "/web/agenda", icon: "CalendarRange" },
      { module: "kotakmasuk", href: "/web/kotak-masuk", icon: "Inbox" },
    ],
  },
  {
    group: "admin",
    items: [
      { module: "surat", href: "/surat", icon: "FileText" },
      { module: "pengguna", href: "/pengguna", icon: "ShieldCheck" },
      { module: "log", href: "/log", icon: "History" },
    ],
  },
];
