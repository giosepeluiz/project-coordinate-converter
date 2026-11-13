"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { detectLang, type Lang } from "@/i18n/languages";
import { translator, type TFunction } from "@/i18n/messages";
import {
  DEFAULT_SETTINGS,
  normalize,
  readSettings,
  subscribeSettings,
  writeSettings,
  type Settings,
  type Theme,
} from "@/lib/settings";

type Value = {
  settings: Settings;
  /** Idioma em uso: o escolhido ou, se nenhum, o do sistema. */
  lang: Lang;
  t: TFunction;
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<Value | null>(null);

const noopSubscribe = () => () => {};
const navigatorLang = () =>
  detectLang(navigator.languages?.length ? navigator.languages : [navigator.language]);

function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/**
 * `serverLang` vem do Accept-Language do pedido: a página já chega no idioma
 * certo e não "pisca" ao hidratar. Depois disso valem as configurações salvas.
 */
export function SettingsProvider({ serverLang, children }: { serverLang: Lang; children: React.ReactNode }) {
  const settings = useSyncExternalStore(subscribeSettings, readSettings, () => DEFAULT_SETTINGS);
  const systemLang = useSyncExternalStore(noopSubscribe, navigatorLang, () => serverLang);
  const lang = settings.lang ?? systemLang;
  const t = useMemo(() => translator(lang), [lang]);

  const update = useCallback(
    (patch: Partial<Settings>) => writeSettings(normalize({ ...readSettings(), ...patch })),
    [],
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Tema: aplica agora e acompanha o sistema operacional quando em "Sistema".
  useEffect(() => {
    applyTheme(settings.theme);
    if (settings.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [settings.theme]);

  const value = useMemo(() => ({ settings, lang, t, update }), [settings, lang, t, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Value {
  const v = useContext(SettingsContext);
  if (!v) throw new Error("useSettings precisa estar dentro de <SettingsProvider>");
  return v;
}
