/**
 * Leitura de URLs de serviços de mapas (sem rede).
 * Roda tanto no navegador quanto no servidor.
 */
import { isValidLatLng, parseCoordinates, type LatLng } from "./coordinates";

/** Domínios do próprio conversor (links dele também são entradas válidas). */
export const SITE_HOSTS = ["coordenadas.arqueirover.de", "www.coordenadas.arqueirover.de"];

const SCHEMES = /^(https?|geo|waze|maps|comgooglemaps|yandexmaps|tomtomgo|tomtomhome):/i;

/** Converte texto em URL, aceitando entradas sem protocolo (ex.: "maps.google.com/..."). */
export function toUrl(input: string): URL | null {
  const s = input.trim();
  if (!s || s.length > 4096 || /\s/.test(s)) return null;
  try {
    if (SCHEMES.test(s)) {
      // Corrige "https:/host" (barras duplas colapsadas por proxies)
      return new URL(s.replace(/^(https?):\/*/i, "$1://"));
    }
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#]|$)/i.test(s)) {
      return new URL("https://" + s);
    }
  } catch {
    /* URL inválida */
  }
  return null;
}

/**
 * Texto de compartilhamento ("Nome do lugar https://maps.app.goo.gl/…"):
 * devolve o primeiro link encontrado no texto.
 */
export function extractUrlFromText(text: string): string | null {
  const m = text.match(/(?:https?:\/\/|geo:|waze:\/\/|maps:\/\/|yandexmaps:\/\/|tomtomgo:\/\/)[^\s<>"']+/i);
  return m ? m[0].replace(/[),.;!?]+$/, "") : null;
}

const host = (u: URL) => u.hostname.toLowerCase().replace(/^www\./, "");

export const isSite = (u: URL) => SITE_HOSTS.includes(u.hostname.toLowerCase());
export const isGoogleShort = (u: URL) => /^(maps\.app\.)?goo\.gl$/.test(host(u));
export const isGoogleMaps = (u: URL) => {
  const h = host(u);
  return (
    /^maps\.google\.[a-z.]+$/.test(h) ||
    (/^google\.[a-z.]+$/.test(h) && u.pathname.startsWith("/maps"))
  );
};
export const isWaze = (u: URL) => u.protocol === "waze:" || /^(.+\.)?waze\.com$/.test(host(u));
export const isAppleMaps = (u: URL) => u.protocol === "maps:" || /^maps\.apple(\.com)?$/.test(host(u));
const isOsm = (u: URL) => /(^|\.)openstreetmap\.org$/.test(host(u));
const isBing = (u: URL) => host(u) === "bing.com" && u.pathname.startsWith("/maps");
const isHere = (u: URL) => /^(share|wego)\.here\.com$/.test(host(u));
const isYandex = (u: URL) =>
  u.protocol === "yandexmaps:" ||
  /^maps\.yandex\.[a-z.]+$/.test(host(u)) ||
  (/^yandex\.[a-z.]+$/.test(host(u)) && u.pathname.startsWith("/maps"));
const isOrganic = (u: URL) => host(u) === "omaps.app";
const isTomTom = (u: URL) => u.protocol === "tomtomgo:" || u.protocol === "tomtomhome:";

/** A URL é de um serviço de mapas (ou do próprio site) que sabemos interpretar? */
export function isMapUrl(u: URL): boolean {
  return (
    u.protocol === "geo:" ||
    u.protocol === "comgooglemaps:" ||
    isSite(u) ||
    isGoogleShort(u) ||
    isGoogleMaps(u) ||
    isWaze(u) ||
    isAppleMaps(u) ||
    isOsm(u) ||
    isBing(u) ||
    isHere(u) ||
    isYandex(u) ||
    isOrganic(u) ||
    isTomTom(u)
  );
}

const decodePath = (s: string) => {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
};

/** Os dois primeiros números de "lat,lng[,resto]". */
const firstPair = (s: string) => {
  const m = s.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  return m ? parseCoordinates(`${m[1]},${m[2]}`) : null;
};

/** Yandex escreve LONGITUDE,LATITUDE. */
const swapped = (s: string | null) => {
  const m = s?.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  return m ? parseCoordinates(`${m[2]},${m[1]}`) : null;
};

function fromParams(u: URL, names: string[]): LatLng | null {
  for (const name of names) {
    const v = u.searchParams.get(name);
    if (!v) continue;
    // Waze usa "ll.38.5,-9.0" em ?to= / ?from=
    const c = parseCoordinates(v.replace(/^ll\./i, "").replace(/\(.*\)$/, ""));
    if (c) return c;
  }
  return null;
}

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

/** Decodifica um geohash (usado nos links curtos do Waze: waze.com/ul/h<geohash>). */
export function decodeGeohash(hash: string): LatLng | null {
  let even = true;
  const la = [-90, 90];
  const lo = [-180, 180];
  for (const ch of hash.toLowerCase()) {
    const idx = BASE32.indexOf(ch);
    if (idx < 0) return null;
    for (let bit = 4; bit >= 0; bit--) {
      const range = even ? lo : la;
      const mid = (range[0] + range[1]) / 2;
      if ((idx >> bit) & 1) range[0] = mid;
      else range[1] = mid;
      even = !even;
    }
  }
  const c = { lat: (la[0] + la[1]) / 2, lng: (lo[0] + lo[1]) / 2 };
  return isValidLatLng(c) ? c : null;
}

function google(u: URL): LatLng | null {
  const href = decodePath(u.href);
  // !3d<lat>!4d<lng> é a posição exata do marcador (mais precisa que o @).
  const pin = [...href.matchAll(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/g)].pop();
  if (pin) {
    const c = parseCoordinates(`${pin[1]},${pin[2]}`);
    if (c) return c;
  }
  const p = fromParams(u, ["q", "query", "ll", "sll", "destination", "daddr", "center", "viewpoint"]);
  if (p) return p;
  // /maps/place/<lat,lng>, /maps/search/<lat,lng>, /maps/dir/<a>/<b>
  const segments = u.pathname.split("/").map(decodePath).reverse();
  for (const seg of segments) {
    if (seg.startsWith("@")) continue;
    const c = parseCoordinates(seg);
    if (c) return c;
  }
  const at = u.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return parseCoordinates(`${at[1]},${at[2]}`);
  return null;
}

function waze(u: URL): LatLng | null {
  const p = fromParams(u, ["ll", "latlng", "to", "q", "from"]);
  if (p) return p;
  const gh = u.pathname.match(/\/ul\/h([0-9a-z]{4,12})\/?$/i);
  return gh ? decodeGeohash(gh[1]) : null;
}

const apple = (u: URL) => fromParams(u, ["ll", "coordinate", "q", "daddr", "sll", "center", "destination"]);

function osm(u: URL): LatLng | null {
  const mlat = u.searchParams.get("mlat");
  const mlon = u.searchParams.get("mlon");
  if (mlat && mlon) return parseCoordinates(`${mlat},${mlon}`);
  const m = u.hash.match(/map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/);
  return m ? parseCoordinates(`${m[1]},${m[2]}`) : null;
}

function bing(u: URL): LatLng | null {
  const cp = u.searchParams.get("cp");
  if (cp) return parseCoordinates(cp.replace("~", ","));
  const sp = u.searchParams.get("sp")?.match(/point\.(-?\d+\.?\d*)_(-?\d+\.?\d*)/);
  return sp ? parseCoordinates(`${sp[1]},${sp[2]}`) : null;
}

function here(u: URL): LatLng | null {
  // wego.here.com/?map=LAT,LNG,zoom,normal
  const map = u.searchParams.get("map");
  if (map) return firstPair(map);
  // share.here.com/l/LAT,LNG[,título] · /r/<A>/<B> (rota: primeiro ponto)
  for (const seg of u.pathname.split("/").slice(2).map(decodePath)) {
    const c = firstPair(seg);
    if (c) return c;
  }
  return null;
}

function yandex(u: URL): LatLng | null {
  // ?rtext=LAT,LNG~LAT,LNG (rota, já em lat,lng): primeiro ponto
  const rtext = u.searchParams.get("rtext");
  if (rtext) {
    const c = firstPair(rtext.split("~")[0]);
    if (c) return c;
  }
  return (
    swapped(u.searchParams.get("pt")) ??
    swapped(u.searchParams.get("whatshere[point]")) ??
    swapped(u.searchParams.get("ll"))
  );
}

// omaps.app/LAT,LNG[/nome] (códigos curtos como omaps.app/XXXX não são decodificados)
const organic = (u: URL) => firstPair(decodePath(u.pathname.split("/")[1] ?? ""));

function tomtom(u: URL): LatLng | null {
  // tomtomgo://x-callback-url/navigate?destination=LAT,LNG
  const dest = fromParams(u, ["destination"]);
  if (dest) return dest;
  // tomtomhome:geo:action=show&lat=LAT&long=LNG
  const m = decodePath(u.href).match(/lat=(-?\d+(?:\.\d+)?).*?long=(-?\d+(?:\.\d+)?)/i);
  return m ? parseCoordinates(`${m[1]},${m[2]}`) : null;
}

/**
 * Link do próprio site: /?c=…, /LAT,LNG, /c/…, /coord/…, /https://maps…
 * Devolve o texto "de dentro", para ser interpretado de novo.
 */
export function unwrapSiteUrl(u: URL): string | null {
  if (!isSite(u)) return null;
  const c = u.searchParams.get("c") ?? u.searchParams.get("coord");
  if (u.pathname === "/" || u.pathname === "") return c?.trim() || null;
  let raw = decodePath(u.pathname.slice(1).replace(/\+/g, "%2B"));
  raw = raw.replace(/^(c|coord)\//i, "");
  // A query string pertence à URL colada depois do domínio.
  return (raw + (parseCoordinates(raw) ? "" : u.search)).trim() || null;
}

/** Extrai coordenadas de uma URL de mapa, sem acessar a rede. */
export function extractFromUrl(u: URL, depth = 0): LatLng | null {
  if (isSite(u)) {
    const inner = unwrapSiteUrl(u);
    return inner && depth < 3 ? parseInput(inner, depth + 1) : null;
  }
  if (u.protocol === "geo:") {
    // geo:38.5,-9.0 · geo:0,0?q=38.5,-9.0(Nome) · geo:0,0?q=Nome do lugar (busca por nome)
    const q = fromParams(u, ["q"]);
    if (q) return q;
    const c = firstPair(u.pathname.split(";")[0]);
    // 0,0 significa "sem posição": quem tiver ?q= com nome vai para a geocodificação.
    return c && !(c.lat === 0 && c.lng === 0) ? c : null;
  }
  if (u.protocol === "comgooglemaps:") return fromParams(u, ["q", "center", "daddr"]);
  if (isGoogleMaps(u)) return google(u);
  if (isWaze(u)) return waze(u);
  if (isAppleMaps(u)) return apple(u);
  if (isOsm(u)) return osm(u);
  if (isBing(u)) return bing(u);
  if (isHere(u)) return here(u);
  if (isYandex(u)) return yandex(u);
  if (isOrganic(u)) return organic(u);
  if (isTomTom(u)) return tomtom(u);
  return null;
}

/** Nome/endereço do lugar na URL, para geocodificação quando não há coordenadas. */
export function placeQuery(u: URL): string | null {
  const fromParam = ["q", "query", "destination", "daddr", "address", "name"]
    .map((n) => u.searchParams.get(n)?.replace(/\(.*\)$/, ""))
    .find((v) => v && v.trim().length > 1 && !parseCoordinates(v));
  if (fromParam) return fromParam.trim();
  if (isGoogleMaps(u)) {
    const m = u.pathname.match(/\/maps\/(?:place|search)\/([^/]+)/);
    if (m) return decodePath(m[1]).trim() || null;
  }
  return null;
}

/**
 * Interpreta qualquer entrada sem rede: coordenadas, URL de mapa, link do
 * próprio site ou texto de compartilhamento com um link dentro.
 */
export function parseInput(input: string, depth = 0): LatLng | null {
  const direct = parseCoordinates(input);
  if (direct) return direct;
  const u = toUrl(input);
  if (u) return isMapUrl(u) ? extractFromUrl(u, depth) : null;
  const inText = extractUrlFromText(input);
  return inText && inText !== input.trim() ? parseInput(inText, depth) : null;
}
