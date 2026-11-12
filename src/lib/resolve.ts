import "server-only";
import { parseCoordinates, type LatLng } from "./coordinates";
import {
  extractFromUrl,
  isAppleMaps,
  isGoogleMaps,
  isGoogleShort,
  isMapUrl,
  isWaze,
  parseInput,
  placeQuery,
  toUrl,
} from "./map-urls";

/**
 * Resolve no servidor links que não trazem coordenadas na própria URL
 * (links curtos maps.app.goo.gl / maps.apple/p, lugares por nome).
 *
 * Segurança: só acessa hosts de mapas conhecidos, valida CADA redirecionamento,
 * usa timeout e limita o tamanho da resposta — evitando que a API seja usada
 * como proxy aberto (SSRF).
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const MAX_REDIRECTS = 5;
const MAX_BYTES = 1_500_000;
const TIMEOUT_MS = 6000;

const canFetch = (u: URL) =>
  u.protocol === "https:" &&
  (isGoogleShort(u) || isGoogleMaps(u) || isWaze(u) || isAppleMaps(u));

async function readLimited(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(chunks));
}

async function follow(start: URL): Promise<{ url: URL; html: string }> {
  let url = start;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    if (!canFetch(url)) break;
    // Se a URL atual já tem coordenadas, não precisa continuar.
    if (i > 0 && extractFromUrl(url)) return { url, html: "" };
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": UA, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      await res.body?.cancel().catch(() => {});
      url = new URL(location, url);
      continue;
    }
    const isHtml = res.headers.get("content-type")?.includes("html");
    return { url, html: res.ok && isHtml ? await readLimited(res) : "" };
  }
  return { url, html: "" };
}

function fromHtml(html: string): LatLng | null {
  if (!html) return null;
  const meta = (prop: string) =>
    html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)`, "i"))?.[1];
  // Apple Maps: <meta property="place:location:latitude" ...>
  const lat = meta("place:location:latitude") ?? meta("og:latitude");
  const lng = meta("place:location:longitude") ?? meta("og:longitude");
  if (lat && lng) {
    const c = parseCoordinates(`${lat},${lng}`);
    if (c) return c;
  }
  const geo = meta("geo.position") ?? meta("ICBM");
  if (geo) {
    const c = parseCoordinates(geo.replace(";", ","));
    if (c) return c;
  }
  // Google: posição do marcador do lugar
  const pin = html.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (pin) return parseCoordinates(`${pin[1]},${pin[2]}`);
  return null;
}

const cache = new Map<string, LatLng>();
function remember(key: string, value: LatLng) {
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  cache.set(key, value);
  return value;
}

async function geocode(query: string): Promise<LatLng | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  try {
    if (key) {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}`,
        { signal: AbortSignal.timeout(TIMEOUT_MS) },
      );
      const data = await res.json();
      const loc = data?.results?.[0]?.geometry?.location;
      if (loc) return parseCoordinates(`${loc.lat},${loc.lng}`);
      return null;
    }
    // Sem chave do Google: usa o Nominatim (OpenStreetMap), gratuito.
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": process.env.NOMINATIM_USER_AGENT ?? "conversor-de-coordenadas/1.0",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return parseCoordinates(`${data[0].lat},${data[0].lon}`);
    }
  } catch (err) {
    console.error("Falha ao geocodificar:", err);
  }
  return null;
}

/** Resolve coordenadas de qualquer entrada, acessando a rede só quando necessário. */
export async function resolveInput(input: string): Promise<LatLng | null> {
  const local = parseInput(input);
  if (local) return local;

  const start = toUrl(input);
  if (!start || !isMapUrl(start)) return null;

  const key = start.href;
  if (cache.has(key)) return cache.get(key)!;

  try {
    const { url, html } = await follow(start);
    const found = extractFromUrl(url) ?? fromHtml(html);
    if (found) return remember(key, found);

    const query = placeQuery(url) ?? placeQuery(start);
    const geocoded = query ? await geocode(query) : null;
    // Só guarda acertos: falhas (rede, timeout) podem ser temporárias.
    return geocoded ? remember(key, geocoded) : null;
  } catch (err) {
    console.error("Falha ao resolver URL:", err);
    return null;
  }
}
