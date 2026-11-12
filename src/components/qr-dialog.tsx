"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, DownloadIcon } from "./icons";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Conteúdo codificado no QR (link de compartilhamento). */
  value: string;
  /** Texto exibido abaixo do QR. */
  label: string;
  fileName: string;
};

export function QrDialog({ open, onClose, value, label, fileName }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [dataUrl, setDataUrl] = useState("");

  // <dialog> nativo: foco preso, Esc fecha e o foco volta ao botão de origem.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // Carrega a biblioteca só quando o usuário pede o QR.
    import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(value, { width: 512, margin: 2 }).then((url) => {
        if (!cancelled) setDataUrl(url);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [open, value]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="qr-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-6 text-gray-900 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-fade-in dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <h2 id="qr-title" className="text-lg font-bold">
          QR Code da localização
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white">
          <CloseIcon />
        </button>
      </div>

      <div className="mt-4 flex aspect-square items-center justify-center rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL gerada no cliente
          <img src={dataUrl} alt={`QR Code para ${label}`} className="h-full w-full" />
        ) : (
          <div className="h-full w-full animate-pulse rounded-lg bg-gray-100" />
        )}
      </div>

      <p className="mt-3 text-center font-mono text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-center text-xs text-gray-500">
        Ao escanear, abre esta página com os botões para Waze, Google Maps e Apple Maps.
      </p>

      <a
        href={dataUrl || undefined}
        download={fileName}
        aria-disabled={!dataUrl}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 aria-disabled:pointer-events-none aria-disabled:opacity-50">
        <DownloadIcon />
        Baixar imagem
      </a>
    </dialog>
  );
}
