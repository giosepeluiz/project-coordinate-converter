"use client";

import Image from "next/image";
import { formatDecimal, formatDms, type LatLng } from "@/lib/coordinates";
import { appDeepLink, armWebFallback, type Platform } from "@/lib/deep-links";
import { SERVICES } from "@/lib/services";
import { CopyIcon, EditIcon, ExternalIcon, PinIcon, QrIcon, ResetIcon, ShareIcon } from "./icons";
import { useSettings } from "./settings-provider";
import { usePlatform } from "./use-platform";

const card =
  "rounded-2xl bg-white/90 shadow-md ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/85 dark:ring-white/10";
const iconButton =
  "flex size-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700";
const secondaryButton =
  "flex items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-3 text-sm font-semibold text-gray-800 shadow-md ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white dark:bg-gray-900/85 dark:text-gray-100 dark:ring-white/10 dark:hover:bg-gray-900";

type Props = {
  coords: LatLng;
  onCopy: (text: string, kind: "coord" | "link") => void;
  onQr: () => void;
  onShare: () => void;
  onReset: () => void;
  onEdit: () => void;
  /** Plataforma detectada no servidor (User-Agent). */
  platform: Platform;
};

export function Results({ coords, onCopy, onQr, onShare, onReset, onEdit, platform: serverPlatform }: Props) {
  const { t, settings } = useSettings();
  const platform = usePlatform(serverPlatform);
  const decimal = formatDecimal(coords);
  const dms = formatDms(coords);
  // Só os serviços ativos nas configurações, na ordem fixa.
  const services = SERVICES.filter((s) => settings.services.includes(s.id));

  return (
    <div className="animate-fade-in-up space-y-3 md:space-y-4">
      {/* Mobile: resumo compacto da coordenada */}
      <div className={`${card} flex items-center gap-3 p-3 md:hidden`}>
        <PinIcon className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <button
          type="button"
          onClick={() => onCopy(decimal, "coord")}
          className="min-w-0 flex-1 text-left"
          aria-label={`${t("copyCoord")}: ${decimal}`}>
          <span className="block truncate font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
            {decimal}
          </span>
          <span className="block truncate font-mono text-xs text-gray-500 dark:text-gray-400">{dms}</span>
        </button>
        <button type="button" onClick={onEdit} className={iconButton} aria-label={t("editCoord")}>
          <EditIcon width={18} height={18} />
        </button>
      </div>

      {/* Desktop: conversão nos dois formatos */}
      <section className={`${card} hidden p-6 md:block`} aria-labelledby="conv-title">
        <h2 id="conv-title" className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t("identified")}
        </h2>
        <dl className="grid gap-3">
          {[
            { label: t("decimalLabel"), value: decimal },
            { label: t("dmsLabel"), value: dms },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <dt className="w-44 shrink-0 text-sm text-gray-500 dark:text-gray-400">{row.label}</dt>
              <dd className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCopy(row.value, "coord")}
                  title={t("clickToCopy")}
                  className="min-w-0 flex-1 truncate rounded-lg bg-gray-100 px-3 py-2.5 text-left font-mono text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700">
                  {row.value}
                </button>
                <button
                  type="button"
                  onClick={() => onCopy(row.value, "coord")}
                  className={iconButton}
                  aria-label={`${t("copy")}: ${row.label}`}>
                  <CopyIcon />
                </button>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Apps de navegação */}
      <ul className="space-y-3 md:space-y-4" aria-label={t("openIn")}>
        {services.map((s) => {
          const web = s.web(coords);
          // No celular, o botão "Abrir" chama o app direto (ex.: waze://); o link web fica no copiar.
          const app = appDeepLink(s.id, coords, platform);
          return (
            <li key={s.id} className={`${card} flex items-center gap-3 p-3 md:p-4`}>
              <Image src={s.logo} alt="" width={44} height={44} className="size-11 shrink-0 rounded-lg" />
              <span className="hidden min-w-0 flex-1 md:block">
                <span className="block font-semibold text-gray-900 dark:text-gray-100">{s.name}</span>
                <span className="block truncate font-mono text-xs text-gray-500 dark:text-gray-400">{web}</span>
              </span>
              <button
                type="button"
                onClick={() => onCopy(web, "link")}
                className={iconButton}
                aria-label={t("copyLinkOf", { app: s.name })}>
                <CopyIcon />
              </button>
              <a
                href={app ?? web}
                onClick={app ? () => armWebFallback(s.id, coords, platform) : undefined}
                {...(app ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                aria-label={t("openApp", { app: s.name })}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold uppercase text-white transition-colors hover:bg-emerald-700 md:flex-none md:px-4 md:tracking-wide">
                {/* Traduções longas quebram em duas linhas em vez de cortar. */}
                <span className="text-balance text-center leading-tight md:hidden">{t("openApp", { app: s.name })}</span>
                <span className="hidden whitespace-nowrap md:inline">{t("open")}</span>
                <ExternalIcon width={18} height={18} className="shrink-0" />
              </a>
            </li>
          );
        })}
      </ul>

      {/* Ações */}
      <div className="grid grid-cols-2 gap-3 pt-1 md:flex md:justify-center">
        <button type="button" onClick={() => onCopy(decimal, "coord")} className={`${secondaryButton} md:hidden`}>
          <CopyIcon width={18} height={18} className="shrink-0 text-emerald-600" />
          {t("copy")}
        </button>
        <button type="button" onClick={onQr} className={secondaryButton}>
          <QrIcon width={18} height={18} className="shrink-0 text-emerald-600" />
          {t("qrCode")}
        </button>
        <button type="button" onClick={onShare} className={secondaryButton}>
          <ShareIcon width={18} height={18} className="shrink-0 text-emerald-600" />
          {t("share")}
        </button>
        <button type="button" onClick={onReset} className={secondaryButton}>
          <ResetIcon width={18} height={18} className="shrink-0 text-emerald-600" />
          {t("newConversion")}
        </button>
      </div>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-3 md:space-y-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`${card} flex animate-pulse items-center gap-3 p-3 md:p-4`}>
          <div className="size-11 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-11 flex-1 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="size-11 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}
