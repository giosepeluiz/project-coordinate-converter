import { describe, expect, it } from "vitest";
import { formatDms, parseCoordinates, toParam } from "./coordinates";

const close = (input: string, lat: number, lng: number) => {
  const c = parseCoordinates(input);
  expect(c, input).not.toBeNull();
  expect(c!.lat).toBeCloseTo(lat, 4);
  expect(c!.lng).toBeCloseTo(lng, 4);
};

describe("parseCoordinates", () => {
  it("decimal com vírgula, espaço, ponto e vírgula e sinal +", () => {
    close("38.5349409, -9.006521", 38.5349409, -9.006521);
    close("38.5349409,-9.006521", 38.5349409, -9.006521);
    close("38.5349 -9.0065", 38.5349, -9.0065);
    close("+38.5;-9.0", 38.5, -9);
    close("(38.5, -9.0)", 38.5, -9);
  });

  it("decimal com vírgula como separador decimal", () => {
    close("38,5349 -9,0065", 38.5349, -9.0065);
    close("38,5349; -9,0065", 38.5349, -9.0065);
  });

  it("decimal com hemisférios (inglês e português)", () => {
    close("38.5349 N, 9.0065 W", 38.5349, -9.0065);
    close("N38.5349 W9.0065", 38.5349, -9.0065);
    close("38.53°N 9.00°O", 38.53, -9);
    close("23.5 S, 46.6 O", -23.5, -46.6);
    close("9.0065 W, 38.5349 N", 38.5349, -9.0065);
  });

  it("DMS com símbolos ASCII e Unicode", () => {
    close(`38°32'05.8"N 9°00'23.5"W`, 38.534944, -9.006528);
    close("38° 32′ 5.8″ N, 9° 0′ 23.5″ W", 38.534944, -9.006528);
    close(`40°42'46.08"N, 74°0'21.6"W`, 40.7128, -74.006);
    close(`23º32'51"S 46º38'10"O`, -23.5475, -46.636111);
  });

  it("DDM (graus e minutos decimais)", () => {
    close("38°32.097'N 9°0.391'W", 38.53495, -9.006517);
  });

  it("rejeita valores inválidos", () => {
    expect(parseCoordinates("200,300")).toBeNull();
    expect(parseCoordinates("91, 10")).toBeNull();
    expect(parseCoordinates(`38°61'00"N 9°00'00"W`)).toBeNull();
    expect(parseCoordinates("olá mundo")).toBeNull();
    expect(parseCoordinates("38.5")).toBeNull();
    expect(parseCoordinates("38.5 N, 9.0 S")).toBeNull();
    expect(parseCoordinates("")).toBeNull();
  });
});

describe("formatação", () => {
  it("nunca gera 60 segundos", () => {
    expect(formatDms({ lat: 40.99999999, lng: -8.99999999 })).toBe(`41°00'00.0"N 9°00'00.0"W`);
  });

  it("DMS no formato do Google Maps", () => {
    expect(formatDms({ lat: 38.5349409, lng: -9.006521 })).toBe(`38°32'05.8"N 9°00'23.5"W`);
  });

  it("parâmetro canônico com até 6 casas", () => {
    expect(toParam({ lat: 38.5349409, lng: -9.006521 })).toBe("38.534941,-9.006521");
  });

  it("ida e volta DMS → decimal", () => {
    const c = parseCoordinates(formatDms({ lat: -23.5505, lng: -46.6333 }))!;
    expect(c.lat).toBeCloseTo(-23.5505, 3);
    expect(c.lng).toBeCloseTo(-46.6333, 3);
  });
});
