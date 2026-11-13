import { describe, expect, it } from "vitest";
import { detectLang, parseAcceptLanguage } from "@/i18n/languages";
import { translator } from "@/i18n/messages";
import { androidIntent, appDeepLink } from "./deep-links";
import { expandAbbreviations, geocodeQueries } from "./geocode-queries";
import { extractUrlFromText, isMapUrl, parseInput, placeQuery, toUrl } from "./map-urls";
import { DEFAULT_SERVICES, SERVICES } from "./services";
import { normalize, toggleService } from "./settings";

const close = (input: string, lat: number, lng: number) => {
  const c = parseInput(input);
  expect(c, input).not.toBeNull();
  expect(c!.lat).toBeCloseTo(lat, 4);
  expect(c!.lng).toBeCloseTo(lng, 4);
};

describe("novos serviços", () => {
  it("HERE WeGo", () => {
    close("https://share.here.com/l/38.5349,-9.0065,Casa?z=16", 38.5349, -9.0065);
    close("https://share.here.com/r/38.5349,-9.0065/38.7,-9.1", 38.5349, -9.0065);
    close("https://wego.here.com/?map=38.5349,-9.0065,15,normal", 38.5349, -9.0065);
  });

  it("Yandex Maps usa longitude,latitude", () => {
    close("https://yandex.com/maps/?pt=-9.0065,38.5349&z=16&l=map", 38.5349, -9.0065);
    close("https://yandex.ru/maps/?ll=37.6173,55.7558&z=12", 55.7558, 37.6173);
    close("https://maps.yandex.com/?pt=-9.0065,38.5349", 38.5349, -9.0065);
    close("https://yandex.com/maps/?rtext=38.5349,-9.0065~38.7,-9.1", 38.5349, -9.0065);
    close("yandexmaps://maps.yandex.ru/?pt=-9.0065,38.5349&z=16&l=map", 38.5349, -9.0065);
  });

  it("Organic Maps e TomTom", () => {
    close("https://omaps.app/38.5349,-9.0065/Casa", 38.5349, -9.0065);
    close("tomtomgo://x-callback-url/navigate?destination=38.5349,-9.0065", 38.5349, -9.0065);
    close("tomtomhome:geo:action=show&lat=38.5349&long=-9.0065", 38.5349, -9.0065);
  });

  it("ul.waze.com e geo:0,0 com nome", () => {
    close("https://ul.waze.com/ul?ll=38.5349,-9.0065", 38.5349, -9.0065);
    const u = toUrl("geo:0,0?q=Torre de Belém")!;
    expect(u).toBeNull(); // com espaço não é URL; vira texto
    const g = toUrl("geo:0,0?q=Torre+de+Bel%C3%A9m")!;
    expect(parseInput(g.href)).toBeNull();
    expect(placeQuery(g)).toBe("Torre de Belém");
  });
});

describe("próprio site", () => {
  it("lê /?c=, /LAT,LNG, /c/, /coord/ e links aninhados, com ou sem www", () => {
    close("https://coordenadas.arqueirover.de/?c=38.5349,-9.0065", 38.5349, -9.0065);
    close("http://www.coordenadas.arqueirover.de/38.5349,-9.0065", 38.5349, -9.0065);
    close("https://coordenadas.arqueirover.de/c/38.5349,-9.0065", 38.5349, -9.0065);
    close("https://coordenadas.arqueirover.de/coord/38.5349,-9.0065", 38.5349, -9.0065);
    close(
      "https://coordenadas.arqueirover.de/https://maps.google.com/maps?q=38.5349409%2C-9.006521&z=17",
      38.5349409,
      -9.006521,
    );
    close("https://coordenadas.arqueirover.de/https:/waze.com/ul?ll=38.5349,-9.0065", 38.5349, -9.0065);
  });

  it("link curto dentro do site é reconhecido (resolvido no servidor)", () => {
    const u = toUrl("https://coordenadas.arqueirover.de/https://maps.app.goo.gl/B6kwLzPfcJHKHPeh6")!;
    expect(isMapUrl(u)).toBe(true);
    expect(parseInput(u.href)).toBeNull();
  });
});

describe("texto de compartilhamento", () => {
  it("extrai o link de dentro da mensagem", () => {
    expect(extractUrlFromText("Torre de Belém https://maps.app.goo.gl/abc123.")).toBe("https://maps.app.goo.gl/abc123");
    close("Olha aqui: https://waze.com/ul?ll=38.5349,-9.0065&navigate=yes", 38.5349, -9.0065);
  });
});

describe("links gerados", () => {
  const c = { lat: 38.5349409, lng: -9.006521 };
  it("cada serviço gera o link do documento", () => {
    const web = Object.fromEntries(SERVICES.map((s) => [s.id, s.web(c)]));
    expect(web.tomtom).toBe("https://plan.tomtom.com/en?p=38.534941,-9.006521,16z");
    expect(web.here).toBe("https://share.here.com/l/38.534941,-9.006521?z=16&t=normal");
    expect(web.yandex).toBe("https://yandex.com/maps/?pt=-9.006521,38.534941&z=16&l=map");
    expect(web.osm).toBe("https://www.openstreetmap.org/?mlat=38.534941&mlon=-9.006521#map=17/38.534941/-9.006521");
    expect(web.bing).toBe("https://www.bing.com/maps?cp=38.534941~-9.006521&lvl=17&sp=point.38.534941_-9.006521_");
    expect(web.organicmaps).toBe("https://omaps.app/38.534941,-9.006521");
  });

  it("intent: com esquema geo no Android; Yandex chama o esquema direto", () => {
    expect(androidIntent("geo:1,2?q=1,2", "app.organicmaps", "https://x")).toBe(
      "intent:1,2?q=1,2#Intent;scheme=geo;package=app.organicmaps;S.browser_fallback_url=https%3A%2F%2Fx;end",
    );
    expect(appDeepLink("organicmaps", c, "android")).toContain("scheme=geo;package=app.organicmaps");
    expect(appDeepLink("yandex", c, "android")).toBe("yandexmaps://maps.yandex.ru/?pt=-9.006521,38.534941&z=16&l=map");
    expect(appDeepLink("osm", c, "android")).toBeNull();
  });
});

describe("idiomas", () => {
  it("regras de detecção do app Android", () => {
    expect(detectLang(["pt-PT"])).toBe("pt-PT");
    expect(detectLang(["pt_PT"])).toBe("pt-PT");
    expect(detectLang(["pt-AO"])).toBe("pt-BR");
    expect(detectLang(["en-AU"])).toBe("en-GB");
    expect(detectLang(["en-CA"])).toBe("en-US");
    expect(detectLang(["zh-TW"])).toBe("zh-CN");
    expect(detectLang(["de-AT"])).toBe("de");
    expect(detectLang(["ko", "fr-CA"])).toBe("fr");
    expect(detectLang(["ko"])).toBe("en-US");
    expect(parseAcceptLanguage("en;q=0.5,pt-PT,pt;q=0.9")).toEqual(["pt-PT", "pt", "en"]);
  });

  it("fallback e textos pedidos", () => {
    expect(translator("pt-BR")("androidDownload")).toBe("Baixe o app para Android");
    expect(translator("pt-PT")("convert")).toBe("Converter"); // herdado do pt-BR
    expect(translator("en-GB")("convert")).toBe("Convert"); // igual ao en-US
    expect(translator("de")("openApp", { app: "Waze" })).toBe("In Waze öffnen");
  });
});

describe("configurações", () => {
  it("padrões, migração do tema antigo e validação", () => {
    expect(DEFAULT_SERVICES).toEqual(["waze", "googlemaps", "applemaps"]);
    expect(normalize(null, "dark")).toEqual({ lang: null, theme: "dark", services: DEFAULT_SERVICES });
    expect(normalize({ lang: "xx", theme: "roxo", services: [] })).toEqual({
      lang: null,
      theme: "system",
      services: DEFAULT_SERVICES,
    });
    // Ordem fixa, independentemente da ordem salva
    expect(normalize({ services: ["osm", "waze", "nada"] }).services).toEqual(["waze", "osm"]);
  });

  it("mínimo de um serviço", () => {
    expect(toggleService(["waze"], "waze")).toBeNull();
    expect(toggleService(["waze"], "here")).toEqual(["waze", "here"]);
    expect(toggleService(["waze", "here"], "waze")).toEqual(["here"]);
  });
});

describe("geocodificação em etapas", () => {
  it("expande abreviações e vai do completo até a rua", () => {
    expect(expandAbbreviations("R. Augusta 10, Av. da Liberdade")).toBe("Rua Augusta 10, Avenida da Liberdade");
    expect(geocodeQueries("Pastelaria X, R. de Belém 84, 1300-085 Lisboa")).toEqual([
      "Pastelaria X, Rua de Belém 84, 1300-085 Lisboa",
      "Rua de Belém 84, 1300-085 Lisboa",
      "Rua de Belém 84",
    ]);
    // Nunca reduz a só código postal ou cidade
    expect(geocodeQueries("Torre de Belém, Lisboa")).toEqual(["Torre de Belém, Lisboa"]);
  });
});
