import { NextRequest, NextResponse } from "next/server";

/**
 * API Route para expandir URLs encurtadas e buscar coordenadas
 * Contorna problemas de CORS fazendo requisições do lado do servidor
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL inválida ou não fornecida" },
        { status: 400 },
      );
    }

    // Faz a requisição seguindo redirecionamentos
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Retorna a URL final após redirecionamentos
    const finalUrl = response.url;
    const html = await response.text();

    return NextResponse.json({
      finalUrl,
      html,
      status: response.status,
    });
  } catch (error) {
    console.error("Erro ao expandir URL:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar URL",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
