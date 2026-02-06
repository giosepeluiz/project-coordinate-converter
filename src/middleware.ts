import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica se é o padrão /coord/...
  if (pathname.startsWith("/coord/")) {
    // Extrai as coordenadas após "/coord/"
    const coords = decodeURIComponent(pathname.slice(7)); // Remove "/coord/"

    // Cria URL com query string
    const url = new URL(request.nextUrl.origin);
    url.pathname = "/";
    url.search = `?coord=${encodeURIComponent(coords)}`;

    // Faz um redirect para que a página leia o query param corretamente
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|static).*)",
  ],
};
