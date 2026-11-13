"use client";

import Link from "next/link";
import { GearIcon } from "./icons";
import { useSettings } from "./settings-provider";

/** Rodapé fixo: autoria, privacidade e atalho para as configurações. */
export function SiteFooter({ showSettings = true }: { showSettings?: boolean }) {
  const { t } = useSettings();
  return (
    <footer className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-black/5 bg-white/95 px-4 py-2.5 backdrop-blur md:justify-center dark:border-white/10 dark:bg-gray-950/95">
      <div className="min-w-0 flex-1 md:flex-none md:text-center">
        <p className="text-xs font-medium text-gray-700 md:text-sm dark:text-gray-300">
          {t("developedBy")}{" "}
          <a
            href="https://github.com/giosepeluiz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400">
            Giosepe Luiz
          </a>
        </p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          <span className="hidden sm:inline">{t("privacy")}</span>
          <span className="sm:hidden">{t("privacyShort")}</span>
        </p>
      </div>
      {showSettings && (
        <Link
          href="/config"
          aria-label={t("settings")}
          title={t("settings")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-600 ring-1 ring-black/10 transition-colors hover:bg-gray-100 hover:text-emerald-700 md:absolute md:right-6 dark:text-gray-300 dark:ring-white/10 dark:hover:bg-gray-800 dark:hover:text-emerald-400">
          <GearIcon width={20} height={20} />
        </Link>
      )}
    </footer>
  );
}
