/**
 * Extrai coordenadas de URLs de diversos serviços de mapas (síncrono).
 * Suporta Google Maps, Waze, Apple Maps, OpenStreetMap e outros formatos.
 *
 * @param input String de entrada que pode ser coordenadas puras ou uma URL
 * @returns Coordenadas no formato decimal "latitude,longitude" ou a string original se não for uma URL
 */
export function extractCoordinatesFromUrl(input: string): string {
  // Se não parece ser uma URL, retorna o input original
  if (
    !input.includes("://") &&
    !input.includes("www.") &&
    !input.includes("maps.") &&
    !input.includes("goo.gl")
  ) {
    return input.trim();
  }

  try {
    // Tenta criar um objeto URL para facilitar a extração de parâmetros
    let url: URL;
    try {
      url = new URL(input);
    } catch {
      // Se falhar, tenta adicionar protocolo
      url = new URL("https://" + input);
    }

    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // URLs encurtadas do Google Maps (goo.gl) precisam de requisição assíncrona
    // Retorna o input original para ser processado pela função async
    if (hostname.includes("goo.gl")) {
      return input.trim();
    }

    // Google Maps
    // Formatos:
    // - https://www.google.com/maps?q=40.7128,-74.0060
    // - https://www.google.com/maps/@40.7128,-74.0060,15z
    // - https://maps.google.com/maps?q=40.7128,-74.0060
    // - https://www.google.com/maps/place/40.7128,-74.0060
    if (hostname.includes("google") && hostname.includes("maps")) {
      // Tenta extrair do parâmetro 'q'
      const q = searchParams.get("q");
      if (q) {
        const coords = parseCoordinateString(q);
        if (coords) return coords;
      }

      // Tenta extrair do pathname (formato @lat,lng)
      const atMatch = pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (atMatch) {
        return `${atMatch[1]},${atMatch[2]}`;
      }

      // Tenta extrair do pathname (formato /place/lat,lng)
      const placeMatch = pathname.match(/\/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (placeMatch) {
        return `${placeMatch[1]},${placeMatch[2]}`;
      }

      // Tenta extrair coordenadas do pathname de forma mais ampla
      const coordMatch = pathname.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (coordMatch) {
        return `${coordMatch[1]},${coordMatch[2]}`;
      }
    }

    // Waze
    // Formato: https://waze.com/ul?ll=40.7128,-74.0060
    if (hostname.includes("waze")) {
      const ll = searchParams.get("ll");
      if (ll) {
        const coords = parseCoordinateString(ll);
        if (coords) return coords;
      }
    }

    // Apple Maps
    // Formatos:
    // - https://maps.apple.com/?ll=40.7128,-74.0060
    // - https://maps.apple.com/place?coordinate=40.7128,-74.0060
    if (hostname.includes("apple") && hostname.includes("maps")) {
      const ll = searchParams.get("ll");
      if (ll) {
        const coords = parseCoordinateString(ll);
        if (coords) return coords;
      }

      const coordinate = searchParams.get("coordinate");
      if (coordinate) {
        const coords = parseCoordinateString(coordinate);
        if (coords) return coords;
      }
    }

    // OpenStreetMap
    // Formato: https://www.openstreetmap.org/?mlat=40.7128&mlon=-74.0060#map=15/40.7128/-74.0060
    if (hostname.includes("openstreetmap")) {
      const mlat = searchParams.get("mlat");
      const mlon = searchParams.get("mlon");
      if (mlat && mlon) {
        return `${mlat},${mlon}`;
      }

      // Tenta extrair do hash
      const hash = url.hash;
      const hashMatch = hash.match(/\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/);
      if (hashMatch) {
        return `${hashMatch[1]},${hashMatch[2]}`;
      }
    }

    // Bing Maps
    // Formato: https://www.bing.com/maps?cp=40.7128~-74.0060
    if (hostname.includes("bing") && hostname.includes("maps")) {
      const cp = searchParams.get("cp");
      if (cp) {
        const coords = cp.replace("~", ",");
        const parsed = parseCoordinateString(coords);
        if (parsed) return parsed;
      }
    }

    // Formato genérico de coordenadas na URL
    // Tenta encontrar padrões como lat=40.7128&lon=-74.0060
    const lat = searchParams.get("lat") || searchParams.get("latitude");
    const lon =
      searchParams.get("lon") ||
      searchParams.get("lng") ||
      searchParams.get("longitude");
    if (lat && lon) {
      return `${lat},${lon}`;
    }

    // Se chegou aqui, tenta encontrar coordenadas em qualquer parte da URL
    const urlString = input;
    const genericMatch = urlString.match(
      /(-?\d+\.?\d{4,})\s*,\s*(-?\d+\.?\d{4,})/,
    );
    if (genericMatch) {
      return `${genericMatch[1]},${genericMatch[2]}`;
    }
  } catch (error) {
    // Se houver erro no parsing da URL, retorna o input original
    console.error("Erro ao extrair coordenadas da URL:", error);
  }

  // Se não conseguiu extrair, retorna o input original
  return input.trim();
}

/**
 * Função auxiliar para validar e formatar string de coordenadas
 * @param coordStr String contendo coordenadas
 * @returns Coordenadas formatadas ou null se inválido
 */
function parseCoordinateString(coordStr: string): string | null {
  // Remove espaços e normaliza
  const cleaned = coordStr.trim();

  // Tenta match com padrão de coordenadas decimais
  const match = cleaned.match(/^(-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)$/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);

    // Valida ranges válidos de latitude (-90 a 90) e longitude (-180 a 180)
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return `${lat},${lon}`;
    }
  }

  return null;
}

/**
 * Extrai coordenadas de URLs fazendo requisição HTTP quando necessário (assíncrono).
 * Primeiro tenta extrair coordenadas diretamente da URL. Se não encontrar,
 * faz uma requisição HTTP para obter o conteúdo da página e extrair coordenadas.
 * Suporta URLs encurtadas (goo.gl, maps.app.goo.gl).
 *
 * @param input String de entrada que pode ser coordenadas puras ou uma URL
 * @returns Promise com coordenadas no formato decimal "latitude,longitude" ou null se não encontrar
 */
export async function extractCoordinatesFromUrlAsync(
  input: string,
): Promise<string | null> {
  // Primeiro tenta extração síncrona (coordenadas explícitas na URL)
  const syncResult = extractCoordinatesFromUrl(input);

  // Se não é uma URL ou já extraiu coordenadas, retorna
  if (
    !input.includes("://") &&
    !input.includes("www.") &&
    !input.includes("maps.") &&
    !input.includes("goo.gl")
  ) {
    // Valida o resultado antes de retornar
    const validated = validateCoordinates(syncResult);
    return validated;
  }

  // Se já extraiu coordenadas da URL, valida e retorna
  if (syncResult !== input.trim()) {
    const validated = validateCoordinates(syncResult);
    if (validated) return validated;
  }

  // Se chegou aqui, é uma URL mas não tem coordenadas explícitas
  // Vamos tentar buscar as coordenadas fazendo uma requisição
  try {
    let url: URL;
    try {
      url = new URL(input);
    } catch {
      url = new URL("https://" + input);
    }

    const hostname = url.hostname.toLowerCase();

    // Detecta URLs encurtadas do Google Maps e segue o redirecionamento
    if (hostname.includes("goo.gl") || hostname.includes("maps.app.goo.gl")) {
      const expandedUrl = await expandShortenedUrl(input);
      console.log("URL expandida:", expandedUrl);

      if (expandedUrl) {
        // Tenta extrair coordenadas da URL expandida primeiro
        const coords = extractCoordinatesFromUrl(expandedUrl);
        const validated = validateCoordinates(coords);

        if (validated && validated !== expandedUrl) {
          return validated;
        }
        // Se não conseguiu extrair diretamente, busca no conteúdo
        const fetchedCoords = await fetchGoogleMapsCoordinates(expandedUrl);
        const validatedFetched = validateCoordinates(fetchedCoords);
        if (validatedFetched) return validatedFetched;
      }
    }

    // Para Google Maps com lugares nomeados
    if (hostname.includes("google") && hostname.includes("maps")) {
      const coords = await fetchGoogleMapsCoordinates(input);
      const validated = validateCoordinates(coords);
      if (validated) return validated;
    }

    // Para outras URLs de mapas, tenta buscar meta tags ou dados estruturados
    const coords = await fetchCoordinatesFromPage(input);
    const validated = validateCoordinates(coords);
    if (validated) return validated;
  } catch (error) {
    console.error("Erro ao buscar coordenadas da URL:", error);
  }

  return null;
}

/**
 * Valida se a string contém coordenadas válidas
 * @param coords String de coordenadas
 * @returns Coordenadas validadas ou null
 */
function validateCoordinates(coords: string | null): string | null {
  if (!coords) return null;

  const cleaned = coords.trim();

  // Verifica se é formato decimal válido
  const decimalPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
  if (decimalPattern.test(cleaned)) {
    const parts = cleaned.split(",");
    const lat = parseFloat(parts[0].trim());
    const lon = parseFloat(parts[1].trim());

    if (
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    ) {
      return `${lat},${lon}`;
    }
  }

  // Verifica se é formato DMS válido
  const dmsPattern = /\d+°.*[NSEW]/i;
  if (dmsPattern.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Expande URLs encurtadas seguindo o redirecionamento HTTP
 * Usa API route do Next.js para contornar CORS
 * @param shortUrl URL encurtada
 * @returns URL completa expandida ou null se falhar
 */
async function expandShortenedUrl(shortUrl: string): Promise<string | null> {
  try {
    // Chama a API route do Next.js para fazer a requisição do lado do servidor
    const response = await fetch("/api/expand-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: shortUrl }),
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Retorna a URL final após redirecionamentos
    if (data.finalUrl && data.finalUrl !== shortUrl) {
      return data.finalUrl;
    }

    return null;
  } catch (error) {
    console.error("Erro ao expandir URL encurtada:", error);
    return null;
  }
}

/**
 * Busca coordenadas de uma URL do Google Maps através de requisição HTTP
 * Usa API route do Next.js para contornar CORS
 * @param url URL do Google Maps
 * @returns Coordenadas ou null
 */
async function fetchGoogleMapsCoordinates(url: string): Promise<string | null> {
  try {
    // Chama a API route do Next.js
    const response = await fetch("/api/expand-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const html = data.html;

    if (!html) return null;

    // Tenta encontrar coordenadas no HTML do Google Maps
    // O Google Maps coloca coordenadas em várias meta tags e scripts

    // Padrão 1: Meta tag com coordenadas
    const metaRegex =
      /<meta[^>]*content=["']([^"']*@-?\d+\.?\d*,-?\d+\.?\d*[^"']*)["']/i;
    const metaMatch = html.match(metaRegex);
    if (metaMatch) {
      const coordMatch = metaMatch[1].match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (coordMatch) {
        return `${coordMatch[1]},${coordMatch[2]}`;
      }
    }

    // Padrão 2: Dados JSON estruturados
    const jsonRegex = /"@-?\d+\.?\d*,-?\d+\.?\d*"/g;
    const jsonMatches = html.match(jsonRegex);
    if (jsonMatches && jsonMatches.length > 0) {
      const coordMatch = jsonMatches[0].match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (coordMatch) {
        return `${coordMatch[1]},${coordMatch[2]}`;
      }
    }

    // Padrão 3: Links canônicos ou alternativos
    const canonicalRegex =
      /<link[^>]*href=["']([^"']*@-?\d+\.?\d*,-?\d+\.?\d*[^"']*)["']/i;
    const canonicalMatch = html.match(canonicalRegex);
    if (canonicalMatch) {
      const coordMatch = canonicalMatch[1].match(
        /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      );
      if (coordMatch) {
        return `${coordMatch[1]},${coordMatch[2]}`;
      }
    }

    // Padrão 4: Busca por padrão de coordenadas em qualquer lugar
    const generalCoordRegex = /[-]?\d+\.\d{6,},[-]?\d+\.\d{6,}/g;
    const coordMatches = html.match(generalCoordRegex);
    if (coordMatches && coordMatches.length > 0) {
      // Pega a primeira ocorrência que pareça válida
      for (const match of coordMatches) {
        const [latStr, lonStr] = match.split(",");
        const lat = parseFloat(latStr);
        const lon = parseFloat(lonStr);
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          return `${lat},${lon}`;
        }
      }
    }
  } catch (error) {
    console.error("Erro ao buscar página do Google Maps:", error);
  }

  return null;
}

/**
 * Busca coordenadas de uma página web através de meta tags e dados estruturados
 * Usa API route do Next.js para contornar CORS
 * @param url URL da página
 * @returns Coordenadas ou null
 */
async function fetchCoordinatesFromPage(url: string): Promise<string | null> {
  try {
    // Chama a API route do Next.js
    const response = await fetch("/api/expand-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const html = data.html;

    if (!html) return null;

    // Busca por meta tags geo
    const geoLatRegex =
      /<meta[^>]*name=["']?geo\.position["']?[^>]*content=["']([^"']+)["']/i;
    const geoMatch = html.match(geoLatRegex);
    if (geoMatch) {
      const coords = parseCoordinateString(geoMatch[1].replace(";", ","));
      if (coords) return coords;
    }

    // Busca por ICBM meta tag
    const icbmRegex =
      /<meta[^>]*name=["']?ICBM["']?[^>]*content=["']([^"']+)["']/i;
    const icbmMatch = html.match(icbmRegex);
    if (icbmMatch) {
      const coords = parseCoordinateString(icbmMatch[1].replace(";", ","));
      if (coords) return coords;
    }

    // Busca por dados estruturados (Schema.org)
    const schemaRegex =
      /"latitude"\s*:\s*"?(-?\d+\.?\d*)"?\s*,\s*"longitude"\s*:\s*"?(-?\d+\.?\d*)"?/i;
    const schemaMatch = html.match(schemaRegex);
    if (schemaMatch) {
      return `${schemaMatch[1]},${schemaMatch[2]}`;
    }

    // Busca padrão alternativo de Schema.org
    const schemaRegex2 =
      /"geo"\s*:\s*\{\s*"@type"\s*:\s*"GeoCoordinates"\s*,\s*"latitude"\s*:\s*"?(-?\d+\.?\d*)"?\s*,\s*"longitude"\s*:\s*"?(-?\d+\.?\d*)"?/i;
    const schemaMatch2 = html.match(schemaRegex2);
    if (schemaMatch2) {
      return `${schemaMatch2[1]},${schemaMatch2[2]}`;
    }
  } catch (error) {
    console.error("Erro ao buscar página:", error);
  }

  return null;
}
