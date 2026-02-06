// src/app/[...coord]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Esta é uma rota dinâmica catch-all que captura qualquer path como /40.7128,-74.0060
 * e redireciona para a página principal, permitindo que o componente principal processe as coordenadas
 */
export default function CoordPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Pega o parâmetro coord do path
    const coord = params.coord;

    if (coord) {
      // Se coord é um array (múltiplos segmentos), junta com /
      const coordStr = Array.isArray(coord) ? coord.join("/") : coord;

      // Redireciona para a página principal com as coordenadas no path
      router.replace(`/${coordStr}`);
    } else {
      // Se não houver coordenadas, vai para a home
      router.replace("/");
    }
  }, [params, router]);

  // Renderiza loading enquanto redireciona
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Carregando coordenadas...</p>
      </div>
    </main>
  );
}
