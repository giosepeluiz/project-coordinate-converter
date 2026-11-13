export const LANGS = [
  { code: "pt-BR", name: "Português (Brasil)" },
  { code: "pt-PT", name: "Português (Portugal)" },
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
  { code: "nl", name: "Nederlands" },
  { code: "pl", name: "Polski" },
  { code: "ru", name: "Русский" },
  { code: "tr", name: "Türkçe" },
  { code: "uk", name: "Українська" },
  { code: "ja", name: "日本語" },
  { code: "zh-CN", name: "中文（简体）" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

const CODES = LANGS.map((l) => l.code) as readonly string[];
export const isLang = (v: unknown): v is Lang => typeof v === "string" && CODES.includes(v);

const EN_GB_REGIONS = ["gb", "au", "nz", "ie", "za", "in"];

/** Regras do app Android para um único locale (ex.: "pt_PT", "en-AU", "zh-Hant"). */
function mapLocale(locale: string): Lang | null {
  const [language, region = ""] = locale.trim().toLowerCase().replace("_", "-").split("-");
  switch (language) {
    case "pt":
      return region === "pt" ? "pt-PT" : "pt-BR";
    case "en":
      return EN_GB_REGIONS.includes(region) ? "en-GB" : "en-US";
    case "zh":
      return "zh-CN";
    default:
      return isLang(language) ? language : null;
  }
}

/** Primeiro idioma suportado da lista de preferências; senão, inglês (EUA). */
export function detectLang(locales: readonly string[]): Lang {
  for (const l of locales) {
    const found = mapLocale(l);
    if (found) return found;
  }
  return "en-US";
}

/** "pt-PT,pt;q=0.9,en;q=0.8" → ["pt-PT", "pt", "en"], ordenado por q. */
export function parseAcceptLanguage(header: string | null): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim(), q: q ? Number(q) : 1 };
    })
    .filter((p) => p.tag && p.tag !== "*" && !Number.isNaN(p.q))
    .sort((a, b) => b.q - a.q)
    .map((p) => p.tag);
}
