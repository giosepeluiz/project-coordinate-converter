/**
 * Serviços de mapa/navegação exibidos no resultado.
 * A ordem aqui é a ordem fixa na tela e nas configurações.
 */
import { toParam, type LatLng } from "./coordinates";

export type ServiceId =
  | "waze"
  | "googlemaps"
  | "applemaps"
  | "tomtom"
  | "here"
  | "yandex"
  | "osm"
  | "bing"
  | "organicmaps";

export type Service = {
  id: ServiceId;
  name: string;
  logo: string;
  /** Ativo na primeira visita. */
  defaultOn: boolean;
  /** Link web (botão "Abrir" no computador, copiar link e fallback no celular). */
  web: (c: LatLng) => string;
  /** Android: esquema próprio do app (ex.: waze://), chamado direto, com fallback web por tempo. */
  androidScheme?: (c: LatLng) => string;
  /** Android, quando o app não tem esquema próprio: pacote + URI (vira intent: com fallback web embutido). */
  android?: { pkg: string; uri: (c: LatLng) => string };
  /** iOS: esquema do app (com fallback web por tempo) — só quando confiável. */
  ios?: (c: LatLng) => string;
  /** No iOS o app vem instalado: dispensa o fallback por tempo. */
  iosBuiltIn?: boolean;
};

const lat = (c: LatLng) => Number(c.lat.toFixed(6));
const lng = (c: LatLng) => Number(c.lng.toFixed(6));
const geo = (c: LatLng) => `geo:${toParam(c)}?q=${toParam(c)}`;

export const SERVICES: Service[] = [
  {
    id: "waze",
    name: "Waze",
    logo: "/assets/waze.svg",
    defaultOn: true,
    web: (c) => `https://waze.com/ul?ll=${toParam(c)}&navigate=yes`,
    androidScheme: (c) => `waze://?ll=${toParam(c)}&navigate=yes`,
    ios: (c) => `waze://?ll=${toParam(c)}&navigate=yes`,
  },
  {
    id: "googlemaps",
    name: "Google Maps",
    logo: "/assets/google-maps.svg",
    defaultOn: true,
    web: (c) => `https://www.google.com/maps/search/?api=1&query=${toParam(c)}`,
    android: {
      pkg: "com.google.android.apps.maps",
      uri: (c) => `https://www.google.com/maps/search/?api=1&query=${toParam(c)}`,
    },
    ios: (c) => `comgooglemaps://?q=${toParam(c)}&center=${toParam(c)}`,
  },
  {
    id: "applemaps",
    name: "Apple Maps",
    logo: "/assets/apple-maps.png",
    defaultOn: true,
    web: (c) => `https://maps.apple.com/?ll=${toParam(c)}&q=${toParam(c)}`,
    ios: (c) => `maps://?ll=${toParam(c)}&q=${toParam(c)}`,
    iosBuiltIn: true,
  },
  {
    id: "tomtom",
    name: "TomTom",
    logo: "/assets/tomtom.svg",
    defaultOn: false,
    // Formato web não verificado (mesmo do app Android).
    web: (c) => `https://plan.tomtom.com/en?p=${toParam(c)},16z`,
    android: { pkg: "com.tomtom.gplay.navapp", uri: geo },
    ios: (c) => `tomtomgo://x-callback-url/navigate?destination=${toParam(c)}`,
  },
  {
    id: "here",
    name: "HERE WeGo",
    logo: "/assets/here.svg",
    defaultOn: false,
    web: (c) => `https://share.here.com/l/${toParam(c)}?z=16&t=normal`,
    android: { pkg: "com.here.app.maps", uri: (c) => `https://share.here.com/l/${toParam(c)}?z=16&t=normal` },
  },
  {
    id: "yandex",
    name: "Yandex Maps",
    logo: "/assets/yandex.svg",
    defaultOn: false,
    // Atenção: o Yandex usa LONGITUDE,LATITUDE.
    web: (c) => `https://yandex.com/maps/?pt=${lng(c)},${lat(c)}&z=16&l=map`,
    androidScheme: (c) => `yandexmaps://maps.yandex.ru/?pt=${lng(c)},${lat(c)}&z=16&l=map`,
    ios: (c) => `yandexmaps://maps.yandex.ru/?pt=${lng(c)},${lat(c)}&z=16&l=map`,
  },
  {
    id: "osm",
    name: "OpenStreetMap",
    logo: "/assets/osm.svg",
    defaultOn: false,
    web: (c) => `https://www.openstreetmap.org/?mlat=${lat(c)}&mlon=${lng(c)}#map=17/${lat(c)}/${lng(c)}`,
  },
  {
    id: "bing",
    name: "Bing Maps",
    logo: "/assets/bing.svg",
    defaultOn: false,
    web: (c) => `https://www.bing.com/maps?cp=${lat(c)}~${lng(c)}&lvl=17&sp=point.${lat(c)}_${lng(c)}_`,
  },
  {
    id: "organicmaps",
    name: "Organic Maps",
    logo: "/assets/organic-maps.svg",
    defaultOn: false,
    web: (c) => `https://omaps.app/${toParam(c)}`,
    android: { pkg: "app.organicmaps", uri: geo },
  },
];

export const SERVICE_IDS = SERVICES.map((s) => s.id);
export const DEFAULT_SERVICES: ServiceId[] = SERVICES.filter((s) => s.defaultOn).map((s) => s.id);

export const getService = (id: ServiceId) => SERVICES.find((s) => s.id === id)!;
export const isServiceId = (v: unknown): v is ServiceId =>
  typeof v === "string" && (SERVICE_IDS as string[]).includes(v);

/** Link web de um serviço. */
export const appLink = (id: ServiceId, c: LatLng) => getService(id).web(c);
