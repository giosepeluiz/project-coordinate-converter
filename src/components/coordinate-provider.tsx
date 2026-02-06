"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface CoordinateProviderProps {
  onCoordinatesFromUrl: (coords: string) => void;
}

export function CoordinateProvider({
  onCoordinatesFromUrl,
}: CoordinateProviderProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const coordFromUrl = searchParams.get("coord");
    if (coordFromUrl) {
      onCoordinatesFromUrl(coordFromUrl);
    }
  }, [searchParams, onCoordinatesFromUrl]);

  return null;
}
