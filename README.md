<div align="center">

<img src="docs/icon.svg" width="128" alt="Ícone do Conversor de Coordenadas">

# Conversor de Coordenadas

### Cole uma coordenada ou um link de mapa e abra no Waze, Google Maps ou Apple Maps em um toque.

[![Versão](https://img.shields.io/badge/versão-3.1.0-10b981?style=for-the-badge)](https://coordenadas.arqueirover.de)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**[🌐 Abrir o site](https://coordenadas.arqueirover.de)** · **[📱 App Android](#-app-android)** · **[📖 Como usar](#-como-funciona-passo-a-passo)** · **[🕰️ Versões](#️-histórico-de-versões)** · **[🤝 Contribuir](#-código-aberto-contribua)**

<img src="docs/screenshots/02-resultado.png" width="860" alt="Resultado de uma conversão no Conversor de Coordenadas">

</div>

> 🇬🇧 **English summary:** *Conversor de Coordenadas* is a free web app that converts geographic coordinates between decimal degrees (DD) and degrees-minutes-seconds (DMS), and opens the location in Waze, Google Maps or Apple Maps with one tap. Paste plain coordinates or any Google Maps, Waze or Apple Maps link (short links included), either in the input or right after the site's address. On phones, the buttons open the navigation apps directly. Light, dark or system theme. No sign-up, no tracking. An Android app (APK) with the same features is available in the [Releases](https://github.com/giosepeluiz/project-coordinate-converter/releases/latest) page.

---

## 👋 Olá!

Sabe quando alguém te manda uma localização e você quer abrir no **seu** app de navegação, mas o link é do Google Maps e você usa o Waze? Ou quando recebe uma coordenada em graus, minutos e segundos e precisa dela em decimal (ou o contrário)? O **Conversor de Coordenadas** nasceu exatamente disso.

Ele é, de propósito, **simples e direto**: você cola o que recebeu (uma coordenada, um link completo ou até um link curto do tipo `maps.app.goo.gl`) e ele mostra a coordenada nos dois formatos, com botões para abrir no **Waze**, no **Google Maps** ou no **Apple Maps**.

No celular, a tela fica bem enxuta: é só tocar no app de destino, e ele abre direto no aplicativo instalado. E tem um truque: dá para colar o link do mapa **depois do endereço do site**, e ele já te devolve a localização limpa.

## ✨ O que ele faz

| | |
|---|---|
| 🔄 **Decimal ↔ DMS** | Mostra sempre os dois formatos: `38.691586, -9.215929` e `38°41'29.7"N 9°12'57.3"W` |
| 🔗 **Lê links de mapas** | Google Maps, Waze, Apple Maps, TomTom, HERE WeGo, Yandex Maps, OpenStreetMap, Bing Maps, Organic Maps, `geo:` e o próprio link do site |
| 💬 **Texto de compartilhamento** | Cole a mensagem inteira ("Nome do lugar https://maps.app.goo.gl/…"): o link de dentro é encontrado |
| ✂️ **Links curtos também** | `maps.app.goo.gl`, `goo.gl/maps`, `waze.com/ul/h…` e `maps.apple/p/…` |
| 📍 **Lugares por nome** | Um link só com o nome do lugar (ex.: *Torre de Belém*) também vira coordenada |
| 🌐 **Cole na URL do site** | `coordenadas.arqueirover.de/` + o link do mapa → localização limpa |
| 📱 **Abre direto no app** | No celular, os botões chamam o app instalado (Waze, Google Maps, Apple Maps, TomTom, HERE, Yandex, Organic Maps) |
| 🧭 **Escolha os seus serviços** | Waze, Google Maps e Apple Maps vêm ativos; TomTom, HERE WeGo, Yandex Maps, OpenStreetMap, Bing Maps e Organic Maps são opcionais. O mínimo é um |
| 🌍 **15 idiomas** | Começa no idioma do navegador: português (BR e PT), inglês (US e UK), espanhol, alemão, francês, italiano, holandês, polonês, russo, turco, ucraniano, japonês e chinês |
| 📋 **Copiar com um toque** | A coordenada (em qualquer formato) ou o link de cada app |
| 🔳 **QR Code** | Gera um QR com o link da localização, com botão para baixar a imagem |
| ↗️ **Compartilhar** | Usa a janela de compartilhamento do aparelho (WhatsApp, e-mail…) ou copia o link |
| ⚙️ **Configurações** | Tema (sistema, claro ou escuro), idioma e serviços, guardados no navegador sem prazo de expiração |
| ⚡ **Rápido e leve** | A página já chega pronta do servidor e o fundo de mapa tem só 5 KB |
| ♿ **Acessível** | Funciona por teclado, com leitor de tela e respeita "reduzir movimento" |
| 🔒 **Privado** | Sem cadastro, sem login e sem guardar nada seu |

## 🌐 Use agora

É só acessar **[coordenadas.arqueirover.de](https://coordenadas.arqueirover.de)**. Funciona no computador e no celular, em qualquer navegador moderno, sem instalar nada.

> 💡 **Dica:** no celular, use **Compartilhar → Adicionar à tela de início** para ter um atalho direto para o conversor.

## 📱 App Android

Além do site, existe um **app para Android** com tudo o que o site faz, mais o que só faz sentido no celular. Ele não está na Play Store: o instalador (`.apk`) fica na página de **[Releases](https://github.com/giosepeluiz/project-coordinate-converter/releases/latest)**.

**[⬇️ Baixar a última versão](https://github.com/giosepeluiz/project-coordinate-converter/releases/latest)**

| | |
|---|---|
| 📤 **Recebe localizações de outros apps** | Em qualquer app de mapas, toque em **Compartilhar** e escolha o Conversor: a conversão aparece na hora |
| 🔗 **Abre links do site** | Links para `coordenadas.arqueirover.de` (no navegador, em planilhas, PDF…) podem abrir direto no app |
| 🧭 **Escolha os seus serviços** | Waze, Google Maps e TomTom vêm ativos; HERE WeGo, Yandex Maps, OpenStreetMap, Bing Maps e Organic Maps são opcionais. O mínimo é um serviço |
| ⚡ **Serviço padrão** | Ao receber uma localização, o app pode abrir direto no serviço que você escolheu, sem perguntar |
| 🌍 **15 idiomas** | Começa no idioma do telefone: português (BR e PT), inglês (US e UK), espanhol, alemão, francês, italiano, holandês, polonês, russo, turco, ucraniano, japonês e chinês |
| ⚙️ **Configurações** | Tema (sistema, claro ou escuro), idioma, serviços, serviço padrão e atalho para *Abrir por padrão* |
| 👋 **Primeira abertura guiada** | Na primeira vez, o app pergunta idioma, tema e serviços |
| 🔎 **Lê mais links** | Entende links do Google Maps (inclusive curtos), Waze, Apple Maps, OpenStreetMap, Bing, HERE, Yandex, Organic Maps, TomTom, `geo:` e o próprio link do site |
| 🔒 **Privado** | Sem cadastro e sem rastreamento. Só as suas preferências ficam no aparelho |

### Como instalar

1. No celular, abra o **[site](https://coordenadas.arqueirover.de)** e toque em **Baixar o app para Android**, logo abaixo do campo (o download do `.apk` começa na hora). Também dá para baixar pela página de **[Releases](https://github.com/giosepeluiz/project-coordinate-converter/releases/latest)**: é o arquivo `Conversor-de-Coordenadas-….apk`.
2. Abra o arquivo. Se o Android pedir, permita a instalação por esse navegador ou gerenciador de arquivos (*Instalar apps desconhecidos*).
3. Abra o app e faça a primeira configuração.

Requer **Android 10** ou mais novo. Para atualizar, basta instalar o novo `.apk` por cima: as configurações são mantidas.

### Abrir links do Google Maps e do Waze com o Conversor

O Android só deixa um app abrir links de um site automaticamente se o site o autorizar. Para o link do **próprio conversor** isso já funciona. Para os links do Google Maps e do Waze, a liberação é manual, em **Configurações do Android → Apps → Conversor de Coordenadas → Abrir por padrão**. Se os apps oficiais já estiverem como padrão desses links, o Android continua abrindo neles. O caminho que sempre funciona é **Compartilhar → Conversor de Coordenadas**.

> ℹ️ O Apple Maps não tem botão no app Android (ele não existe nesse sistema), mas os links dele continuam sendo lidos.
> ⚠️ Links curtos do Google Maps que só trazem o nome do lugar dependem de acesso à internet e, às vezes, a coordenada encontrada é aproximada.

## 📖 Como funciona, passo a passo

### 1. Colar a coordenada ou o link

<img src="docs/screenshots/01-inicio.png" width="760" alt="Tela inicial do Conversor de Coordenadas">

1. Cole no campo o que você recebeu: uma coordenada ou um link de mapa.
2. Clique em **Converter** (ou aperte **Enter**).
3. Pronto: aparece a coordenada nos dois formatos e os botões dos apps. A URL do navegador vira algo como `/?c=38.691586,-9.215929`, que você pode guardar ou mandar para alguém.

O **×** dentro do campo limpa tudo para uma nova conversão.

#### Formatos de coordenada aceitos

| Formato | Exemplos |
|---|---|
| **Decimal** | `38.5349409, -9.006521` · `38.5349 -9.0065` · `+38.5;-9.0` |
| **Decimal com vírgula** | `38,5349 -9,0065` · `38,5349; -9,0065` |
| **Decimal com hemisfério** | `38.5349 N, 9.0065 W` · `N38.5349 W9.0065` · `38.53°N 9.00°O` |
| **DMS** (graus, minutos e segundos) | `38°32'05.8"N 9°00'23.5"W` · `38° 32′ 5.8″ N, 9° 0′ 23.5″ W` |
| **DDM** (graus e minutos decimais) | `38°32.097'N 9°0.391'W` |

Os hemisférios podem vir em inglês ou português: **N**, **S**, **E**/**L** (leste) e **W**/**O** (oeste). Também valem os símbolos `º`, `′`, `″`, `’` e `”`, que costumam aparecer quando se copia de sites e PDFs.

#### Links aceitos

| Serviço | Exemplos de links |
|---|---|
| **Google Maps** | `?q=` · `@lat,lng` · `/place/` · `/search/` · `/dir/` · `?api=1&query=` · `maps.app.goo.gl/…` · domínios regionais (`google.com.br`, `google.pt`…) |
| **Waze** | `waze.com/ul?ll=` · `live-map/directions?to=ll.` · `waze.com/ul/h…` (link curto) · `waze://` |
| **Apple Maps** | `?ll=` · `?q=` · `?daddr=` · `/place?coordinate=` · `maps.apple/p/…` · `maps://` |
| **TomTom** | `tomtomgo://x-callback-url/navigate?destination=` · `tomtomhome:geo:action=show&lat=…&long=…` |
| **HERE WeGo** | `share.here.com/l/LAT,LNG` · `share.here.com/r/…` (rota: primeiro ponto) · `wego.here.com/?map=LAT,LNG,…` |
| **Yandex Maps** | `yandex.com/maps/?pt=LNG,LAT` (atenção: longitude primeiro) · `maps.yandex.*` · `?rtext=` (rota) · `yandexmaps://` |
| **Organic Maps** | `omaps.app/LAT,LNG[/nome]` (os códigos curtos `omaps.app/XXXX` e `ge0.me` não são decodificados) |
| **Outros** | `geo:38.5,-9.0` · `geo:0,0?q=Nome do lugar` (busca por nome) · OpenStreetMap (`#map=`, `mlat`/`mlon`) · Bing Maps (`cp=`, `sp=point.`) |
| **O próprio site** | `coordenadas.arqueirover.de/?c=…` · `/LAT,LNG` · `/c/…` · `/coord/…` · `/https://maps…` (com ou sem `www`, `http` ou `https`) |

> 💡 Quando o link do Google Maps tem o marcador do lugar (`!3d…!4d…`), é ele que vale, e não o centro do mapa. Assim a coordenada é a do lugar, e não a de onde a tela estava enquadrada.

### 2. Colar o link na URL do site

Esse é o atalho preferido: pegue o link do mapa e cole **depois do endereço do site**. O conversor entende e redireciona para a localização limpa.

```
https://coordenadas.arqueirover.de/https://maps.google.com/maps?q=38.5349409%2C-9.006521&z=17
https://coordenadas.arqueirover.de/https://maps.app.goo.gl/B6kwLzPfcJHKHPeh6
https://coordenadas.arqueirover.de/https://waze.com/ul?ll=38.5349,-9.0065&navigate=yes
https://coordenadas.arqueirover.de/https://maps.apple.com/?ll=38.5349,-9.0065
https://coordenadas.arqueirover.de/38.5349,-9.0065
```

Todos viram `https://coordenadas.arqueirover.de/?c=lat,lng`. Vale para qualquer link da tabela acima, e o endereço antigo `/c/<coordenada>` continua funcionando.

### 3. Abrir no app de navegação

<p>
<img src="docs/screenshots/03-mobile.png" width="300" alt="Versão para celular, tema claro">
<img src="docs/screenshots/05-mobile-escuro.png" width="300" alt="Versão para celular, tema escuro">
</p>

No celular, a tela mostra só o essencial: a coordenada no topo (toque para copiar, ou no ✏️ para editar) e um botão grande para cada app ativo nas configurações.

| Botão | Android | iPhone / iPad | Computador |
|---|---|---|---|
| **Abrir Waze** | Abre o app do Waze | Abre o app do Waze | Abre o Waze no navegador |
| **Abrir Google Maps** | Abre o app do Google Maps | Abre o app do Google Maps | Abre o Google Maps no navegador |
| **Abrir Apple Maps** | Abre o Apple Maps na web | Abre o app Mapas | Abre o Apple Maps na web |
| **Abrir TomTom** | Abre o app do TomTom | Abre o app do TomTom | Abre o TomTom na web |
| **Abrir HERE WeGo** | Abre o app do HERE | Abre o HERE na web | Abre o HERE na web |
| **Abrir Yandex Maps** | Abre o app do Yandex | Abre o app do Yandex | Abre o Yandex na web |
| **Abrir Organic Maps** | Abre o app do Organic Maps | Abre o Organic Maps na web | Abre o Organic Maps na web |
| **OpenStreetMap / Bing** | Abre na web | Abre na web | Abre na web |

Se o app não estiver instalado, o botão abre a versão web automaticamente. O botão ❐ ao lado copia o link daquele app.

> ℹ️ No iPhone, quando o app não está instalado, o Safari pode mostrar por um instante o aviso de "endereço inválido" antes de abrir a versão web. É assim que o iOS funciona e não dá para evitar.

### 4. Copiar, QR Code e compartilhar

| Botão | O que faz |
|---|---|
| ❐ **Copiar** | Copia a coordenada em decimal (no computador, cada formato tem o seu botão) |
| 🔳 **QR Code** | Mostra um QR com o link da localização. Quem escanear cai na página com os botões dos apps de mapa. Tem botão para **baixar a imagem** |
| ↗️ **Compartilhar** | Abre a janela de compartilhamento do aparelho; se o navegador não tiver essa opção, copia o link |
| ↺ **Nova conversão** | Limpa tudo e volta para o campo |

### 5. Configurações

<img src="docs/screenshots/04-escuro.png" width="760" alt="Tema escuro">

A engrenagem ⚙️ no canto do rodapé abre a página de **Configurações** (`/config`):

| Opção | O que faz |
|---|---|
| 🌗 **Tema** | 🖥️ **Sistema** (segue o celular ou computador), ☀️ **Claro** ou 🌙 **Escuro**. Muda na hora |
| 🌍 **Idioma** | **Automático** (idioma do navegador) ou um dos 15 idiomas. Muda na hora |
| 🧭 **Serviços** | Liga e desliga cada app que aparece no resultado, sempre na mesma ordem. Pelo menos um fica ativo: se tentar desligar o último, o site avisa |
| ℹ️ **Sobre** | Versão, botão **Restaurar padrões** e o download do app Android |

Tudo fica guardado no **seu navegador** (`localStorage`, chave `cfg`) **por tempo indeterminado**, até você limpar os dados do site, e vale também para as outras abas abertas. Diferente do app Android, o site não tem "serviço padrão" de redirecionamento.

#### Como o idioma inicial é escolhido

Pelas mesmas regras do app Android, a partir do idioma do navegador:

- `pt-PT` → português (Portugal); qualquer outro `pt` → português (Brasil)
- `en-GB`, `AU`, `NZ`, `IE`, `ZA`, `IN` → inglês (UK); outros `en` → inglês (US)
- `zh` (qualquer) → chinês (simplificado)
- idioma suportado → ele mesmo; não suportado → inglês (US)

O servidor já entrega a página no idioma do navegador, então ela não "pisca" em outra língua ao abrir.

### ⌨️ Atalhos e acessibilidade

| Tecla | Ação |
|---|---|
| `Enter` | Converter |
| `Esc` | Fechar o QR Code |
| `Tab` | Navegar por todos os botões |

- Todos os botões têm nome para leitores de tela, e os avisos ("Copiado!", erros) são anunciados.
- Quem ativa **reduzir movimento** no sistema não vê as animações nem o efeito de profundidade do fundo.

## 🔒 Privacidade

- **Sem cadastro, sem login e sem cookies de rastreamento.**
- A única coisa guardada são as **configurações** (tema, idioma e serviços), e elas ficam no **seu** navegador (`localStorage`), não num servidor. No app Android, ficam no aparelho apenas as preferências (tema, idioma, serviços).
- Coordenadas digitadas são convertidas **no próprio navegador**. Só links curtos ou links sem coordenada passam pelo servidor, e só para descobrir a localização.
- Quando o link traz só o nome do lugar, esse nome é consultado no serviço de geocodificação (Nominatim ou Google), sem nenhum dado seu junto.
- Nada do que você cola é salvo.

## ⚙️ Como funciona por dentro

```
Você cola                            O conversor faz
──────────────────────────────────   ─────────────────────────────────────────────
38.5349, -9.0065                  →  converte na hora, no navegador
link com coordenada               →  extrai a coordenada da própria URL, no navegador
link curto (maps.app.goo.gl…)     →  o servidor segue os redirecionamentos até achar a coordenada
link só com o nome do lugar       →  o servidor busca o endereço pelo nome, em até 5 tentativas
mensagem com um link dentro       →  encontra o link na mensagem e segue a partir dele
/<link> depois do domínio         →  o proxy resolve e redireciona (307) para /?c=lat,lng
```

**Segurança:** o servidor só acessa endereços de serviços de mapas conhecidos (Google, Waze e Apple), confere **cada** redirecionamento, tem tempo limite e limite de tamanho. Ele não aceita ser usado como "ponte" para acessar outros sites.

**Geocodificação:** por padrão usa o **Nominatim** (OpenStreetMap), que é gratuito. Ele tenta até **5 consultas**, do endereço completo até só a rua, expandindo abreviações (R. → Rua, Av. → Avenida, Tv. → Travessa, Lg. → Largo, Pç. → Praça, Est. → Estrada, Cç. → Calçada), respeitando o limite de 1 consulta por segundo e **nunca** reduzindo a busca a só código postal ou cidade. Se você configurar uma chave da **API do Google**, ela é usada primeiro.

> ⚠️ O site **não** lê o `center=` nem o `[[[alt,lng,lat]` do HTML do Google Maps. Em testes, páginas de lugares diferentes devolveram o **mesmo** valor nesses campos: a posição estimada pelo IP de quem fez o pedido, e não a do lugar. Só o marcador `!3d…!4d…` é usado.

## 🕰️ Histórico de versões

### 🤖 App Android: de 1.0 a 1.2.1
**Novembro de 2026**

- **1.0:** primeira versão do app. Tudo o que o site faz, mais receber localização por **Compartilhar** (Google Maps, Waze, Apple Maps) e oferecer-se para abrir links de `coordenadas.arqueirover.de`.
- **1.1:** o **TomTom** entrou no lugar do Apple Maps (que não existe no Android) e a tela inicial ganhou título, explicação resumida e formulário centralizado.
- **1.2:** página de **Configurações** (tema, idioma, serviços), **15 idiomas** a partir do idioma do telefone, escolha dos **serviços** exibidos (mínimo 1) com cinco opcionais, **serviço padrão** que abre direto, **primeira abertura guiada**, leitura de links de HERE, Yandex, Organic Maps, TomTom e do próprio site, visual azul de mapa e novo ícone.
- **1.2.1:** links curtos do Google Maps passam a ser resolvidos com mais chance de acerto (cookie de consentimento, mais pontos de leitura e busca por endereço como reserva) e as telas ficam **centralizadas na vertical**.

### ⚙️ Versão 3.1: "Do seu jeito, na sua língua"
**Novembro de 2026**

- Página de **Configurações** (engrenagem no rodapé) com **tema**, **idioma** e **serviços**, guardados no navegador sem prazo de expiração.
- **15 idiomas**, começando no idioma do navegador (mesmas regras do app Android).
- **Escolha dos serviços** no resultado (mínimo um): Waze, Google Maps e Apple Maps ativos; **TomTom**, **HERE WeGo**, **Yandex Maps**, **OpenStreetMap**, **Bing Maps** e **Organic Maps** opcionais, todos abrindo direto o app no celular quando existe um.
- Lê links de **HERE**, **Yandex** (com longitude primeiro), **Organic Maps**, **TomTom**, `ul.waze.com`, `geo:0,0?q=Nome`, **o próprio site** e **mensagens de compartilhamento** com o link dentro.
- Busca de endereço em **várias tentativas** para links curtos do Google sem coordenada.
- Botão **Baixe o app para Android** também na página do resultado.

### 🚀 Versão 3.0: "Cara nova e entende qualquer link"
**Novembro de 2026**

A maior atualização até agora: o projeto foi reescrito por dentro e por fora.

- **Entende muito mais:** DMS com símbolos ′ ″ º, graus e minutos decimais (DDM), vírgula decimal, hemisférios em português (L, O) e coordenadas separadas por espaço.
- **Links do Waze e do Apple Maps**, além do Google Maps, no campo **e** colados depois do domínio.
- **Links curtos** (`maps.app.goo.gl`, `waze.com/ul/h…`) e **lugares por nome** resolvidos no servidor.
- O caso `/https://maps.google.com/maps?q=…` voltou a funcionar: agora é tratado no servidor, com redirecionamento de verdade.
- **Botões abrem direto o app** no celular (Android e iPhone), com a versão web de reserva.
- **Tema claro, escuro ou do sistema**, guardado no navegador.
- **Mais leve:** o fundo animado com o Google Maps deu lugar a um mapa ilustrado de 5 KB, e a página já chega pronta do servidor.
- **QR Code** com o link do site (abre em qualquer celular) e botão para baixar.
- Tela do celular mais enxuta, com botão para **editar** a coordenada sem apagar tudo.
- **Acessibilidade:** rótulos, teclado, avisos para leitor de tela e respeito a "reduzir movimento".
- **Segurança:** a busca de links no servidor ficou restrita aos serviços de mapas.
- Testes automáticos para toda a leitura de coordenadas e links.

### 📱 Versão 2.x: "QR Code e celular"
**Fevereiro a junho de 2026**

- Leitura de **links do Google Maps**, inclusive links curtos.
- **QR Code** da localização e botão para **limpar** o campo.
- **Compartilhar** pela janela do celular.
- Versão para celular revisada, com botões grandes para cada app.
- Aviso "Copiado!" no lugar das janelas de alerta.
- Melhorias na tela inicial.

### 🌱 Versão 1.0: "O começo de tudo"
**Junho de 2025**

- Conversão entre **decimal** e **DMS**.
- Links prontos para **Waze**, **Google Maps** e **Apple Maps**.
- Reconhecimento de coordenadas sem vírgula.

## 🛠️ Para desenvolvedores

O projeto usa **Next.js 16** (App Router), **React 19**, **TypeScript** e **Tailwind CSS 4**. Precisa do **Node.js 20.9** ou mais recente.

```bash
git clone https://github.com/giosepeluiz/project-coordinate-converter.git
cd project-coordinate-converter
npm install
npm run dev          # abre em http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Roda o build de produção |
| `npm test` | Testes automáticos (Vitest) |
| `npm run lint` | Verificação de código (ESLint) |
| `npm run typecheck` | Verificação de tipos (TypeScript) |

### 🔑 Variáveis de ambiente (opcionais)

| Variável | Para que serve |
|---|---|
| `GOOGLE_MAPS_API_KEY` | Usa a API de geocodificação do Google para lugares por nome (mais precisa). Sem ela, usa o Nominatim |
| `NOMINATIM_USER_AGENT` | Identificação enviada ao Nominatim, conforme a [política de uso](https://operations.osmfoundation.org/policies/nominatim/) dele |
| `NEXT_PUBLIC_SITE_URL` | Endereço público usado nos metadados (padrão: `https://coordenadas.arqueirover.de`) |

### 📁 Estrutura

| Arquivo | O que tem |
|---|---|
| `src/proxy.ts` | Recebe `/<coordenada ou link>` e redireciona para `/?c=lat,lng` |
| `src/app/page.tsx` | Página principal (renderizada no servidor) e metadados com a coordenada |
| `src/app/layout.tsx` | Layout, fontes, metadados e aplicação do tema antes da página aparecer |
| `src/app/api/resolve/route.ts` | API `GET /api/resolve?u=…` para links digitados no campo |
| `src/components/converter.tsx` | Formulário e estado da tela |
| `src/components/results.tsx` | Cards da coordenada e botões dos apps |
| `src/components/qr-dialog.tsx` | Janela do QR Code (a biblioteca só carrega quando é usada) |
| `src/app/config/page.tsx` · `src/components/settings-view.tsx` | Página de Configurações |
| `src/components/settings-provider.tsx` · `src/lib/settings.ts` | Configurações salvas (`localStorage`), idioma e tema |
| `src/i18n/languages.ts` · `src/i18n/messages.ts` | Os 15 idiomas, a detecção do idioma e as traduções |
| `src/lib/services.ts` | Serviços de mapa: nome, ícone, link web e link do app |
| `src/components/map-background.tsx` | Fundo de mapa com efeito de profundidade leve |
| `src/lib/coordinates.ts` | Leitura e formatação de coordenadas (DD, DMS, DDM) |
| `src/lib/map-urls.ts` | Leitura de links de mapas e geração dos links dos apps |
| `src/lib/deep-links.ts` | Links que abrem direto os apps no Android e no iPhone |
| `src/lib/android-release.ts` | Busca no GitHub a release Android mais recente para o botão de download |
| `src/lib/resolve.ts` · `src/lib/geocode-queries.ts` | Resolução de links no servidor (com as proteções de segurança) e busca de endereço em etapas |
| `src/lib/*.test.ts` | Testes automáticos |

## 🤝 Código aberto: contribua!

Encontrou um bug? Tem um link de mapa que o conversor não entende? Quer melhorar algo? **Toda contribuição é bem-vinda!**

1. Faça um **fork** do projeto.
2. Crie uma branch para a sua alteração: `git checkout -b minha-melhoria`
3. Faça o commit: `git commit -m "Adiciona tal coisa"`
4. Envie para o seu fork: `git push origin minha-melhoria`
5. Abra um **Pull Request** contando o que mudou.

Antes de enviar, rode `npm test` e `npm run lint`. Se for um formato novo de coordenada ou de link, inclua um teste com um exemplo real.

Prefere só avisar? Abra uma **[Issue](https://github.com/giosepeluiz/project-coordinate-converter/issues)**. Se for um link que não funcionou, cole o link nela: isso ajuda muito.

## 👤 Autor

<table>
<tr>
<td>

Criado por **Giosepe Luiz dos Santos**, com a ajuda do **Anthropic Claude Opus 5.5**.

[![Instagram](https://img.shields.io/badge/Instagram-giosepeluiz-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://instagram.com/giosepeluiz)
[![GitHub](https://img.shields.io/badge/GitHub-giosepeluiz-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/giosepeluiz)
[![Facebook](https://img.shields.io/badge/Facebook-giosepeluiz-1877F2?style=flat-square&logo=facebook&logoColor=white)](https://facebook.com/giosepeluiz)
[![E-mail](https://img.shields.io/badge/E--mail-contato%40arqueirover.de-6ccb5f?style=flat-square&logo=maildotru&logoColor=white)](mailto:contato@arqueirover.de)

</td>
</tr>
</table>

## 💬 Para terminar

Se o Conversor de Coordenadas te salvou de copiar coordenada na mão (ou de abrir o app errado), deixe uma ⭐ no repositório: isso ajuda outras pessoas a encontrá-lo. E se fizer algo legal com o código, me conta!

<div align="center">

*Feito com ☕ entre o Brasil e Portugal.*

</div>
