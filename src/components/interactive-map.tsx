"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

export default function InteractiveMap({ onLocationSelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<
    Array<{ name: string; lat: number; lon: number }>
  >([]);

  useEffect(() => {
    // Se o mapa já existe, não cria um novo
    if (map.current || !mapContainer.current) return;

    try {
      // Cria o mapa com zoom inicial em Lisboa, Portugal
      map.current = L.map(mapContainer.current).setView([38.7223, -9.1393], 12);

      // Adiciona a camada do OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map.current);

      // Event listener para cliques no mapa
      map.current.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        // Remove marker anterior se existir
        if (marker.current) {
          map.current?.removeLayer(marker.current);
        }

        // Adiciona novo marker
        marker.current = L.marker([lat, lng])
          .addTo(map.current!)
          .bindPopup(
            `<b>Coordenadas Selecionadas</b><br/>Latitude: ${lat.toFixed(6)}<br/>Longitude: ${lng.toFixed(6)}`,
          )
          .openPopup();

        // Chama a função callback com as coordenadas
        onLocationSelect(lat, lng);
      });

      setIsMapLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar mapa:", error);
    }

    // Cleanup apenas quando o componente é desmontado
    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          console.error("Erro ao remover mapa:", e);
        }
        map.current = null;
      }
    };
  }, [onLocationSelect]);

  // Função para buscar endereço usando Nominatim (OpenStreetMap)
  const handleSearchAddress = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      );
      const results = await response.json();

      const formattedSuggestions = results.map(
        (result: { display_name: string; lat: string; lon: string }) => ({
          name: result.display_name,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
        }),
      );

      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Função para selecionar um local da lista de sugestões
  const selectLocation = useCallback(
    (lat: number, lon: number, name: string) => {
      // Remove marker anterior se existir
      if (marker.current) {
        map.current?.removeLayer(marker.current);
      }

      // Adiciona novo marker
      marker.current = L.marker([lat, lon])
        .addTo(map.current!)
        .bindPopup(
          `<b>${name}</b><br/>Lat: ${lat.toFixed(6)}<br/>Lon: ${lon.toFixed(6)}`,
        )
        .openPopup();

      // Centraliza o mapa na localização
      map.current?.setView([lat, lon], 15);

      // Limpa as sugestões
      setSuggestions([]);
      setSearchAddress("");

      // Chama a função callback com as coordenadas
      onLocationSelect(lat, lon);
    },
    [onLocationSelect],
  );

  return (
    <div className="w-full mt-8">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-sky-700 mb-4">
          Selecionar Local no Mapa
        </h2>

        {/* Campo de busca de endereço */}
        <div className="w-full mb-4 relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Buscar Endereço
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => {
                setSearchAddress(e.target.value);
                handleSearchAddress(e.target.value);
              }}
              placeholder="Ex: Rua das Flores 123, Lisboa | Times Square, New York | Avenida Brasil 456, São Paulo"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500"
            />

            {/* Lista de sugestões */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      selectLocation(
                        suggestion.lat,
                        suggestion.lon,
                        suggestion.name,
                      )
                    }
                    className="w-full text-left px-4 py-2 hover:bg-sky-100 hover:text-sky-700 border-b last:border-b-0 text-sm text-gray-700 transition-colors">
                    {suggestion.name}
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          Ou clique no mapa para selecionar um local com o pin
        </p>

        <div
          ref={mapContainer}
          className="w-full rounded-lg border-2 border-gray-300 overflow-hidden"
          style={{ minHeight: "400px", height: "400px" }}
        />

        {!isMapLoaded && (
          <div className="mt-4 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="mt-2">Carregando mapa...</p>
          </div>
        )}
      </div>
    </div>
  );
}
