// src/components/card/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

type CardType = "localization" | "waze" | "googlemaps" | "applemaps";

export type CardProps = {
  type: CardType;
  coordinates: string;
};

type CardContentProps = {
  title: string;
  content: string;
  logo: string | null;
};

// Objeto de configuração para os cards.
// Facilita a manutenção e a adição de novos tipos de mapa.
const cardConfig = {
  // Geração do conteúdo dos cards com base no tipo.
  // Cada tipo de card tem um título e uma função para gerar o conteúdo.
  localization: {
    title: "Coordenadas Convertidas",
    logo: null,
    getContent: (coordinates: string) => coordinates,
  },
  waze: {
    title: "Waze",
    logo: "https://files.brandlogos.net/svg/KWGOdcgoGJ/waze-app-icon-logo-brandlogos.net_izn3bglse.svg",
    getContent: (coordinates: string) =>
      `https://waze.com/ul?ll=${coordinates}&navigate=yes`,
  },
  googlemaps: {
    title: "Google Maps",
    logo: "https://files.brandlogos.net/svg/KWGOdcgoGJ/google-maps-icon-2015-2020-logo-brandlogos.net_bi22csaxl.svg",
    // CORREÇÃO: A URL estava incorreta. A URL correta usa o domínio principal
    // do Google Maps e o parâmetro 'q' para a busca de coordenadas.
    getContent: (coordinates: string) =>
      `https://www.google.com/maps?q=${coordinates}`,
  },
  applemaps: {
    title: "Apple Maps",
    logo: "https://brandlogos.net/wp-content/uploads/2025/07/apple_maps_icon-vector_brandlogos.net_ppkzj-768x768.png",
    // CORREÇÃO: A URL estava incorreta. O parâmetro correto é 'll'.
    getContent: (coordinates: string) =>
      `https://maps.apple.com/place?coordinate=${coordinates}`,
  },
};

function CardContent({ title, content, logo }: CardContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Verifica se a API Clipboard está disponível
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback para navegadores antigos ou contextos sem HTTPS
        const textArea = document.createElement("textarea");
        textArea.value = content;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Fallback: Erro ao copiar", err);
        }

        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <div className="flex flex-col items-center mt-5 justify-center w-full max-w-3xl p-6 bg-white rounded-lg shadow-md">
      {!logo && <span className="text-sky-700 font-bold mb-3">{title}:</span>}
      <div className="flex items-center gap-2 w-full">
        {logo && (
          <Image
            src={logo}
            alt={title}
            width={40}
            height={40}
            className="flex-shrink-0"
          />
        )}
        <code
          onClick={handleCopy}
          className={`p-3 bg-gray-200 text-gray-600 flex-1 text-center my-1 overflow-x-auto break-all transition-all duration-300 cursor-pointer hover:bg-gray-300 ${
            copied ? "ring-2 ring-green-500 bg-green-50" : ""
          }`}
          title="Clique para copiar">
          {content}
        </code>
        <button
          onClick={handleCopy}
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200 flex-shrink-0"
          title="Copiar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            {copied ? (
              <>
                <polyline points="20 6 9 17 4 12"></polyline>
              </>
            ) : (
              <>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </>
            )}
          </svg>
        </button>
        {title !== "Coordenadas Convertidas" && (
          <a
            href={content}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors duration-200 flex-shrink-0"
            title="Abrir link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

export default function Card({ type, coordinates }: CardProps) {
  const config = cardConfig[type];

  // Se o tipo de card não existir na configuração, não renderiza nada.
  if (!config) {
    return null;
  }

  const content = config.getContent(coordinates);

  return (
    <CardContent title={config.title} content={content} logo={config.logo} />
  );
}
