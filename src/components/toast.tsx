"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DURATION = 2200;

export function useToast() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((message: string) => {
    clearTimeout(timer.current);
    // O id novo reinicia a animação mesmo com a mesma mensagem.
    setToast({ id: Date.now(), message });
    timer.current = setTimeout(() => setToast(null), DURATION);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, show };
}

export function Toast({ toast }: { toast: { id: number; message: string } | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-24 md:justify-end md:px-6">
      {toast && (
        <div
          key={toast.id}
          className="animate-toast rounded-lg bg-gray-900/90 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm dark:bg-white/90 dark:text-gray-900">
          {toast.message}
        </div>
      )}
    </div>
  );
}
