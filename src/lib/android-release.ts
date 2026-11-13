import "server-only";

export type AndroidRelease = {
  version: string;
  /** Link direto do .apk no GitHub (baixa sem passar pela página da release). */
  url: string;
  /** Tamanho em bytes, quando conhecido. */
  size: number | null;
};

const REPO = "giosepeluiz/project-coordinate-converter";

/** Usado se a API do GitHub estiver fora do ar ou no limite de requisições. */
const FALLBACK: AndroidRelease = {
  version: "1.2.1",
  url: `https://github.com/${REPO}/releases/download/android-v1.2.1/Conversor-de-Coordenadas-1.2.1.apk`,
  size: 83389,
};

type GitHubRelease = {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  assets: { name: string; size: number; browser_download_url: string }[];
};

/**
 * Busca a release Android mais recente (tag "android-v…") com um .apk anexado.
 * O resultado fica em cache por 1 hora, então publicar uma release nova
 * atualiza o botão do site sem mexer no código.
 */
export async function getAndroidRelease(): Promise<AndroidRelease> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=20`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "conversor-de-coordenadas" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return FALLBACK;
    const releases = (await res.json()) as GitHubRelease[];
    for (const r of releases) {
      if (r.draft || r.prerelease || !/^android-v/i.test(r.tag_name)) continue;
      const apk = r.assets.find((a) => a.name.toLowerCase().endsWith(".apk"));
      if (apk) {
        return {
          version: r.tag_name.replace(/^android-v/i, ""),
          url: apk.browser_download_url,
          size: apk.size,
        };
      }
    }
  } catch {
    /* usa o fallback */
  }
  return FALLBACK;
}

/** APK não instala no iPhone/iPad: o botão não aparece nesses aparelhos. */
export function isIOS(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /iphone|ipad|ipod/i.test(userAgent);
}
