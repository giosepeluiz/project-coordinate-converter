"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LANGS, isLang } from "@/i18n/languages";
import type { AndroidRelease } from "@/lib/android-release";
import { SERVICES } from "@/lib/services";
import { DEFAULT_SETTINGS, toggleService, type Theme } from "@/lib/settings";
import { AndroidDownload } from "./android-download";
import { BackIcon, MonitorIcon, MoonIcon, SunIcon } from "./icons";
import { MapBackground } from "./map-background";
import { useSettings } from "./settings-provider";
import { SiteFooter } from "./site-footer";
import { Toast, useToast } from "./toast";

const card =
  "rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-black/5 backdrop-blur md:p-6 dark:bg-gray-900/85 dark:ring-white/10";
const sectionTitle = "text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400";

function Switch({ checked, label }: { checked: boolean; label: string }) {
  return (
    <span
      aria-hidden="true"
      data-label={label}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
      }`}>
      <span
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

export function SettingsView({ androidApp, version }: { androidApp: AndroidRelease | null; version: string }) {
  const { settings, t, update } = useSettings();
  const { toast, show } = useToast();
  const router = useRouter();

  const goBack = () => {
    // Volta para o resultado anterior, se veio do próprio site; senão, para a home.
    const fromSite = document.referrer.startsWith(window.location.origin);
    if (fromSite && window.history.length > 1) router.back();
    else router.push("/");
  };

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "system", label: t("themeSystem"), icon: <MonitorIcon width={18} height={18} /> },
    { value: "light", label: t("themeLight"), icon: <SunIcon width={18} height={18} /> },
    { value: "dark", label: t("themeDark"), icon: <MoonIcon width={18} height={18} /> },
  ];

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 pb-28 pt-4 md:px-8 md:pb-32 md:pt-12">
      <MapBackground />

      <div className="w-full max-w-2xl space-y-3 md:space-y-4">
        <header className={`${card} flex items-center gap-3`}>
          <button
            type="button"
            onClick={goBack}
            aria-label={t("back")}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-emerald-700 md:text-2xl dark:text-emerald-400">{t("settings")}</h1>
        </header>

        {/* Tema */}
        <section className={card} aria-labelledby="theme-title">
          <h2 id="theme-title" className={sectionTitle}>
            {t("theme")}
          </h2>
          <div role="radiogroup" aria-labelledby="theme-title" className="mt-4 grid grid-cols-3 gap-2">
            {themes.map((o) => {
              const active = settings.theme === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => update({ theme: o.value })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-sm font-semibold ring-1 transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "text-gray-700 ring-black/10 hover:bg-gray-50 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-gray-800"
                  }`}>
                  {o.icon}
                  {o.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Idioma */}
        <section className={card}>
          <label htmlFor="lang" className={sectionTitle}>
            {t("language")}
          </label>
          <select
            id="lang"
            value={settings.lang ?? ""}
            onChange={(e) => update({ lang: isLang(e.target.value) ? e.target.value : null })}
            className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
            <option value="">{t("languageAuto")}</option>
            {LANGS.map((l) => (
              <option key={l.code} value={l.code} lang={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </section>

        {/* Serviços */}
        <section className={card} aria-labelledby="services-title">
          <h2 id="services-title" className={sectionTitle}>
            {t("services")}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t("servicesHint")}</p>
          <ul className="mt-4 divide-y divide-gray-200/80 dark:divide-white/10">
            {SERVICES.map((s) => {
              const on = settings.services.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => {
                      const next = toggleService(settings.services, s.id);
                      if (next) update({ services: next });
                      else show(t("minOneService"));
                    }}
                    className="flex w-full items-center gap-3 py-3 text-left">
                    <Image src={s.logo} alt="" width={36} height={36} className="size-9 shrink-0 rounded-lg" />
                    <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
                    <Switch checked={on} label={s.name} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Sobre */}
        <section className={card} aria-labelledby="about-title">
          <h2 id="about-title" className={sectionTitle}>
            {t("about")}
          </h2>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            {t("appTitle")} · {t("version")} {version}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t("aboutText")}</p>
          <button
            type="button"
            onClick={() => {
              update(DEFAULT_SETTINGS);
              show(t("resetDone"));
            }}
            className="mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-black/10 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-gray-800">
            {t("resetDefaults")}
          </button>
          {androidApp && <AndroidDownload release={androidApp} />}
        </section>
      </div>

      <Toast toast={toast} />
      <SiteFooter showSettings={false} />
    </main>
  );
}
