// src/app/[...coord]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Esta rota redireciona qualquer path para /c/coordenadas
 */
export default function CoordPage() {
  const params = useParams();

  useEffect(() => {
    const coord = params.coord;
    if (coord) {
      const coordStr = Array.isArray(coord) ? coord.join(",") : coord;
      // Redireciona para /c/coordenadas
      window.location.href = `/c/${coordStr}`;
    } else {
      window.location.href = "/";
    }
  }, [params]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </main>
  );
}
