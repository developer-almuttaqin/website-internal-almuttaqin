import { useTranslations } from "next-intl";

/**
 * Kerangka halaman yang tampil seketika saat pindah menu, selagi data dimuat di server.
 * Dengan berkas ini Next.js juga memuat kerangka tiap menu lebih dulu (prefetch), sehingga
 * klik terasa langsung berpindah dan tidak tertahan di halaman lama.
 */
export default function Loading() {
  const t = useTranslations("common");
  const bar = "rounded-md bg-surface motion-safe:animate-pulse";
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden className="flex flex-col gap-3">
        <div className={`${bar} h-6 w-32 rounded-full`} />
        <div className={`${bar} h-8 w-2/3 max-w-md`} />
        <div className={`${bar} h-4 w-full max-w-xl`} />
      </div>
      <div aria-hidden className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-card">
            <div className={`${bar} h-4 w-1/2`} />
            <div className={`${bar} h-7 w-3/4`} />
            <div className={`${bar} h-3 w-full`} />
          </div>
        ))}
      </div>
      <div aria-hidden className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5 shadow-card">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`${bar} h-10 w-full`} />
        ))}
      </div>
    </div>
  );
}
