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
  });
});

describe("appDeepLink", () => {
  it("Android usa intent:// com pacote e fallback web", () => {
    expect(appDeepLink("waze", c, "android")).toBe(
      "intent://waze.com/ul?ll=38.534941,-9.006521&navigate=yes#Intent;scheme=https;package=com.waze;" +
        "S.browser_fallback_url=https%3A%2F%2Fwaze.com%2Ful%3Fll%3D38.534941%2C-9.006521%26navigate%3Dyes;end",
    );
    expect(appDeepLink("googlemaps", c, "android")).toContain("package=com.google.android.apps.maps");
    expect(appDeepLink("applemaps", c, "android")).toBeNull();
  });

  it("iOS usa os esquemas dos apps", () => {
    expect(appDeepLink("waze", c, "ios")).toBe("waze://?ll=38.534941,-9.006521&navigate=yes");
    expect(appDeepLink("googlemaps", c, "ios")).toBe("comgooglemaps://?q=38.534941,-9.006521&center=38.534941,-9.006521");
    expect(appDeepLink("applemaps", c, "ios")).toBe("maps://?ll=38.534941,-9.006521&q=38.534941,-9.006521");
  });

  it("desktop usa o link web", () => {
    expect(appDeepLink("waze", c, "other")).toBeNull();
  });

  it("fallback por tempo só no iOS e não para o Apple Maps", () => {
    expect(needsFallback("waze", "ios")).toBe(true);
    expect(needsFallback("applemaps", "ios")).toBe(false);
    expect(needsFallback("waze", "android")).toBe(false);
  });
});
