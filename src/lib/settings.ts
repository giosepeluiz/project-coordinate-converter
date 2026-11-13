/**
 * Configurações do usuário, guardadas no localStorage (chave "cfg", JSON),
 * sem prazo de expiração — mesmo formato do app Android, sem o serviço padrão:
 *   { lang, theme, services }
 * - lang: null = segue o idioma do sistema.
 * - A chave antiga "theme" (versões anteriores do site) é migrada.
 */
import { isLang, type Lang } from "@/i18n/languages";
import { DEFAULT_SERVICES, SERVICE_IDS, isServiceId, type ServiceId } from "./services";

export type Theme = "system" | "light" | "dark";
export type Settings = { lang: Lang | null; theme: Theme; services: ServiceId[] };

export const STORAGE_KEY = "cfg";
export const LEGACY_THEME_KEY = "theme";

export const DEFAULT_SETTINGS: Settings = { lang: null, theme: "system", services: DEFAULT_SERVICES };

const isTheme = (v: unknown): v is Theme => v === "system" || v === "light" || v === "dark";

/** Valida e normaliza o que veio do armazenamento (sempre com ao menos 1 serviço, na ordem fixa). */
export function normalize(raw: unknown, legacyTheme?: string | null): Settings {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const list = Array.isArray(o.services) ? o.services.filter(isServiceId) : null;
  const services = list && list.length > 0 ? SERVICE_IDS.filter((id) => list.includes(id)) : DEFAULT_SERVICES;
  return {
    lang: isLang(o.lang) ? o.lang : null,
    theme: isTheme(o.theme) ? o.theme : isTheme(legacyTheme) ? legacyTheme : "system",
    services,
  };
}

/** Quando o navegador bloqueia o localStorage, vale só enquanto a página estiver aberta. */
let memory: Settings = DEFAULT_SETTINGS;
let cachedRaw: string | null | undefined;
let cached: Settings = DEFAULT_SETTINGS;

export function readSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const legacy = raw ? null : localStorage.getItem(LEGACY_THEME_KEY);
    const key = `${raw}|${legacy}`;
    // Mesmo objeto enquanto nada mudar (exigência do useSyncExternalStore).
    if (key !== cachedRaw) {
      cachedRaw = key;
      cached = normalize(raw ? JSON.parse(raw) : null, legacy);
    }
    return cached;
  } catch {
    return memory;
  }
}

const LOCAL_EVENT = "settingschange";

export function writeSettings(next: Settings) {
  memory = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.removeItem(LEGACY_THEME_KEY);
  } catch {
    /* sem armazenamento */
  }
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

/** Avisa quando as configurações mudam nesta aba ou em outra aba aberta. */
export function subscribeSettings(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === LEGACY_THEME_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCAL_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCAL_EVENT, onChange);
  };
}

/** Liga/desliga um serviço, mantendo pelo menos um ativo. Devolve null se recusado. */
export function toggleService(current: ServiceId[], id: ServiceId): ServiceId[] | null {
  const on = current.includes(id);
  if (on && current.length === 1) return null;
  const next = on ? current.filter((s) => s !== id) : [...current, id];
  return SERVICE_IDS.filter((s) => next.includes(s));
}
