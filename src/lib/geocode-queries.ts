/**
 * Gera as consultas de geocodificação para um endereço, do mais completo ao
 * mais simples (até só a rua), como no app Android. Nunca reduz a consulta a
 * só código postal ou só cidade, para não devolver um ponto genérico.
 */

const ABBREVIATIONS: [RegExp, string][] = [
  [/\bR\.\s*/gi, "Rua "],
  [/\bAv\.\s*/gi, "Avenida "],
  [/\bTv\.\s*/gi, "Travessa "],
  [/\bLg\.\s*/gi, "Largo "],
  [/\bP[çc]\.\s*/gi, "Praça "],
  [/\bEst\.\s*/gi, "Estrada "],
  [/\bC[çc]\.\s*/gi, "Calçada "],
];

export function expandAbbreviations(s: string): string {
  return ABBREVIATIONS.reduce((acc, [re, full]) => acc.replace(re, full), s).replace(/\s+/g, " ").trim();
}

const POSTAL = /^\s*(\d{4}-\d{3}|\d{5}-?\d{3}|\d{4,6})(\s+[\p{L} .'-]+)?\s*$/u;
const STREET = /\b(rua|avenida|travessa|largo|praça|estrada|calçada|alameda|rodovia|street|st|road|rd|avenue|ave|calle|via|strasse|straße)\b/i;

/** Um trecho que, sozinho, seria genérico demais (código postal, cidade, país). */
const isTooGeneric = (parts: string[]) =>
  parts.length === 0 ||
  parts.every((p) => POSTAL.test(p) || (!/\d/.test(p) && !STREET.test(p) && p.split(" ").length <= 3));

export function geocodeQueries(query: string, max = 5): string[] {
  const parts = expandAbbreviations(query)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return [];

  const out: string[] = [parts.join(", ")];
  // Tira o primeiro trecho (nome do estabelecimento etc.) a cada tentativa.
  for (let i = 1; i < parts.length && out.length < max; i++) {
    const rest = parts.slice(i);
    if (isTooGeneric(rest)) break;
    out.push(rest.join(", "));
  }
  // Por último, só a rua (com número), se houver.
  const street = parts.find((p) => STREET.test(p));
  if (street && out.length < max && !out.includes(street)) out.push(street);

  return [...new Set(out)].slice(0, max);
}
