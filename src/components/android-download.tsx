import type { AndroidRelease } from "@/lib/android-release";

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
    : `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/**
 * Botão discreto de download do APK, direto do GitHub Releases.
 * O GitHub envia o arquivo como anexo, então o download começa na hora.
 */
export function AndroidDownload({ release }: { release: AndroidRelease }) {
  const size = formatSize(release.size);
  return (
    <div className="mt-5 flex justify-center">
      <a
        href={release.url}
        rel="noopener"
        className="group inline-flex items-center gap-2.5 rounded-full bg-gray-50 py-1.5 pl-2 pr-4 text-sm ring-1 ring-black/10 transition hover:bg-white hover:ring-[#3DDC84]/60 dark:bg-gray-800/60 dark:ring-white/10 dark:hover:bg-gray-800 dark:hover:ring-[#3DDC84]/50">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#3DDC84]/15">
          <AndroidIcon width={18} height={18} />
        </span>
        <span className="whitespace-nowrap font-semibold text-gray-800 dark:text-gray-100">Baixar o app para Android</span>
        <span className="hidden text-xs text-gray-500 sm:inline dark:text-gray-400">
          v{release.version} · APK{size ? ` · ${size}` : ""}
        </span>
      </a>
    </div>
  );
}
