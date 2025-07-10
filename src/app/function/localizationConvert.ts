/**
 * Converte uma string de coordenadas geográficas entre os formatos
 * Graus Decimais (DD) e Graus, Minutos e Segundos (DMS).
 * A função detecta automaticamente o formato de entrada.
 * * @param coordinates A string de coordenadas a ser convertida.
 * - Formato DD esperado: "40.7128,-74.0060"
 * - Formato DMS esperado: "40° 42' 46.08" N, 74° 0' 21.6" W"
 * * @returns A string de coordenadas no formato convertido.
 * @throws {Error} Se o formato da string de entrada for inválido.
 */
export function convertCoordinates(coordinates: string): string {
  // Verifica se a coordenada está no formato DMS (contém °)
  const isDmsFormat = coordinates.includes("°");
  const hasComma = coordinates.includes(",");

  // Se não houver vírgula, assume que é DMS e adiciona uma vírgula entre latitude e longitude
  if (hasComma && isDmsFormat) {
    if (isDmsFormat) {
      return dmsToDecimal(coordinates);
    } else {
      return decimalToDms(coordinates);
    }
  } else if (!hasComma && isDmsFormat) {
    // Se for DMS sem vírgula, assume que é uma coordenada única e converte
    return coordinates.includes("N")
      ? dmsToDecimal(coordinates.replace("N", "N,"))
      : dmsToDecimal(coordinates.replace("S", "S,"));
  }

  // Se não for DMS, assume que é decimal
  return decimalToDms(coordinates);
}

/**
 * Converte Coordenadas de Graus, Minutos, Segundos (DMS) para Graus Decimais (DD).
 * @param dmsCoord String no formato DMS, ex: "40° 42' 46.08" N, 74° 0' 21.6" W"
 * @returns String no formato DD, ex: "40.7128,-74.0060"
 */
function dmsToDecimal(dmsCoord: string): string {
  const parts = dmsCoord.split(",");
  if (parts.length !== 2)
    throw new Error("Formato DMS inválido. Esperado 'latitude, longitude'.");

  const latPart = parts[0].trim();
  const lonPart = parts[1].trim();

  const parseDmsPart = (dms: string): number => {
    // Regex para extrair graus, minutos, segundos e direção de forma robusta
    const regex = /(\d{1,3})°\s*(\d{1,2})'\s*(\d{1,2}(?:\.\d+)?)"\s*([NSEW])/i;
    const match = dms.match(regex);

    if (!match) throw new Error(`Parte da coordenada DMS inválida: "${dms}"`);

    const degrees = parseFloat(match[1]);
    const minutes = parseFloat(match[2]);
    const seconds = parseFloat(match[3]);
    const direction = match[4].toUpperCase();

    let decimal = degrees + minutes / 60 + seconds / 3600;

    // Aplica o sinal negativo para Sul e Oeste
    if (direction === "S" || direction === "W") {
      decimal *= -1;
    }

    return decimal;
  };

  const latitude = parseDmsPart(latPart);
  const longitude = parseDmsPart(lonPart);

  // Retorna com 6 casas decimais para uma boa precisão
  return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

/**
 * Converte Coordenadas de Graus Decimais (DD) para Graus, Minutos, Segundos (DMS).
 * @param decimalCoord String no formato DD, ex: "40.7128,-74.0060"
 * @returns String no formato DMS, ex: "40° 42' 46.08" N, 74° 0' 21.60" W"
 */
function decimalToDms(decimalCoord: string): string {
  const parts = decimalCoord.split(",");
  if (parts.length !== 2)
    throw new Error("Formato decimal inválido. Esperado 'latitude,longitude'.");

  const latDecimal = parseFloat(parts[0]);
  const lonDecimal = parseFloat(parts[1]);

  if (isNaN(latDecimal) || isNaN(lonDecimal)) {
    throw new Error("Coordenadas decimais contém caracteres não numéricos.");
  }

  const getDmsPart = (decimal: number, isLatitude: boolean): string => {
    // Define a direção (N/S para latitude, E/W para longitude)
    const direction = isLatitude
      ? decimal >= 0
        ? "N"
        : "S"
      : decimal >= 0
      ? "E"
      : "W";

    const absDecimal = Math.abs(decimal);

    const degrees = Math.floor(absDecimal);
    const minutesDecimal = (absDecimal - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(2); // Arredonda segundos para 2 casas decimais

    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  const latitudeDms = getDmsPart(latDecimal, true);
  const longitudeDms = getDmsPart(lonDecimal, false);

  return `${latitudeDms}, ${longitudeDms}`;
}
