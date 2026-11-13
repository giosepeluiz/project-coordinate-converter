import { describe, expect, it } from "vitest";
import { appDeepLink, detectPlatform, needsFallback } from "./deep-links";

const c = { lat: 38.5349409, lng: -9.006521 };
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
const IPAD = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15";
const DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36";

describe("detectPlatform", () => {
  it("identifica Android, iPhone, iPadOS e desktop", () => {
    expect(detectPlatform(ANDROID)).toBe("android");
    expect(detectPlatform(IPHONE)).toBe("ios");
    expect(detectPlatform(IPAD, 5)).toBe("ios");
    expect(detectPlatform(IPAD, 0)).toBe("other");
    expect(detectPlatform(DESKTOP)).toBe("other");
    expect(detectPlatform(null)).toBe("other");
  });
});

describe("appDeepLink", () => {
  it("Android chama o esquema do app direto quando existe (waze://, yandexmaps://)", () => {
    expect(appDeepLink("waze", c, "android")).toBe("waze://?ll=38.534941,-9.006521&navigate=yes");
    expect(appDeepLink("yandex", c, "android")).toBe(
      "yandexmaps://maps.yandex.ru/?pt=-9.006521,38.534941&z=16&l=map",
    );
  });

  it("Android usa intent: com pacote e fallback web para apps sem esquema próprio", () => {
    expect(appDeepLink("googlemaps", c, "android")).toBe(
      "intent://www.google.com/maps/search/?api=1&query=38.534941,-9.006521#Intent;scheme=https;" +
        "package=com.google.android.apps.maps;" +
        "S.browser_fallback_url=https%3A%2F%2Fwww.google.com%2Fmaps%2Fsearch%2F%3Fapi%3D1%26query%3D38.534941%2C-9.006521;end",
    );
    expect(appDeepLink("tomtom", c, "android")).toContain("scheme=geo;package=com.tomtom.gplay.navapp");
    expect(appDeepLink("applemaps", c, "android")).toBeNull();
  });

  it("iOS usa os esquemas dos apps", () => {
    expect(appDeepLink("waze", c, "ios")).toBe("waze://?ll=38.534941,-9.006521&navigate=yes");
    expect(appDeepLink("googlemaps", c, "ios")).toBe("comgooglemaps://?q=38.534941,-9.006521&center=38.534941,-9.006521");
    expect(appDeepLink("applemaps", c, "ios")).toBe("maps://?ll=38.534941,-9.006521&q=38.534941,-9.006521");
    expect(appDeepLink("osm", c, "ios")).toBeNull();
  });

  it("desktop usa o link web", () => {
    expect(appDeepLink("waze", c, "other")).toBeNull();
  });

  it("fallback por tempo só para esquemas próprios", () => {
    expect(needsFallback("waze", "ios")).toBe(true);
    expect(needsFallback("waze", "android")).toBe(true);
    expect(needsFallback("googlemaps", "android")).toBe(false); // intent: já traz o fallback
    expect(needsFallback("applemaps", "ios")).toBe(false); // Mapas vem instalado
    expect(needsFallback("waze", "other")).toBe(false);
  });
});
