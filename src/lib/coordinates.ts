/**
 * Parsing e formatação de coordenadas geográficas.
 *
 * Formatos aceitos por `parseCoordinates`:
 * - Decimal:            38.5349409, -9.006521 · 38.5349 -9.0065 · +38.5;-9.0
 * - Decimal (vírgula):  38,5349 -9,0065 · 38,5349; -9,0065
 * - Decimal + hemisf.:  38.5349 N, 9.0065 W · N38.5349 W9.0065 · 38.53°N 9.00°O
 * - DMS:                38°32'05.8"N 9°00'23.5"W · 38° 32′ 5.8″ N, 9° 0′ 23.5″ W
 * - DDM:                38°32.097'N 9°0.391'W
 *
 * Hemisférios em inglês e português: N, S, E/L (leste), W/O (oeste).
 */

export type LatLng = { lat: number; lng: number };

const NUM = String.raw`\d+(?:\.\d+)?`;

export function isValidLatLng(c: LatLng | null | undefined): c is LatLng {
  return (
    !!c &&
    Number.isFinite(c.lat) &&
    Number.isFinite(c.lng) &&
    Math.abs(c.lat) <= 90 &&
    Math.abs(c.lng) <= 180
  );
}

/** Uniformiza símbolos alternativos (′ ″ º ’ ” etc.) para ° ' " */
function normalize(input: string): string {
  return input
    .trim()
    .replace(/^loc:/i, "")
    .replace(/^[([{]\s*|\s*[)\]}]$/g, "")
    .replace(/[º˚]/g, "°")
    .replace(/\bdeg\b/gi, "°")
    .replace(/(?:''|[″”“˝])/g, '"')
    .replace(/[′’‘´`]/g, "'")
    .replace(/\s+/g, " ");
}

const isLatHemisphere = (h: string) => /^[NS]$/i.test(h);
const isNegativeHemisphere = (h: string) => /^[SWO]$/i.test(h);

function build(
  a: { value: number; hemi?: string },
  b: { value: number; hemi?: string },
): LatLng | null {
  let first = a;
  let second = b;
  // Se vier "longitude, latitude" com hemisférios explícitos, inverte.
  if (
    (a.hemi && !isLatHemisphere(a.hemi)) ||
    (b.hemi && isLatHemisphere(b.hemi))
  ) {
    [first, second] = [b, a];
  }
  if (first.hemi && !isLatHemisphere(first.hemi)) return null;
  if (second.hemi && isLatHemisphere(second.hemi)) return null;

  const sign = (v: { value: number; hemi?: string }) =>
    v.hemi && isNegativeHemisphere(v.hemi) ? -Math.abs(v.value) : v.value;

  const result = { lat: sign(first), lng: sign(second) };
  return isValidLatLng(result) ? result : null;
}

function parseDecimal(text: string): LatLng | null {
  let s = text;
  // Vírgula como separador decimal: "38,5349 -9,0065" ou "38,5349; -9,0065"
  if (new RegExp(String.raw`^[+-]?\d+,\d+\s*[;\s]\s*[+-]?\d+,\d+$`).test(s)) {
    s = s.replace(/(\d),(\d)/g, "$1.$2");
  }
  const H1 = "([NS])?";
  const H2 = "([EWOL])?";
  const re = new RegExp(
    String.raw`^${H1}\s*([+-]?${NUM})\s*°?\s*${H1}\s*[,;/ ]\s*${H2}\s*([+-]?${NUM})\s*°?\s*${H2}$`,
    "i",
  );
  const m = s.match(re);
  if (!m) {
    // Também aceita "lng, lat" com hemisférios explícitos (ex.: 9.0 W, 38.5 N)
    const rev = new RegExp(
      String.raw`^${H2}\s*([+-]?${NUM})\s*°?\s*${H2}\s*[,;/ ]\s*${H1}\s*([+-]?${NUM})\s*°?\s*${H1}$`,
      "i",
    );
    const r = s.match(rev);
    if (!r || !(r[1] || r[3]) || !(r[4] || r[6])) return null;
    return build(
      { value: parseFloat(r[5]), hemi: r[4] || r[6] },
      { value: parseFloat(r[2]), hemi: r[1] || r[3] },
    );
  }
  if ((m[1] && m[3]) || (m[4] && m[6])) return null;
  return build(
    { value: parseFloat(m[2]), hemi: m[1] || m[3] },
    { value: parseFloat(m[5]), hemi: m[4] || m[6] },
  );
}

function parseDms(text: string): LatLng | null {
  if (!text.includes("°")) return null;
  const s = text.replace(/(\d),(\d)/g, "$1.$2");
  const part = new RegExp(
    String.raw`([NSEWOL])?\s*([+-])?(${NUM})\s*°\s*(?:(${NUM})\s*'\s*)?(?:(${NUM})\s*"\s*)?([NSEWOL])?`,
    "gi",
  );
  const parts: { value: number; hemi?: string }[] = [];
  let rest = s;
  for (const m of s.matchAll(part)) {
    const [whole, hemiBefore, sign, d, min, sec, hemiAfter] = m;
    if (hemiBefore && hemiAfter) return null;
    const minutes = min ? parseFloat(min) : 0;
    const seconds = sec ? parseFloat(sec) : 0;
    if (minutes >= 60 || seconds >= 60) return null;
    // Graus fracionários não podem ter minutos/segundos.
    if (d.includes(".") && (min || sec)) return null;
    // Minutos fracionários não podem ter segundos.
    if (min?.includes(".") && sec) return null;
    let value = parseFloat(d) + minutes / 60 + seconds / 3600;
    if (sign === "-") value = -value;
    parts.push({ value, hemi: hemiBefore || hemiAfter });
    rest = rest.replace(whole, " ");
  }
  if (parts.length !== 2) return null;
  // Não pode sobrar texto além de separadores.
  if (!/^[\s,;/]*$/.test(rest)) return null;
  return build(parts[0], parts[1]);
}

/** Converte texto livre em coordenadas válidas, ou `null`. */
export function parseCoordinates(input: string): LatLng | null {
  if (!input || input.length > 200) return null;
  const s = normalize(input);
  return parseDecimal(s) ?? parseDms(s);
}

const round6 = (n: number) => Number(n.toFixed(6));

/** "38.534941,-9.006521" — formato canônico usado na URL. */
export function toParam(c: LatLng): string {
  return `${round6(c.lat)},${round6(c.lng)}`;
}

/** "38.534941, -9.006521" */
export function formatDecimal(c: LatLng): string {
  return `${round6(c.lat)}, ${round6(c.lng)}`;
}

function dmsPart(value: number, pos: string, neg: string): string {
  // Arredonda em décimos de segundo ANTES de separar, para nunca gerar 60".
  const tenths = Math.round(Math.abs(value) * 36000);
  const deg = Math.floor(tenths / 36000);
  const min = Math.floor((tenths % 36000) / 600);
  const sec = (tenths % 600) / 10;
  const mm = String(min).padStart(2, "0");
  const ss = sec.toFixed(1).padStart(4, "0");
  return `${deg}°${mm}'${ss}"${value < 0 ? neg : pos}`;
}

/** "38°32'05.8"N 9°00'23.5"W" — mesmo formato exibido pelo Google Maps. */
export function formatDms(c: LatLng): string {
  return `${dmsPart(c.lat, "N", "S")} ${dmsPart(c.lng, "E", "W")}`;
}
