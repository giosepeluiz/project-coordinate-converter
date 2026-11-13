"use client";

import { useSyncExternalStore } from "react";
import { detectPlatform, type Platform } from "@/lib/deep-links";

const noopSubscribe = () => () => {};

/**
 * Plataforma do aparelho. O servidor já detecta pelo User-Agent (os links de
 * app vêm prontos no HTML); no navegador refinamos — o iPadOS se apresenta
 * como "Macintosh" e só é reconhecido pela tela de toque.
 */
export function usePlatform(serverPlatform: Platform): Platform {
  return useSyncExternalStore(
    noopSubscribe,
    () => detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
    () => serverPlatform,
  );
}
