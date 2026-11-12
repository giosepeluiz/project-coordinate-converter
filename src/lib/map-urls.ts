/**
 * Leitura de URLs de serviços de mapas (sem rede) e geração de links.
 * Roda tanto no navegador quanto no servidor.
 */
import { isValidLatLng, parseCoordinates, toParam, type LatLng } from "./coordinates";

/** Converte texto em URL, aceitando entradas sem protocolo (ex.: "maps.google.com/..."). */
export function toUrl(input: string): URL | null {
  const s = input.trim();
  if (!s || s.length > 4096 || /\s/.test(s)) return null;
  try {
    if (/^(https?|geo|waze|maps|comgooglemaps):/i.test(s)) {
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

const host = (u: URL) => u.hostname.toLowerCase().replace(/^www\./, "");

export const isGoogleShort = (u: URL) =>
  /^(maps\.app\.)?goo\.gl$/.test(host(u));
export const isGoogleMaps = (u: URL) => {
  const h = host(u);
  return (
    /^maps\.google\.[a-z.]+$/.test(h) ||
    (/^google\.[a-z.]+$/.test(h) && u.pathname.startsWith("/maps"))
  );
};
export const isWaze = (u: URL) =>
  u.protocol === "waze:" || /^(.+\.)?waze\.com$/.test(host(u));
export const isAppleMaps = (u: URL) =>
  u.protocol === "maps:" || /^maps\.apple(\.com)?$/.test(host(u));
const isOsm = (u: URL) => /(^|\.)openstreetmap\.org$/.test(host(u));
const isBing = (u: URL) => host(u) === "bing.com" && u.pathname.startsWith("/maps");

/** A URL é de um serviço de mapas que sabemos interpretar? */
export function isMapUrl(u: URL): boolean {
  return (
    u.protocol === "geo:" ||
    u.protocol === "comgooglemaps:" ||
    isGoogleShort(u) ||
    isGoogleMaps(u) ||
    isWaze(u) ||
    isAppleMaps(u) ||
    isOsm(u) ||
    isBing(u)
  );
}

const decodePath = (s: string) => {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
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
  const lat = [-90, 90];
  const lng = [-180, 180];
  for (const ch of hash.toLowerCase()) {
    const idx = BASE32.indexOf(ch);
    if (idx < 0) return null;
    for (let bit = 4; bit >= 0; bit--) {
      const range = even ? lng : lat;
      const mid = (range[0] + range[1]) / 2;
      if ((idx >> bit) & 1) range[0] = mid;
      else range[1] = mid;
      even = !even;
    }
  }
  const c = { lat: (lat[0] + lat[1]) / 2, lng: (lng[0] + lng[1]) / 2 };
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

function apple(u: URL): LatLng | null {
  return fromParams(u, ["ll", "coordinate", "q", "daddr", "sll", "center", "destination"]);
}

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

/** Extrai coordenadas de uma URL de mapa, sem acessar a rede. */
export function extractFromUrl(u: URL): LatLng | null {
  if (u.protocol === "geo:") {
    // geo:38.5,-9.0 · geo:0,0?q=38.5,-9.0(Nome)
    return fromParams(u, ["q"]) ?? parseCoordinates(u.pathname.split(";")[0]);
  }
  if (u.protocol === "comgooglemaps:") return fromParams(u, ["q", "center", "daddr"]);
  if (isGoogleMaps(u)) return google(u);
  if (isWaze(u)) return waze(u);
  if (isAppleMaps(u)) return apple(u);
  if (isOsm(u)) return osm(u);
  if (isBing(u)) return bing(u);
  return null;
}

/** Nome/endereço do lugar na URL, para geocodificação quando não há coordenadas. */
export function placeQuery(u: URL): string | null {
  const fromParam = ["q", "query", "destination", "daddr", "address", "name"]
    .map((n) => u.searchParams.get(n))
    .find((v) => v && v.trim().length > 1);
  if (fromParam) return fromParam.trim();
  if (isGoogleMaps(u)) {
    const m = u.pathname.match(/\/maps\/(?:place|search)\/([^/]+)/);
    if (m) return decodePath(m[1]).trim() || null;
  }
  return null;
}

/** Interpreta qualquer entrada (coordenadas ou URL) sem rede. */
export function parseInput(input: string): LatLng | null {
  const direct = parseCoordinates(input);
  if (direct) return direct;
  const u = toUrl(input);
  return u && isMapUrl(u) ? extractFromUrl(u) : null;
}

export type MapApp = "waze" | "googlemaps" | "applemaps";

export function appLink(app: MapApp, c: LatLng): string {
  const p = toParam(c);
  switch (app) {
    case "waze":
      return `https://waze.com/ul?ll=${p}&navigate=yes`;
    case "googlemaps":
      return `https://www.google.com/maps/search/?api=1&query=${p}`;
    case "applemaps":
      return `https://maps.apple.com/?ll=${p}&q=${p}`;
  }
}
