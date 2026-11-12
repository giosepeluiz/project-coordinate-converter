import { NextResponse, type NextRequest } from "next/server";
import { parseCoordinates, toParam } from "@/lib/coordinates";
import { extractFromUrl, isMapUrl, toUrl } from "@/lib/map-urls";
import { resolveInput } from "@/lib/resolve";

/**
 * Aceita coordenadas ou URLs de mapa coladas depois do domínio e redireciona
 * para a forma canônica /?c=lat,lng. Exemplos:
 *
 *   /38.5349,-9.0065
 *   /c/38°32'05.8"N 9°00'23.5"W          (formato antigo)
 *   /https://maps.google.com/maps?q=38.5349409%2C-9.006521&z=17
 *   /https://waze.com/ul?ll=38.5,-9.0&navigate=yes
 *   /https://maps.apple.com/?ll=38.5,-9.0
 *   /https://maps.app.goo.gl/B6kwLzPfcJHKHPeh6   (resolvido no servidor)
 */
export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;

  const home = (c: string) => {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = `?c=${c}`;
    return NextResponse.redirect(url);
  };

  // Resolve no servidor (link curto, lugar por nome) e devolve um 307 de verdade
  // para /?c=lat,lng — bom para prévias de link (WhatsApp etc.).
  const resolveTo = async (input: string, fallback: string | null) => {
    const found = await resolveInput(input);
    if (found) return home(toParam(found));
    return fallback === null ? NextResponse.next() : home(fallback);
  };

  if (pathname === "/") {
    const c = searchParams.get("c")?.trim();
    if (!c || parseCoordinates(c)) return NextResponse.next();
    const url = toUrl(c);
    // A própria página exibe o erro se não for possível resolver.
    return url && isMapUrl(url) ? resolveTo(c, null) : NextResponse.next();
  }

  let raw = pathname.slice(1);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* mantém como veio */
  }
  raw = raw.replace(/^(c|coord)\//i, "");

  const coords = parseCoordinates(raw);
  if (coords) return home(toParam(coords));

  // A query string pertence à URL colada (ex.: ?q=38.5,-9.0&z=17).
  const url = toUrl(raw + search);
  if (url && isMapUrl(url)) {
    const found = extractFromUrl(url);
    if (found) return home(toParam(found));
    // Sem coordenadas na URL: resolve; se falhar, a página mostra o erro com o link no campo.
    return resolveTo(url.href, encodeURIComponent(url.href));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Tudo, exceto a API, arquivos do Next e arquivos estáticos conhecidos.
    "/((?!api/|_next/|assets/|\\.well-known/|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest).*)",
  ],
};
