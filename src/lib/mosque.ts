import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { pickL10n } from "./publicweb/content";
import { publicSiteUrl, publicStore, publicWebMode } from "./publicweb/store";

/**
 * Identitas masjid, sama dengan yang tampil di web publik. Nilai bawaan disalin dari profil web publik
 * (src/data/profile.ts di repo web publik); bila database web publik tersambung, nilai yang disimpan
 * pengurus di sana (menu Info & kontak masjid) dipakai, sehingga kop surat dan halaman masuk
 * selalu sama dengan web publik tanpa diisi dua kali.
 */
export interface MosqueInfo {
  name: string;
  logoName: string;
  logoTagline: string;
  tagline: string;
  city: string;
  address: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  partners: string[];
}

const TAGLINE: Record<string, string> = {
  id: "Masjid dan pusat budaya Islam di Matsudo, Chiba",
  en: "A mosque and Islamic cultural center in Matsudo, Chiba",
  ja: "千葉・松戸のモスクとイスラム文化センター",
};
const ADDRESS: Record<string, string> = {
  id: "Kota Matsudo, Prefektur Chiba, Jepang",
  en: "Matsudo City, Chiba Prefecture, Japan",
  ja: "千葉県松戸市",
};

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");

/** Tag cache profil masjid; disegarkan saat menu Info & kontak masjid disimpan. */
export const PROFILE_TAG = "public-profile";

/**
 * Profil dari database web publik, di-cache satu jam lintas permintaan. Tanpa ini setiap pindah
 * halaman menunggu satu panggilan ke database web publik hanya untuk nama dan alamat di menu.
 */
const storedProfile = unstable_cache(
  async (): Promise<Record<string, unknown>> => {
    if (publicWebMode === "off") return {};
    try {
      return (((await publicStore().list("site_settings", { key: "profile" }))[0]?.value ?? {}) as Record<string, unknown>) ?? {};
    } catch {
      // Web publik sedang tidak terjangkau: pakai nilai bawaan.
      return {};
    }
  },
  ["public-profile"],
  { revalidate: 3600, tags: [PROFILE_TAG] },
);

export const getMosqueInfo = cache(async (locale: string): Promise<MosqueInfo> => {
  const stored = await storedProfile();
  return {
    name: pickL10n(stored.name, locale) || "Al Muttaqin Cultural Center",
    logoName: "Masjid Al Muttaqin Chiba",
    logoTagline: "Mualaf & Islamic Cultural Center",
    tagline: pickL10n(stored.tagline, locale) || TAGLINE[locale] || TAGLINE.id,
    city: "Matsudo, Chiba",
    address: pickL10n(stored.address, locale) || ADDRESS[locale] || ADDRESS.id,
    postalCode: text(stored.postalCode) || "271-0092",
    phone: text(stored.phone),
    email: text(stored.email) || "info@almuttaqinculturalcenter.org",
    website: publicSiteUrl,
    partners: ["Chiba Islamic Culture Center", "Dompet Dhuafa Japan"],
  };
});
