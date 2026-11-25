import { notFound } from "next/navigation";
import { PublicSectionView } from "@/components/public-section-view";
import type { SearchParams } from "@/components/resource-view";
import { db } from "@/lib/db";
import { isoToJstLocal } from "@/lib/format";
import { canWrite } from "@/lib/permissions";
import { findSection } from "@/lib/publicweb/sections";
import { requireModule } from "@/lib/session";

const CATEGORY: Record<string, string> = { kajian: "kajian", class: "class", jumuah: "community", meeting: "community", other: "community" };

export default async function PublicSectionPage({ params, searchParams }: { params: Promise<{ bagian: string }>; searchParams: Promise<SearchParams> }) {
  const { bagian } = await params;
  const section = findSection(bagian);
  if (!section) notFound();
  const user = await requireModule(section.module);
  const query = await searchParams;

  // Agenda bisa dibuat dari kegiatan internal: isian awal diambil dari kegiatan itu, tanpa diketik ulang.
  let prefill: Record<string, string> | undefined;
  const from = typeof query.dari === "string" ? query.dari : undefined;
  if (section.key === "agenda" && from && canWrite(user.role, "agenda")) {
    const event = await db.get("events", from);
    if (event && !event.public_ref) {
      const end = new Date(Date.parse(event.starts_at) + 2 * 60 * 60 * 1000).toISOString();
      prefill = {
        "title.id": event.title,
        category: CATEGORY[event.kind] ?? "community",
        starts_at: isoToJstLocal(event.starts_at),
        ends_at: isoToJstLocal(end),
        "location.id": event.location ?? "",
        speaker: event.officer ?? "",
        "description.id": event.notes ?? "",
        status: "published",
      };
    }
  }

  return <PublicSectionView section={section} user={user} searchParams={query} prefill={prefill} from={prefill ? from : undefined} />;
}
