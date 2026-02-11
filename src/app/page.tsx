// src/app/page.tsx
"use client";

import Card from "@/components/card/page";
import { CoordinateProvider } from "@/components/coordinate-provider";
import { useState, useEffect, Suspense } from "react";
import { convertCoordinates } from "./function/localizationConvert";
import {
  extractCoordinatesFromUrl,
  extractCoordinatesFromUrlAsync,
} from "./function/extractCoordinates";
import QRCode from "qrcode";

export default function Home() {
  const [coordinates, setCoordinates] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showCards, setShowCards] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const handleCoordinatesFromUrl = (coords: string) => {
    setInputValue(coords);
    processCoordinates(coords);
  };

  // Efeito parallax avançado do mouse no mapa de background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calcula a posição do mouse em relação ao centro da tela (-100 a 100)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const processCoordinates = async (input: string) => {
    setIsLoading(true);
    setError("");
    setCoordinates("");
    setShowCards(false);

    // Força um delay mínimo de 0.5s para mostrar o skeleton
    const startTime = Date.now();

    try {
      // Tenta extração assíncrona (pode fazer requisição HTTP se necessário)
      const extractedCoords = await extractCoordinatesFromUrlAsync(input);

      if (extractedCoords) {
        // Valida se as coordenadas extraídas são válidas antes de usar
        const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
        const dmsPattern = /\d+°.*[NSEW]/i;

        if (
          coordPattern.test(extractedCoords) ||
          dmsPattern.test(extractedCoords)
        ) {
          setCoordinates(extractedCoords);

          // Atualiza a URL sem recarregar a página (usa formato de path)
          const cleanCoord = extractedCoords.replace(/\s/g, "");
          window.history.replaceState(
            {},
            "",
            `/${encodeURIComponent(cleanCoord)}`,
          );
        } else {
          setError(
            "Formato de coordenadas inválido extraído da URL. Tente inserir as coordenadas manualmente.",
          );
        }
      } else {
        // Se não conseguiu extrair via requisição, usa método síncrono
        const syncCoords = extractCoordinatesFromUrl(input);

        // Valida o resultado
        const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
        const dmsPattern = /\d+°.*[NSEW]/i;

        if (
          syncCoords &&
          (coordPattern.test(syncCoords) || dmsPattern.test(syncCoords))
        ) {
          setCoordinates(syncCoords);

          // Atualiza a URL sem recarregar a página (usa formato de path)
          const cleanCoord = syncCoords.replace(/\s/g, "");
          window.history.replaceState(
            {},
            "",
            `/${encodeURIComponent(cleanCoord)}`,
          );
        } else {
          setError(
            "Não foi possível extrair coordenadas da URL. Tente inserir as coordenadas diretamente.",
          );
        }
      }
    } catch (err) {
      setError(
        "Erro ao processar a URL. Verifique se a URL está correta ou insira as coordenadas diretamente.",
      );
      console.error("Erro:", err);
    } finally {
      // Garante que o loading dura no mínimo 0.5s
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 500 - elapsedTime);

      setTimeout(() => {
        setIsLoading(false);
        setShowCards(true);
      }, remainingTime);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const coordData = formData.get("coord");
    const input = coordData ? coordData.toString().trim() : "";
    setInputValue(input);
    await processCoordinates(input);

    // Atualiza a URL usando a rota /c/coordenada
    if (input && typeof window !== "undefined") {
      window.history.pushState({}, "", `/c/${encodeURIComponent(input)}`);
    }
  };

  const handleShare = async () => {
    if (!coordinates) return;

    // Determina o formato decimal para a URL
    const isDmsFormat = coordinates.includes("°");
    const decimalCoords = isDmsFormat
      ? convertCoordinates(coordinates.replace(" ", ""))
      : coordinates.replace(" ", "");

    // Cria a URL de compartilhamento com ?c=
    const shareUrl = `${window.location.origin}/?c=${encodeURIComponent(decimalCoords)}`;

    // Verifica se a Web Share API está disponível
    // Nota: Precisa ser HTTPS (ou localhost) e não está disponível em todos os navegadores desktop
    if (navigator.share && navigator.canShare) {
      const shareData = {
        title: "Coordenadas",
        text: `Coordenadas: ${coordinates}`,
        url: shareUrl,
      };

      // Verifica se pode compartilhar esses dados
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return; // Compartilhou com sucesso
        } catch (error) {
          // Usuário cancelou ou erro ao compartilhar
          if ((error as Error).name === "AbortError") {
            return; // Usuário cancelou, não faz nada
          }
          console.error("Erro ao compartilhar:", error);
        }
      }
    }

    // Fallback: copia a URL para a área de transferência
    copyToClipboard(shareUrl);
  };

  const handleGenerateQRCode = async () => {
    if (!coordinates) return;

    // Determina o formato decimal para a URL
    const isDmsFormat = coordinates.includes("°");
    const decimalCoords = isDmsFormat
      ? convertCoordinates(coordinates.replace(" ", ""))
      : coordinates.replace(" ", "");

    // Cria a URL de localização que será codificada no QR code
    const locationUrl = `geo:${decimalCoords}`;

    try {
      // Gera o QR code como data URL
      const qrDataUrl = await QRCode.toDataURL(locationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeDataUrl(qrDataUrl);
      setShowQRModal(true);
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
    }
  };

  const handleClearInput = () => {
    setInputValue("");
    setCoordinates("");
    setError("");
    setShowCards(false);
    window.history.replaceState({}, "", "/");
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        alert("Link copiado para a área de transferência!");
      } else {
        // Fallback para navegadores antigos
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Link copiado para a área de transferência!");
      }
    } catch (err) {
      console.error("Erro ao copiar:", err);
      alert("Não foi possível copiar o link.");
    }
  };

  // OTIMIZAÇÃO: A lógica de renderização foi movida para fora do JSX.
  // Isso torna o bloco de retorno (return) mais limpo e focado na estrutura da UI.
  const renderCards = () => {
    if (!coordinates) return null;

    // Determina se o formato original é DMS (contém '°')
    const isDmsFormat = coordinates.includes("°");

    // O card 'localization' sempre mostra o formato convertido.
    const localizationCardCoords = convertCoordinates(coordinates);

    // Os apps de mapa (Waze, Google, Apple) precisam do formato decimal.
    // Se o original for DMS, converte. Se já for decimal, usa como está.
    const mapAppsCoords = isDmsFormat
      ? convertCoordinates(coordinates.replace(" ", ""))
      : coordinates.replace(" ", "");

    const cards = [
      { type: "localization" as const, coords: localizationCardCoords },
      { type: "waze" as const, coords: mapAppsCoords },
      { type: "googlemaps" as const, coords: mapAppsCoords },
      { type: "applemaps" as const, coords: mapAppsCoords },
    ];

    return (
      <>
        {cards.map((card, index) => (
          <div
            key={card.type}
            className={`w-full flex justify-center transition-all duration-500 ${
              showCards
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: showCards ? `${index * 100}ms` : "0ms",
            }}>
            <Card coordinates={card.coords} type={card.type} />
          </div>
        ))}
      </>
    );
  };

  const renderSkeletons = () => {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center mt-5 justify-center w-full max-w-3xl p-6 bg-white rounded-lg shadow-md animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
            <div className="flex items-center gap-2 w-full">
              <div className="h-12 bg-gray-300 rounded flex-1"></div>
              <div className="h-12 w-12 bg-gray-300 rounded"></div>
              <div className="h-12 w-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 md:p-24 overflow-hidden perspective">
      {/* Background animado do Google Maps de Lisboa com parallax 3D */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{ perspective: "1000px" }}>
        <div
          className="absolute inset-0 animate-slow-pan will-change-transform"
          style={{
            transform: `
              translate3d(
                ${-mousePos.x * 100}px, 
                ${-mousePos.y * 100}px, 
                0
              ) 
              rotateX(${mousePos.y * 20}deg) 
              rotateY(${-mousePos.x * 20}deg)
            `,
            transition: "transform 0.08s cubic-bezier(0.23, 1, 0.320, 1)",
            transformStyle: "preserve-3d",
          }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d99365.59224782052!2d-9.229510749999999!3d38.7222524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19331a61e4f33b%3A0x400ebbde49036d0!2sLisboa%2C%20Portugal!5e0!3m2!1spt-BR!2sbr!4v1234567890123!5m2!1spt-BR!2sbr&maptype=satellite"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "100vh", minWidth: "100vw" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="pointer-events-none scale-110 saturate-75"
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-3xl p-6 bg-white rounded-lg shadow-md relative z-10">
        <h1 className="p-7 text-2xl md:text-3xl font-bold text-[#0F9D58] text-center">
          Conversor de Coordenadas
        </h1>

        <form
          className="flex flex-col sm:flex-row w-full justify-between items-center p-4 sm:p-7 gap-4"
          onSubmit={handleSubmit}>
          <label htmlFor="coord" className="font-semibold text-gray-700">
            Coordenadas:
          </label>
          <input
            type="text"
            id="coord"
            name="coord"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            placeholder="Ex: 40.7128,-74.0060 ou URL de mapa"
            className="border border-gray-300 rounded-md w-full sm:w-2/3 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClearInput}
              className="bg-orange-500 rounded-md py-2 px-4 text-white font-semibold hover:bg-orange-600 transition-colors duration-300 flex items-center justify-center"
              title="Limpar campo">
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
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 rounded-md py-2 px-4 text-white font-semibold hover:bg-sky-700 transition-colors duration-300 w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isLoading ? "Processando..." : "Converter"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md w-full max-w-3xl text-center">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-md w-full max-w-3xl text-center">
            Buscando coordenadas da URL...
          </div>
        )}
      </div>

      {/* Provedor de coordenadas via URL */}
      <Suspense fallback={null}>
        <CoordinateProvider onCoordinatesFromUrl={handleCoordinatesFromUrl} />
      </Suspense>

      {/* Skeleton loading ou cards com animação */}
      {isLoading && renderSkeletons()}
      {!isLoading && renderCards()}

      {/* Botões de Gerar QRCode e Compartilhar */}
      {!isLoading && coordinates && (
        <div className="flex justify-center gap-4 w-full max-w-3xl mt-6 px-6">
          <button
            onClick={handleGenerateQRCode}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300">
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
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Gerar QRCode
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300">
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
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Compartilhar
          </button>
        </div>
      )}

      {/* Modal do QRCode */}
      {showQRModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowQRModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              QR Code da Localização
            </h2>
            {qrCodeDataUrl && (
              <div className="flex justify-center mb-6">
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-64 h-64 border-4 border-gray-200 rounded-lg"
                />
              </div>
            )}
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300">
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
