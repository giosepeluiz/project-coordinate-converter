// src/app/page.tsx
"use client";

import Card from "@/components/card/page";
import { useState } from "react";
import { convertCoordinates } from "./function/localizationConvert";

export default function Home() {
  const [coordinates, setCoordinates] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const coordData = formData.get("coord");

    // OTIMIZAÇÃO: Usa trim() para remover espaços no início/fim,
    // mas preserva os espaços internos necessários para o formato DMS.
    // O .replace(" ", "") anterior era um bug, pois removia apenas o primeiro espaço.
    setCoordinates(coordData ? coordData.toString().trim() : "");
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

    return (
      <>
        <Card coordinates={localizationCardCoords} type="localization" />
        <Card coordinates={mapAppsCoords} type="waze" />
        <Card coordinates={mapAppsCoords} type="googlemaps" />
        <Card coordinates={mapAppsCoords} type="applemaps" />
      </>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl p-6 bg-white rounded-lg shadow-md">
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
            placeholder="Ex: 40.7128,-74.0060 ou 40&#176;42&#39;46.08&#34;N, 74&#176;0&#39;21.60&#34;W"
            className="border border-gray-300 rounded-md w-full sm:w-2/3 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 rounded-md py-2 px-4 text-white font-semibold hover:bg-sky-700 transition-colors duration-300 w-full sm:w-auto">
            Converter
          </button>
        </form>
      </div>

      {/* A chamada da função torna o JSX principal mais limpo */}
      {renderCards()}
    </main>
  );
}
