import type { Metadata } from "next";
import { headers } from "next/headers";
import { SettingsView } from "@/components/settings-view";
import { translator } from "@/i18n/messages";
import { getServerLang } from "@/i18n/server";
import { getAndroidRelease, isIOS } from "@/lib/android-release";
import pkg from "../../../package.json";

export async function generateMetadata(): Promise<Metadata> {
  const t = translator(await getServerLang());
  return { title: `${t("settings")} · ${t("appTitle")}`, robots: { index: false } };
}

export default async function ConfigPage() {
  const ua = (await headers()).get("user-agent");
  const androidApp = isIOS(ua) ? null : await getAndroidRelease();
  return <SettingsView androidApp={androidApp} version={pkg.version} />;
}
