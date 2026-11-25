import { notFound } from "next/navigation";
import { ResourceView, type SearchParams } from "@/components/resource-view";
import type { Module } from "@/lib/permissions";
import { RESOURCES } from "@/lib/resources";
import { requireModule } from "@/lib/session";
import { getExtras } from "./extras";

/** Modul yang punya halaman khusus sendiri tidak dilayani oleh rute generik ini. */
const CUSTOM = new Set(["donasi", "tpa"]);

export default async function ResourcePage({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<SearchParams> }) {
  const { resource } = await params;
  const res = RESOURCES[resource as Module];
  if (!res || CUSTOM.has(resource)) notFound();
  const user = await requireModule(res.key);
  const extras = await getExtras(res.key, user);
  return <ResourceView res={res} user={user} searchParams={await searchParams} {...extras} />;
}
