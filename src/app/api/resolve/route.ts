import { NextRequest, NextResponse } from "next/server";
import { resolveInput } from "@/lib/resolve";

/**
 * GET /api/resolve?u=<coordenadas ou URL de mapa>
 * Responde { lat, lng } ou 422 quando não encontra coordenadas.
 * Só acessa serviços de mapas conhecidos (ver src/lib/resolve.ts).
 */
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("u")?.trim();

  if (!input || input.length > 2048) {
    return NextResponse.json({ error: "Informe uma URL ou coordenada." }, { status: 400 });
  }

  const coords = await resolveInput(input);
  if (!coords) {
    return NextResponse.json(
      { error: "Não foi possível encontrar coordenadas nesse link." },
      { status: 422 },
    );
  }

  return NextResponse.json(coords, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
