import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Converter } from "@/components/converter";
import { translator } from "@/i18n/messages";
import { getServerLang } from "@/i18n/server";
import { getAndroidRelease, isIOS } from "@/lib/android-release";
import { formatDecimal, formatDms, toParam } from "@/lib/coordinates";
import { detectPlatform } from "@/lib/deep-links";
import { parseInput } from "@/lib/map-urls";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim();

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const coords = parseInput(first(sp.c) ?? "");
  if (!coords) return {};
  const t = translator(await getServerLang());
  const title = `${formatDecimal(coords)} · ${t("appTitle")}`;
  const description = t("metaCoord", { dms: formatDms(coords) });
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

  // O botão do app Android não aparece no iPhone/iPad (APK não instala lá).
  const ua = (await headers()).get("user-agent");
  const androidApp = isIOS(ua) ? null : await getAndroidRelease();

  return (
    <Converter
      initialInput={coords ? formatDecimal(coords) : raw}
      initialCoords={coords}
      initialError={!!raw && !coords}
      androidApp={androidApp}
      platform={detectPlatform(ua)}
    />
  );
}
