/**
 * Links que abrem direto o aplicativo instalado no celular.
 *
 * No celular, o próprio `href` do botão "Abrir" é o link do app:
 * - Android: esquema do app quando existe (waze://, yandexmaps://); senão, URL
 *   `intent:` com o pacote do app e `S.browser_fallback_url` (o Chrome abre o
 *   app ou, se não estiver instalado, o link web).
 * - iOS: esquema do app (waze://, comgooglemaps://, maps://…).
 * Como esquemas próprios não avisam se o app existe, ao tocar armamos um
 * fallback: se a página continuar visível após 1,5 s, abre o link web.
 * - Desktop (ou serviço sem app): null, e o botão usa o link web normal.
 *
 * O link web normal continua no botão de copiar.
 */
import type { LatLng } from "./coordinates";
import { getService, type ServiceId } from "./services";

export type Platform = "android" | "ios" | "other";

export function detectPlatform(ua: string | null | undefined, maxTouchPoints = 0): Platform {
  if (!ua) return "other";
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

/** Link do app para a plataforma, ou null para usar o link web. */
export function appDeepLink(id: ServiceId, c: LatLng, platform: Platform): string | null {
  const s = getService(id);
  if (platform === "android") {
    if (s.androidScheme) return s.androidScheme(c);
    if (s.android) return androidIntent(s.android.uri(c), s.android.pkg, s.web(c));
  }
  if (platform === "ios" && s.ios) return s.ios(c);
  return null;
}

/**
 * Precisa de fallback por tempo quando o link é um esquema próprio do app
 * (não avisa se o app existe). Não precisa para `intent:` (o fallback já vem
 * dentro) nem para apps que já vêm instalados (Mapas no iPhone).
 */
export function needsFallback(id: ServiceId, platform: Platform): boolean {
  const s = getService(id);
  if (platform === "android") return !!s.androidScheme;
  if (platform === "ios") return !!s.ios && !s.iosBuiltIn;
  return false;
}

const FALLBACK_MS = 1500;

/**
 * Chamado no toque do botão "Abrir" (o `href` já é o link do app):
 * se o app não abrir e a página continuar visível, vai para o link web.
 */
export function armWebFallback(id: ServiceId, c: LatLng, platform: Platform) {
  if (!needsFallback(id, platform)) return;
  const web = getService(id).web(c);
  const timer = setTimeout(() => {
    if (document.visibilityState === "visible") window.location.href = web;
  }, FALLBACK_MS);
  // O app abriu (a página foi para segundo plano): cancela o fallback.
  const cancel = () => clearTimeout(timer);
  document.addEventListener("visibilitychange", cancel, { once: true });
  window.addEventListener("pagehide", cancel, { once: true });
}
