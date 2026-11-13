import "server-only";
import { parseCoordinates, type LatLng } from "./coordinates";
import { geocodeQueries } from "./geocode-queries";
import {
  extractFromUrl,
  extractUrlFromText,
  isAppleMaps,
  isGoogleMaps,
  isGoogleShort,
  isMapUrl,
  isSite,
  isWaze,
  parseInput,
  placeQuery,
  toUrl,
  unwrapSiteUrl,
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
/** Política do Nominatim: no máximo 1 requisição por segundo. */
const NOMINATIM_GAP_MS = 1100;

const canFetch = (u: URL) =>
  u.protocol === "https:" && (isGoogleShort(u) || isGoogleMaps(u) || isWaze(u) || isAppleMaps(u));

const isGoogleHost = (u: URL) => isGoogleShort(u) || /(^|\.)google\.[a-z.]+$/.test(u.hostname);

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
    const headers: Record<string, string> = {
      "User-Agent": UA,
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    };
    // Evita a página de consentimento de cookies do Google na Europa.
    if (isGoogleHost(url)) headers.Cookie = "SOCS=CAI; CONSENT=YES+";
    const res = await fetch(url, {
      redirect: "manual",
      headers,
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

/**
 * Coordenadas confiáveis dentro do HTML. Não usa o "center=", o
 * "[[[alt,lng,lat]" nem o "/@lat,lng" do Google: em páginas de lugar por nome,
 * eles trazem a posição estimada pelo IP de quem pediu, e não a do lugar.
 */
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
  // Google: marcador do lugar (o "@lat,lng" do HTML pode ser só o centro da tela)
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function nominatim(query: string): Promise<LatLng | null> {
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
  return Array.isArray(data) && data[0] ? parseCoordinates(`${data[0].lat},${data[0].lon}`) : null;
}

async function geocode(query: string): Promise<LatLng | null> {
  try {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (key) {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}`,
        { signal: AbortSignal.timeout(TIMEOUT_MS) },
      );
      const loc = (await res.json())?.results?.[0]?.geometry?.location;
      if (loc) return parseCoordinates(`${loc.lat},${loc.lng}`);
    }
    // Nominatim (OpenStreetMap): até 5 tentativas, do endereço completo até só a rua.
    const queries = geocodeQueries(query);
    for (let i = 0; i < queries.length; i++) {
      if (i > 0) await sleep(NOMINATIM_GAP_MS);
      const found = await nominatim(queries[i]);
      if (found) return found;
    }
  } catch (err) {
    console.error("Falha ao geocodificar:", err);
  }
  return null;
}

/** Resolve coordenadas de qualquer entrada, acessando a rede só quando necessário. */
export async function resolveInput(input: string, depth = 0): Promise<LatLng | null> {
  const local = parseInput(input);
  if (local) return local;
  if (depth > 2) return null;

  const start = toUrl(input);
  // Texto de compartilhamento: "Nome do lugar https://maps.app.goo.gl/…"
  if (!start) {
    const inText = extractUrlFromText(input);
    return inText && inText !== input.trim() ? resolveInput(inText, depth + 1) : null;
  }
  if (!isMapUrl(start)) return null;

  // Link do próprio site com um link de mapa dentro: resolve o de dentro.
  if (isSite(start)) {
    const inner = unwrapSiteUrl(start);
    return inner ? resolveInput(inner, depth + 1) : null;
  }

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
