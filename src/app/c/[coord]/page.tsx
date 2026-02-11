// src/app/c/[coord]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { redirect } from "next/navigation";
import { useEffect } from "react";

/**
 * Esta rota captura /c/coordenadas e redireciona para a home com query string
 */
export default function CoordPage() {
  const params = useParams();

  useEffect(() => {
    const coord = params.coord as string;
    if (coord) {
      // Decodifica caracteres especiais de URL (pode vir codificado múltiplas vezes)
      let decodedCoord = coord;
      try {
        // Tenta decodificar até que não haja mais mudanças
        let previousCoord = "";
        while (decodedCoord !== previousCoord) {
          previousCoord = decodedCoord;
          decodedCoord = decodeURIComponent(decodedCoord);
        }
      } catch (e) {
        // Se falhar na decodificação, usa o valor original
        decodedCoord = coord;
      }

      // Redireciona para home com query string
      window.location.href = `/?c=${encodeURIComponent(decodedCoord)}`;
    }
  }, [params]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Carregando coordenadas...</p>
      </div>
    </main>
  );
}
