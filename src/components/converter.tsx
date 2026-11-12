"use client";

import { useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { formatDecimal, toParam, type LatLng } from "@/lib/coordinates";
import { isMapUrl, parseInput, toUrl } from "@/lib/map-urls";
import { NOT_FOUND_MESSAGE } from "@/lib/messages";
import { CloseIcon, Spinner } from "./icons";
import { MapBackground } from "./map-background";
import { QrDialog } from "./qr-dialog";
import { Results, ResultsSkeleton } from "./results";
import { ThemeToggle } from "./theme";
import { Toast, useToast } from "./toast";

type Props = {
  initialInput: string;
  initialCoords: LatLng | null;
  initialError: string | null;
};

export function Converter({ initialInput, initialCoords, initialError }: Props) {
  const [input, setInput] = useState(initialInput);
  const [coords, setCoords] = useState<LatLng | null>(initialCoords);
  const [error, setError] = useState<string | null>(initialError);
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

  const fail = (message: string) => {
    setCoords(null);
    setError(message);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return focusInput();

    request.current?.abort();
    const url = toUrl(value);

    // Coordenadas digitadas ou URL com coordenadas: resultado instantâneo.
    const local = parseInput(value);
    if (local) return showResult(local, !!url);

    if (!url || !isMapUrl(url)) return fail(NOT_FOUND_MESSAGE);

    // Link curto ou lugar por nome: resolve no servidor.
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/resolve?u=${encodeURIComponent(value)}`, {
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error);
      showResult(data as LatLng, true);
    } catch (err) {
      if (controller.signal.aborted) return;
      fail((err as Error).message || "Não foi possível ler esse link. Verifique se ele está completo.");
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

  const handleCopy = async (text: string, what: string) => {
    show((await copyText(text)) ? `${what} copiado!` : "Não foi possível copiar.");
  };

  const shareUrl = coords ? `${typeof window === "undefined" ? "" : window.location.origin}/?c=${toParam(coords)}` : "";

  const handleShare = async () => {
    if (!coords) return;
    const data = { title: "Localização", text: `Localização: ${formatDecimal(coords)}`, url: shareUrl };
    if (navigator.share && navigator.canShare?.(data)) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    handleCopy(shareUrl, "Link");
  };

  const showForm = !coords || editing;

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 pb-28 pt-4 md:justify-center md:px-8 md:pb-32 md:pt-12">
      <MapBackground />

      <div className="w-full max-w-2xl space-y-3 md:space-y-4">
        <section
          className={`${showForm ? "" : "hidden md:block"} rounded-2xl bg-white/90 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur md:p-8 dark:bg-gray-900/85 dark:ring-white/10`}>
          <h1 className="text-center text-2xl font-bold text-emerald-700 md:text-3xl dark:text-emerald-400">
            Conversor de Coordenadas
          </h1>
          {!coords && (
            <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-gray-600 md:text-base dark:text-gray-400">
              Converta entre decimal e DMS, ou cole um link do Google Maps, Waze ou Apple Maps.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row" noValidate>
            <label htmlFor="coord" className="sr-only">
              Coordenadas ou link de mapa
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
                placeholder="Ex.: 38.7223, -9.1393 ou link do mapa"
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
                  aria-label="Limpar campo"
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
                  <Spinner width={18} height={18} /> Buscando…
                </>
              ) : (
                "Converter"
              )}
            </button>
          </form>

          {error ? (
            <p
              id="coord-error"
              role="alert"
              className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900">
              {error}
            </p>
          ) : (
            !coords && (
              <p id="coord-hint" className="mt-4 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                Aceita <code className="font-mono">38.7223, -9.1393</code> ·{" "}
                <code className="font-mono">38°43&apos;20.3&quot;N 9°08&apos;21.5&quot;W</code> ·{" "}
                <code className="font-mono">38°43.338&apos;N 9°8.358&apos;W</code> · links curtos e completos
              </p>
            )
          )}
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

      <footer className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-black/5 bg-white/95 px-4 py-2.5 backdrop-blur md:justify-center dark:border-white/10 dark:bg-gray-950/95">
        <div className="min-w-0 flex-1 md:flex-none md:text-center">
        <p className="text-xs font-medium text-gray-700 md:text-sm dark:text-gray-300">
          Desenvolvido por{" "}
          <a
            href="https://github.com/giosepeluiz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400">
            Giosepe Luiz
          </a>
        </p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
<span className="hidden sm:inline">Sua privacidade garantida: n</span><span className="sm:hidden">N</span>enhum dado pessoal é armazenado.
        </p>
        </div>
        <div className="md:absolute md:right-6">
          <ThemeToggle />
        </div>
      </footer>
    </main>
  );
}
