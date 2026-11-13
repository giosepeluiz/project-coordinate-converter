import "server-only";
import { headers } from "next/headers";
import { detectLang, parseAcceptLanguage, type Lang } from "./languages";

/** Idioma do pedido (Accept-Language), com as mesmas regras do app Android. */
export async function getServerLang(): Promise<Lang> {
  return detectLang(parseAcceptLanguage((await headers()).get("accept-language")));
}
