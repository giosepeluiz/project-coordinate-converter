/**
 * Links que abrem direto o aplicativo instalado no celular.
 *
 * - Android: URLs `intent://` com o pacote do app e `S.browser_fallback_url`.
 *   O próprio Chrome/WebView abre o app ou, se não estiver instalado, o link web.
 * - iOS: esquemas próprios (waze://, comgooglemaps://, maps://). Como o iOS não
 *   informa se o app existe, quem chama faz o fallback para o link web após um tempo.
 * - Desktop: null (usa o link web normal).
 */
import { toParam, type LatLng } from "./coordinates";
import { appLink, type MapApp } from "./map-urls";

export type Platform = "android" | "ios" | "other";

export function detectPlatform(ua: string, maxTouchPoints = 0): Platform {
  if (/android/i.test(ua)) return "android";
  // iPadOS se identifica como "Macintosh", mas tem tela de toque.
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && maxTouchPoints > 1)) return "ios";
  return "other";
}

const ANDROID_PACKAGES: Partial<Record<MapApp, string>> = {
  waze: "com.waze",
  googlemaps: "com.google.android.apps.maps",
};

function androidIntent(web: string, pkg: string): string {
  const u = new URL(web);
  return (
    `intent://${u.host}${u.pathname}${u.search}` +
    `#Intent;scheme=${u.protocol.replace(":", "")};package=${pkg};` +
    `S.browser_fallback_url=${encodeURIComponent(web)};end`
  );
}

export function appDeepLink(app: MapApp, c: LatLng, platform: Platform): string | null {
  const p = toParam(c);
  if (platform === "android") {
    const pkg = ANDROID_PACKAGES[app];
    // Apple Maps não existe no Android: fica o link web.
    return pkg ? androidIntent(appLink(app, c), pkg) : null;
  }
  if (platform === "ios") {
    switch (app) {
      case "waze":
        return `waze://?ll=${p}&navigate=yes`;
      case "googlemaps":
        return `comgooglemaps://?q=${p}&center=${p}`;
      case "applemaps":
        return `maps://?ll=${p}&q=${p}`;
    }
  }
  return null;
}

/** No iOS, o Apple Maps vem instalado: dispensa o fallback por tempo. */
export const needsFallback = (app: MapApp, platform: Platform) =>
  platform === "ios" && app !== "applemaps";

const FALLBACK_MS = 1500;

/**
 * Handler de clique do botão "Abrir …": tenta o app; no iOS, se a página
 * continuar visível depois de 1,5 s (app não instalado), abre o link web.
 * No desktop não faz nada e o <a href> segue normalmente.
 */
export function openInApp(e: { preventDefault(): void }, app: MapApp, c: LatLng) {
  const platform = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
  const deep = appDeepLink(app, c, platform);
  if (!deep) return;
  e.preventDefault();

  if (needsFallback(app, platform)) {
    const web = appLink(app, c);
    const timer = setTimeout(() => {
      if (document.visibilityState === "visible") window.location.href = web;
    }, FALLBACK_MS);
    // O app abriu (a página foi para segundo plano): cancela o fallback.
    const cancel = () => clearTimeout(timer);
    document.addEventListener("visibilitychange", cancel, { once: true });
    window.addEventListener("pagehide", cancel, { once: true });
  }

  window.location.href = deep;
}
