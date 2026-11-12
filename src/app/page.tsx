import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Converter } from "@/components/converter";
import { NOT_FOUND_MESSAGE } from "@/lib/messages";
import { formatDecimal, formatDms, toParam } from "@/lib/coordinates";
import { parseInput } from "@/lib/map-urls";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim();

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const coords = parseInput(first(sp.c) ?? "");
  if (!coords) return {};
  const title = `${formatDecimal(coords)} · Conversor de Coordenadas`;
  const description = `${formatDms(coords)} — abra no Waze, Google Maps ou Apple Maps.`;
  return {
    title,
    description,
    openGraph: { title, description, url: `/?c=${toParam(coords)}` },
    robots: { index: false },
  };
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw = first(sp.c) ?? first(sp.coord) ?? "";

  // Links curtos e lugares por nome já foram resolvidos no proxy (src/proxy.ts).
  const coords = raw ? parseInput(raw) : null;
  if (coords) {
    const canonical = toParam(coords);
    // Troca a entrada pela localização limpa: /?c=lat,lng
    if (raw !== canonical) redirect(`/?c=${canonical}`);
  }

  return (
    <Converter
      initialInput={coords ? formatDecimal(coords) : raw}
      initialCoords={coords}
      initialError={raw && !coords ? NOT_FOUND_MESSAGE : null}
    />
  );
}
