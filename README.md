# Conversor de Coordenadas

Este projeto é um conversor de coordenadas geográficas entre os formatos Graus Decimais (DD) e Graus, Minutos e Segundos (DMS), além de gerar links para navegação em aplicativos de mapas como Waze, Google Maps e Apple Maps.

## Funcionalidades

- **Conversão automática** entre os formatos DD e DMS.
- **Geração de links** para navegação em Waze, Google Maps e Apple Maps usando as coordenadas fornecidas.
- Interface simples e responsiva, desenvolvida com Next.js e Tailwind CSS.

## Como funciona

1. O usuário insere uma coordenada no formato DD (ex: `40.7128,-74.0060`) ou DMS (ex: `40° 42' 46.08"N, 74° 0' 21.60"W`).
2. O sistema detecta automaticamente o formato e realiza a conversão para o outro formato.
3. São exibidos cards com:
   - A coordenada convertida.
   - Links prontos para abrir a localização nos principais aplicativos de mapas.

## Estrutura do Projeto

```
src/
  app/
    function/
      localizationConvert.ts      # Funções de conversão de coordenadas
    layout.tsx                    # Layout global da aplicação
    page.tsx                      # Página principal e lógica de UI
    globals.css                   # Estilos globais (Tailwind)
  components/
    card/
      page.tsx                    # Componente de exibição dos cards de resultado
```

## Detalhamento dos Arquivos

### src/app/function/localizationConvert.ts

- Implementa as funções:
  - `convertCoordinates`: Detecta o formato e converte entre DD e DMS.
  - Funções auxiliares privadas para conversão:
    - `dmsToDecimal`: DMS → DD
    - `decimalToDms`: DD → DMS

### src/app/page.tsx

- Componente principal da aplicação.
- Gerencia o estado do input do usuário.
- Chama as funções de conversão e renderiza os cards de resultado usando o componente `Card`.

### src/components/card/page.tsx

- Define o componente `Card` e o objeto de configuração dos tipos de card.
- Cada card exibe:
  - O título (tipo de conversão ou app de mapa).
  - O conteúdo (coordenada convertida ou link para o app).

### src/app/layout.tsx

- Define o layout global da aplicação, incluindo fontes e estilos globais.

### src/app/globals.css

- Importa o Tailwind CSS para estilização.

## Como rodar o projeto

1. Instale as dependências:
   ```sh
   npm install
   ```
2. Rode o servidor de desenvolvimento:
   ```sh
   npm run dev
   ```
3. Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Exemplos de uso

- **Entrada DD:**  
  `40.7128,-74.0060`
- **Entrada DMS:**  
  `40° 42' 46.08"N, 74° 0' 21.60"W`

O sistema irá converter e exibir ambos os formatos, além dos links para navegação.

## Licença

Este projeto é livre para uso educacional e pessoal.

---

Desenvolvido por Giosepe Luiz
