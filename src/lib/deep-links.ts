/**
 * Links que abrem direto o aplicativo instalado no celular.
 *
 * - Android: URLs `intent:` com o pacote do app e `S.browser_fallback_url`.
 *   O próprio Chrome/WebView abre o app ou, se não estiver instalado, o link web.
 * - iOS: esquemas próprios (waze://, comgooglemaps://, maps://…). Como o iOS não
 *   informa se o app existe, quem chama faz o fallback para o link web após um tempo.
 * - Desktop (ou serviço sem app): null, e o link web segue normalmente.
 */
import type { LatLng } from "./coordinates";
import { getService, type ServiceId } from "./services";

export type Platform = "android" | "ios" | "other";

export function detectPlatform(ua: string, maxTouchPoints = 0): Platform {
  if (/android/i.test(ua)) return "android";
  // iPadOS se identifica como "Macintosh", mas tem tela de toque.
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && maxTouchPoints > 1)) return "ios";
  return "other";
}

/**
 * Monta a URL `intent:` do Chrome para Android trocando o esquema da URI
 * original: "https://x/y" → "intent://x/y#Intent;scheme=https;…" e
 * "geo:1,2" → "intent:1,2#Intent;scheme=geo;…".
 */
export function androidIntent(uri: string, pkg: string, fallback: string): string {
  const i = uri.indexOf(":");
  const scheme = uri.slice(0, i);
  const rest = uri.slice(i + 1);
  return (
    `intent:${rest}#Intent;scheme=${scheme};package=${pkg};` +
    `S.browser_fallback_url=${encodeURIComponent(fallback)};end`
  );
}

export function appDeepLink(id: ServiceId, c: LatLng, platform: Platform): string | null {
  const s = getService(id);
  if (platform === "android" && s.android) return androidIntent(s.android.uri(c), s.android.pkg, s.web(c));
  if (platform === "ios" && s.ios) return s.ios(c);
  return null;
}

/** Só o iOS precisa de fallback por tempo, e não para apps que já vêm instalados. */
export const needsFallback = (id: ServiceId, platform: Platform) =>
  platform === "ios" && !getService(id).iosBuiltIn;

const FALLBACK_MS = 1500;

/**
 * Handler de clique do botão "Abrir …": tenta o app; no iOS, se a página
 * continuar visível depois de 1,5 s (app não instalado), abre o link web.
 * No desktop não faz nada e o <a href> segue normalmente.
 */
export function openInApp(e: { preventDefault(): void }, id: ServiceId, c: LatLng) {
  const platform = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
  const deep = appDeepLink(id, c, platform);
  if (!deep) return;
  e.preventDefault();

  if (needsFallback(id, platform)) {
    const web = getService(id).web(c);
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
