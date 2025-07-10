// src/components/card/page.tsx

type CardType = "localization" | "waze" | "googlemaps" | "applemaps";

export type CardProps = {
  type: CardType;
  coordinates: string;
};

type CardContentProps = {
  title: string;
  content: string;
};

// Objeto de configuração para os cards.
// Facilita a manutenção e a adição de novos tipos de mapa.
const cardConfig = {
  // Geração do conteúdo dos cards com base no tipo.
  // Cada tipo de card tem um título e uma função para gerar o conteúdo.
  localization: {
    title: "Coordenadas Convertidas",
    getContent: (coordinates: string) => coordinates,
  },
  waze: {
    title: "Waze",
    getContent: (coordinates: string) =>
      `https://waze.com/ul?ll=${coordinates}&navigate=yes`,
  },
  googlemaps: {
    title: "Google Maps",
    // CORREÇÃO: A URL estava incorreta. A URL correta usa o domínio principal
    // do Google Maps e o parâmetro 'q' para a busca de coordenadas.
    getContent: (coordinates: string) =>
      `https://www.google.com/maps?q=${coordinates}`,
  },
  applemaps: {
    title: "Apple Maps",
    // CORREÇÃO: A URL estava incorreta. O parâmetro correto é 'll'.
    getContent: (coordinates: string) =>
      `https://maps.apple.com/place?coordinate=${coordinates}`,
  },
};

function CardContent({ title, content }: CardContentProps) {
  return (
    <div className="flex flex-col items-center mt-5 justify-center w-full max-w-3xl p-6 bg-white rounded-lg shadow-md">
      <span className="text-sky-700 font-bold mb-3">{title}:</span>
      {/* Adicionado 'break-all' para garantir que URLs longas sem espaços quebrem a linha */}
      <code className="p-3 bg-gray-200 text-gray-600 w-full text-center my-1 overflow-x-auto break-all">
        {content}
      </code>
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

  return <CardContent title={config.title} content={content} />;
}
