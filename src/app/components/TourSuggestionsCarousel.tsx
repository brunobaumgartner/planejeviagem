import { useState, useEffect, useRef } from "react";
import {
  Map,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  generateTourSuggestions,
  ESTIMATED_TOUR_PRICES,
} from "@/services/travelpayouts";

const TRAVELPAYOUTS_MARKER = "698211"; // TODO: Substituir pelo seu marker real

interface TourSuggestion {
  destination: {
    name: string;
    code: string;
    country: string;
    emoji: string;
    hotelCity: string;
  };
  link: string;
}

export function TourSuggestionsCarousel() {
  const [suggestions, setSuggestions] = useState<TourSuggestion[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateSuggestions();
  }, []);

  useEffect(() => {
    checkScrollButtons();
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [suggestions]);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 280;
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const generateSuggestions = () => {
    const tourSuggestions = generateTourSuggestions(
      TRAVELPAYOUTS_MARKER,
      6
    );
    setSuggestions(tourSuggestions);
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            🎭 Tours e Atividades
          </h2>
          <p className="text-xs text-gray-600">
            Experiências inesquecíveis nos melhores destinos
          </p>
        </div>
      </div>

      {/* Carrossel horizontal com botões de navegação */}
      <div className="relative group">
        {/* Botão Anterior */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-2 border-2 border-orange-200 hover:border-orange-400 transition-all sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Ver tours anteriores"
          >
            <ChevronLeft className="w-5 h-5 text-orange-600" />
          </button>
        )}

        {/* Botão Próximo */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-2 border-2 border-orange-200 hover:border-orange-400 transition-all sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Ver próximos tours"
          >
            <ChevronRight className="w-5 h-5 text-orange-600" />
          </button>
        )}

        {/* Container do Carrossel */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto pb-4 -mx-3 sm:-mx-4 px-3 sm:px-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-4 min-w-max">
            {suggestions.map((suggestion, index) => {
              const estimatedPrice =
                ESTIMATED_TOUR_PRICES[suggestion.destination.code] || 200;

              return (
                <a
                  key={index}
                  href={suggestion.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-64 bg-white border-2 border-orange-200 rounded-2xl p-4 hover:border-orange-400 hover:shadow-lg transition-all group"
                >
                  {/* Destino */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">
                          {suggestion.destination.emoji}
                        </span>
                        <h3 className="font-bold text-gray-900">
                          {suggestion.destination.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600">
                        {suggestion.destination.country}
                      </p>
                    </div>
                    <Map className="w-5 h-5 text-orange-500 transform group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Preço estimado */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-1">
                      A partir de
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      R$ {estimatedPrice.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-gray-500">
                      por atividade
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-600 font-semibold group-hover:text-orange-700">
                      Ver experiências
                    </span>
                    <ExternalLink className="w-4 h-4 text-orange-500" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info de afiliado */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <AlertCircle className="w-3 h-3" />
        <p>
          Links de afiliado. Ao clicar você será redirecionado
          para o GetYourGuide.
        </p>
      </div>
    </div>
  );
}