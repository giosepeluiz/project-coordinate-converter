"use client";

import { useRef, useState } from "react";
import type { MessageKey } from "@/i18n/messages";
import type { AndroidRelease } from "@/lib/android-release";
import { copyText } from "@/lib/clipboard";
import { formatDecimal, toParam, type LatLng } from "@/lib/coordinates";
import { extractUrlFromText, isMapUrl, parseInput, toUrl } from "@/lib/map-urls";
import { AndroidDownload } from "./android-download";
import { CloseIcon, Spinner } from "./icons";
import { MapBackground } from "./map-background";
import { QrDialog } from "./qr-dialog";
import { Results, ResultsSkeleton } from "./results";
import { useSettings } from "./settings-provider";
import { SiteFooter } from "./site-footer";
import { Toast, useToast } from "./toast";

type Props = {
  initialInput: string;
  initialCoords: LatLng | null;
  /** A entrada da URL não pôde ser interpretada. */
  initialError: boolean;
  /** Release do app Android; null esconde o botão (ex.: iPhone). */
  androidApp: AndroidRelease | null;
};

export function Converter({ initialInput, initialCoords, initialError, androidApp }: Props) {
  const { t } = useSettings();
  const [input, setInput] = useState(initialInput);
  const [coords, setCoords] = useState<LatLng | null>(initialCoords);
  const [error, setError] = useState<MessageKey | null>(initialError ? "errNotFound" : null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const { toast, show } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);

  const focusInput = () => requestAnimationFrame(() => inputRef.current?.focus());

  const showResult = (c: LatLng, replaceInput: boolean) => {
    if (replaceInput) setInput(formatDecimal(c));
    setCoords(c);
    setError(null);
    setEditing(false);
    // URL limpa e compartilhável, sem recarregar a página.
    window.history.replaceState(null, "", `/?c=${toParam(c)}`);
  };

  const fail = (key: MessageKey) => {
    setCoords(null);
    setError(key);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return focusInput();

    request.current?.abort();
    // Texto de compartilhamento ("Nome do lugar https://…"): usa o link de dentro.
    const link = toUrl(value) ? value : extractUrlFromText(value);
    const url = link ? toUrl(link) : null;

    // Coordenadas digitadas ou URL com coordenadas: resultado instantâneo.
    const local = parseInput(value);
    if (local) return showResult(local, !!link);

    if (!url || !isMapUrl(url)) return fail("errNotFound");

    // Link curto ou lugar por nome: resolve no servidor.
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/resolve?u=${encodeURIComponent(link!)}`, { signal: controller.signal });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error();
      showResult(data as LatLng, true);
    } catch {
      if (!controller.signal.aborted) fail("errLink");
    } finally {
      if (request.current === controller) setLoading(false);
    }
  };

  const handleReset = () => {
    request.current?.abort();
    setLoading(false);
    setInput("");
    setCoords(null);
    setError(null);
    setEditing(false);
    window.history.replaceState(null, "", "/");
    focusInput();
  };

  const handleCopy = async (text: string, kind: "coord" | "link") => {
    const ok = await copyText(text);
    show(ok ? t(kind === "coord" ? "copiedCoord" : "copiedLink") : t("copyFailed"));
  };

  const shareUrl = coords
    ? `${typeof window === "undefined" ? "" : window.location.origin}/?c=${toParam(coords)}`
    : "";

  const handleShare = async () => {
    if (!coords) return;
    const data = {
      title: t("shareTitle"),
      text: t("shareText", { coords: formatDecimal(coords) }),
      url: shareUrl,
    };
    if (navigator.share && navigator.canShare?.(data)) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    handleCopy(shareUrl, "link");
  };

  const showForm = !coords || editing;

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 pb-28 pt-4 md:justify-center md:px-8 md:pb-32 md:pt-12">
      <MapBackground />

      <div className="w-full max-w-2xl space-y-3 md:space-y-4">
        <section
          className={`${showForm ? "" : "hidden md:block"} rounded-2xl bg-white/90 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur md:p-8 dark:bg-gray-900/85 dark:ring-white/10`}>
          <h1 className="text-center text-2xl font-bold text-emerald-700 md:text-3xl dark:text-emerald-400">
            {t("appTitle")}
          </h1>
          {!coords && (
            <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-gray-600 md:text-base dark:text-gray-400">
              {t("appSubtitle")}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row" noValidate>
            <label htmlFor="coord" className="sr-only">
              {t("inputLabel")}
            </label>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                id="coord"
                name="coord"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder={t("placeholder")}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                aria-invalid={!!error}
                aria-describedby={error ? "coord-error" : "coord-hint"}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-3 pr-11 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 aria-invalid:border-red-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
              {input && (
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label={t("clearInput")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                  <CloseIcon width={18} height={18} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70">
              {loading ? (
                <>
                  <Spinner width={18} height={18} /> {t("searching")}
                </>
              ) : (
                t("convert")
              )}
            </button>
          </form>

          {error ? (
            <p
              id="coord-error"
              role="alert"
              className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900">
              {t(error)}
            </p>
          ) : (
            !coords && (
              <p id="coord-hint" className="mt-4 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {t("hintAccepts")} <code className="font-mono">38.7223, -9.1393</code> ·{" "}
                <code className="font-mono">38°43&apos;20.3&quot;N 9°08&apos;21.5&quot;W</code> ·{" "}
                <code className="font-mono">38°43.338&apos;N 9°8.358&apos;W</code> · {t("hintLinks")}
              </p>
            )
          )}

          {!coords && androidApp && <AndroidDownload release={androidApp} />}
        </section>

        {loading && <ResultsSkeleton />}
        {coords && !loading && (
          <Results
            coords={coords}
            onCopy={handleCopy}
            onQr={() => setQrOpen(true)}
            onShare={handleShare}
            onReset={handleReset}
            onEdit={() => {
              setEditing(true);
              focusInput();
            }}
          />
        )}

        {/* Também na página do resultado, para quem quiser instalar o app. */}
        {coords && !loading && androidApp && <AndroidDownload release={androidApp} variant="standalone" />}
      </div>

      {coords && (
        <QrDialog
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          value={shareUrl}
          label={formatDecimal(coords)}
          fileName={`localizacao-${toParam(coords).replace(",", "_")}.png`}
        />
      )}

      <Toast toast={toast} />
      <SiteFooter />
    </main>
  );
}
