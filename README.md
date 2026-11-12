# Conversor de Coordenadas

Converte coordenadas entre **Graus Decimais (DD)** e **Graus, Minutos e Segundos (DMS)** e gera links prontos para **Waze**, **Google Maps** e **Apple Maps**. Também lê links desses apps, inclusive links curtos.

## O que aceita

| Entrada | Exemplo |
| --- | --- |
| Decimal | `38.5349409, -9.006521` · `38.5349 -9.0065` · `38,5349; -9,0065` |
| Decimal com hemisfério | `38.5349 N, 9.0065 W` · `38.53°N 9.00°O` |
| DMS | `38°32'05.8"N 9°00'23.5"W` · `38° 32′ 5.8″ N, 9° 0′ 23.5″ W` |
| DDM | `38°32.097'N 9°0.391'W` |
| Google Maps | `?q=` · `@lat,lng` · `!3d…!4d…` · `/place/` · `/search/` · `/dir/` · `maps.app.goo.gl/…` |
| Waze | `waze.com/ul?ll=` · `live-map/directions?to=ll.` · `waze.com/ul/h<geohash>` · `waze://` |
| Apple Maps | `?ll=` · `?q=` · `?daddr=` · `/place?coordinate=` · `maps.apple/p/…` · `maps://` |
| Outros | `geo:` · OpenStreetMap · Bing Maps |

Hemisférios em inglês ou português: `N`, `S`, `E`/`L`, `W`/`O`.

## Colar na URL do site

Qualquer coordenada ou link de mapa pode ser colado **depois do domínio**, e o site redireciona para a forma limpa `/?c=lat,lng`:

```
https://coordenadas.arqueirover.de/https://maps.google.com/maps?q=38.5349409%2C-9.006521&z=17
https://coordenadas.arqueirover.de/https://maps.app.goo.gl/B6kwLzPfcJHKHPeh6
https://coordenadas.arqueirover.de/https://waze.com/ul?ll=38.5349,-9.0065
https://coordenadas.arqueirover.de/38.5349,-9.0065
```

Links curtos e links de lugares sem coordenadas (ex.: `/maps/place/Torre+de+Belém`) são resolvidos no servidor: primeiro seguindo os redirecionamentos e, se necessário, geocodificando o nome do lugar.

## Estrutura

```
src/
  proxy.ts                 # Redireciona /<coordenada ou URL> → /?c=lat,lng
  app/
    page.tsx               # Página (Server Component) — lê ?c= e renderiza já pronta
    layout.tsx             # Layout, fontes e metadados (pt-BR, Open Graph)
    api/resolve/route.ts   # GET /api/resolve?u=… para links digitados no campo
  components/
    converter.tsx          # Formulário e estado da tela
    results.tsx            # Cards de conversão e botões dos apps
    qr-dialog.tsx          # QR Code (carregado sob demanda) com download
    map-background.tsx     # Fundo de mapa em SVG local com parallax leve
  lib/
    coordinates.ts         # Parsing e formatação (DD, DMS, DDM)
    map-urls.ts            # Leitura de URLs de mapas e geração de links
    resolve.ts             # Resolução no servidor (com proteção contra SSRF)
```

## Variáveis de ambiente (opcionais)

| Variável | Uso |
| --- | --- |
| `GOOGLE_MAPS_API_KEY` | Geocodifica nomes de lugares com a API do Google (mais precisa). Sem ela, usa o Nominatim (OpenStreetMap). |
| `NOMINATIM_USER_AGENT` | Identificação enviada ao Nominatim, conforme a política de uso dele. |
| `NEXT_PUBLIC_SITE_URL` | URL pública usada nos metadados (padrão: `https://coordenadas.arqueirover.de`). |

## Scripts

```bash
npm run dev        # desenvolvimento
npm run build      # build de produção
npm test           # testes (Vitest)
npm run lint       # ESLint
npm run typecheck  # TypeScript
```
