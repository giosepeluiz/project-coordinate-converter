import { describe, expect, it } from "vitest";
import { decodeGeohash, extractFromUrl, isMapUrl, parseInput, placeQuery, toUrl } from "./map-urls";

const from = (input: string) => {
  const u = toUrl(input);
  expect(u, input).not.toBeNull();
  return extractFromUrl(u!);
};

const close = (input: string, lat: number, lng: number) => {
  const c = from(input);
  expect(c, input).not.toBeNull();
  expect(c!.lat).toBeCloseTo(lat, 4);
  expect(c!.lng).toBeCloseTo(lng, 4);
};

describe("Google Maps", () => {
  it("?q= codificado (exemplo real)", () => {
    close("https://maps.google.com/maps?q=38.5349409%2C-9.006521&z=17&hl=en", 38.5349409, -9.006521);
  });
  it("barra dupla colapsada por proxy (https:/)", () => {
    close("https:/maps.google.com/maps?q=38.5349409%2C-9.006521", 38.5349409, -9.006521);
  });
  it("destino de link curto expandido (/search/lat,+lng)", () => {
    close("https://www.google.com/maps/search/38.653984,+-9.066794?entry=tts", 38.653984, -9.066794);
  });
  it("prioriza o marcador !3d!4d sobre o @ do enquadramento", () => {
    close(
      "https://www.google.com/maps/place/Torre+de+Bel%C3%A9m/@38.6916,-9.2200,17z/data=!3m1!4b1!4m6!3m5!8m2!3d38.6915837!4d-9.2159718",
      38.6915837,
      -9.2159718,
    );
  });
  it("@lat,lng, api=1, domínios regionais e sem protocolo", () => {
    close("https://www.google.com/maps/@38.7223,-9.1393,15z", 38.7223, -9.1393);
    close("https://www.google.com/maps/search/?api=1&query=38.7,-9.1", 38.7, -9.1);
    close("https://www.google.com.br/maps?q=-23.55,-46.63", -23.55, -46.63);
    close("maps.google.com/?q=38.7,-9.1", 38.7, -9.1);
    close("https://www.google.com/maps/dir/38.7,-9.1/38.8,-9.2", 38.8, -9.2);
  });
  it("lugar por nome → consulta para geocodificar", () => {
    const u = toUrl("https://www.google.com/maps/place/Torre+de+Bel%C3%A9m,+Lisboa")!;
    expect(extractFromUrl(u)).toBeNull();
    expect(placeQuery(u)).toBe("Torre de Belém, Lisboa");
  });
  it("link curto é reconhecido, mas exige resolução no servidor", () => {
    const u = toUrl("https://maps.app.goo.gl/B6kwLzPfcJHKHPeh6")!;
    expect(isMapUrl(u)).toBe(true);
    expect(extractFromUrl(u)).toBeNull();
  });
});

describe("Waze", () => {
  it("ul?ll=, live-map ?to=ll. e esquema waze://", () => {
    close("https://waze.com/ul?ll=38.5349,-9.0065&navigate=yes", 38.5349, -9.0065);
    close("https://www.waze.com/pt-BR/live-map/directions?to=ll.38.5349%2C-9.0065", 38.5349, -9.0065);
    close("https://www.waze.com/live-map/directions?latlng=38.5349%2C-9.0065", 38.5349, -9.0065);
    close("waze://?ll=38.5349,-9.0065&navigate=yes", 38.5349, -9.0065);
  });
  it("link curto com geohash (waze.com/ul/h...)", () => {
    const c = from("https://waze.com/ul/heycs20b2qe")!;
    expect(c.lat).toBeCloseTo(38.72, 1);
    expect(c.lng).toBeCloseTo(-9.14, 1);
  });
});

describe("Apple Maps", () => {
  it("?ll=, /place?coordinate=, ?q= e ?daddr=", () => {
    close("https://maps.apple.com/?ll=38.5349,-9.0065&q=Pin", 38.5349, -9.0065);
    close("https://maps.apple.com/place?coordinate=38.5349,-9.0065&name=Teste", 38.5349, -9.0065);
    close("https://maps.apple.com/?q=38.5349,-9.0065", 38.5349, -9.0065);
    close("https://maps.apple.com/?daddr=38.5349,-9.0065", 38.5349, -9.0065);
    close("maps://?ll=38.5349,-9.0065", 38.5349, -9.0065);
  });
});

describe("outros", () => {
  it("geo:, OpenStreetMap e Bing", () => {
    close("geo:38.5349,-9.0065", 38.5349, -9.0065);
    close("geo:0,0?q=38.5349,-9.0065(Casa)", 38.5349, -9.0065);
    close("https://www.openstreetmap.org/#map=17/38.5349/-9.0065", 38.5349, -9.0065);
    close("https://www.bing.com/maps?cp=38.5349~-9.0065", 38.5349, -9.0065);
  });
  it("parseInput aceita coordenadas e URLs, rejeita o resto", () => {
    expect(parseInput("38.5, -9.0")).toEqual({ lat: 38.5, lng: -9 });
    expect(parseInput("https://waze.com/ul?ll=38.5,-9.0")).toEqual({ lat: 38.5, lng: -9 });
    expect(parseInput("https://exemplo.com/?q=38.5,-9.0")).toBeNull();
    expect(parseInput("qualquer coisa")).toBeNull();
  });
  it("geohash conhecido", () => {
    const c = decodeGeohash("eycs210vwzg")!;
    expect(c.lat).toBeCloseTo(38.7223, 3);
    expect(c.lng).toBeCloseTo(-9.1393, 3);
  });
});
