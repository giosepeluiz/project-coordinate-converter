"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface CoordinateProviderProps {
  onCoordinatesFromUrl: (coords: string) => void;
}

export function CoordinateProvider({
  onCoordinatesFromUrl,
}: CoordinateProviderProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Aceita tanto ?coord= quanto ?c=
    let coordFromUrl = searchParams.get("coord") || searchParams.get("c");
    if (coordFromUrl) {
      // Decodifica caracteres especiais de URL (pode vir codificado múltiplas vezes)
      try {
        // Tenta decodificar até que não haja mais mudanças
        let previousCoord = "";
        while (coordFromUrl !== previousCoord) {
          previousCoord = coordFromUrl;
          coordFromUrl = decodeURIComponent(coordFromUrl);
        }
      } catch (e) {
        // Se falhar na decodificação, usa o valor original
        console.error("Erro ao decodificar coordenadas:", e);
      }

      onCoordinatesFromUrl(coordFromUrl);
    }
  }, [searchParams, onCoordinatesFromUrl]);

  return null;
}
