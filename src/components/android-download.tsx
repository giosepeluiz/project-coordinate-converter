"use client";

import type { AndroidRelease } from "@/lib/android-release";
import { useSettings } from "./settings-provider";

/** Robô do Android (desenho simplificado), na cor oficial #3DDC84. */
function AndroidIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="#3DDC84"
        d="M17.6 9.48 19.44 6.3a.38.38 0 0 0-.66-.38l-1.87 3.23A11.5 11.5 0 0 0 12 8.13c-1.76 0-3.42.37-4.9 1.03L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.8 10.8 0 0 0 1 18h22a10.8 10.8 0 0 0-5.4-8.52ZM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"
      />
    </svg>
  );
}

function formatSize(bytes: number | null): string | null {
  if (!bytes) return null;
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  release: AndroidRelease;
  /** "card": dentro do formulário, separado por uma linha. "standalone": abaixo do resultado. */
  variant?: "card" | "standalone";
};

/**
 * Botão de download do APK, direto do GitHub Releases.
 * O GitHub envia o arquivo como anexo, então o download começa na hora.
 */
export function AndroidDownload({ release, variant = "card" }: Props) {
  const { t } = useSettings();
  const size = formatSize(release.size);
  const wrapper =
    variant === "card"
      ? "mt-8 flex justify-center border-t border-gray-200/80 pt-7 dark:border-white/10"
      : "flex justify-center pt-5 md:pt-6";
  const surface =
    variant === "card"
      ? "bg-gray-50 dark:bg-gray-800/60"
      : "bg-white/90 shadow-md backdrop-blur dark:bg-gray-900/85";

  return (
    <div className={wrapper}>
      <a
        href={release.url}
        rel="noopener"
        className={`group inline-flex min-h-14 max-w-full items-center gap-3 rounded-full py-2.5 pl-2.5 pr-6 text-[15px] ring-1 ring-black/10 transition hover:bg-white hover:ring-[#3DDC84]/60 dark:ring-white/10 dark:hover:bg-gray-800 dark:hover:ring-[#3DDC84]/50 ${surface}`}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#3DDC84]/15">
          <AndroidIcon width={22} height={22} />
        </span>
        <span className="text-balance font-semibold leading-tight text-gray-800 dark:text-gray-100">
          {t("androidDownload")}
        </span>
        <span className="hidden text-xs text-gray-500 sm:inline dark:text-gray-400">
          v{release.version} · APK{size ? ` · ${size}` : ""}
        </span>
      </a>
    </div>
  );
}
