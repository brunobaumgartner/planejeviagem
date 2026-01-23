import { useState, useEffect, useRef } from "react";
import {
  Plane,
  MapPin,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useNavigation } from "@/app/context/NavigationContext";
import {
  generateFlightSuggestions,
  getCityCode,
  ESTIMATED_PRICES,
} from "@/services/travelpayouts";

// O marker será passado do backend ou configurado aqui
const TRAVELPAYOUTS_MARKER = "698211"; // TODO: Substituir pelo seu marker real

interface FlightSuggestion {
  destination: {
    name: string;
    code: string;
    country: string;
    emoji: string;
  };
  link: string;
}

export function FlightSuggestionsCarousel() {
  const { user, isGuest, isLoading } = useAuth();
  const { setCurrentScreen } = useNavigation();
  const [suggestions, setSuggestions] = useState<
    FlightSuggestion[]
  >([]);
  const [originCity, setOriginCity] = useState<string | null>(
    null,
  );
  const [showLocationPrompt, setShowLocationPrompt] =
    useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Só inicializa quando os dados do usuário estiverem carregados
    if (!isLoading) {
      initializeOrigin();
    }
  }, [user, isLoading]);

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

    const scrollAmount = 280; // largura do card (256px) + gap (16px) + margem
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const initializeOrigin = () => {
    // Verificar se usuário tem cidade cadastrada
    if (user?.homeCity) {
      const code = getCityCode(user.homeCity);
      setOriginCity(user.homeCity);
      generateSuggestions(code);
      setShowLocationPrompt(false); // Garantir que o prompt está oculto
      return;
    }

    // Se não tiver cidade cadastrada, mostrar prompt
    setShowLocationPrompt(true);
  };

  const generateSuggestions = (originCode: string) => {
    const flightSuggestions = generateFlightSuggestions(
      originCode,
      TRAVELPAYOUTS_MARKER,
      6,
    );
    setSuggestions(flightSuggestions);
  };

  // Enquanto carrega, não mostrar nada
  if (isLoading) {
    return null;
  }

  // Se não tem origem configurada, mostrar prompt
  if (showLocationPrompt) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            ✈️ Voos em Promoção
          </h2>
        </div>
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-2 border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">
                Configure sua cidade de origem
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Para ver sugestões de voos personalizadas,
                precisamos saber de onde você vai viajar.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Botão para configurar manualmente */}
                {isGuest ? (
                  <button
                    onClick={() => setCurrentScreen("signup")}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Criar conta e configurar
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentScreen("perfil")}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Configurar no perfil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se não tem sugestões, não mostrar nada
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            ✈️ Voos em Promoção
          </h2>
          <p className="text-xs text-gray-600">
            Saindo de{" "}
            <span className="font-semibold text-sky-600">
              {originCity}
            </span>
          </p>
        </div>
        
        {/* Botão Ver Mais
        <button
          onClick={() => setCurrentScreen("flight-search")}
          className="text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
        >
          Ver mais
          <ChevronRight className="w-4 h-4" />
        </button> */}
      </div>

      {/* Carrossel horizontal com botões de navegação */}
      <div className="relative group">
        {/* Botão Anterior */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-2 border-2 border-sky-200 hover:border-sky-400 transition-all sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Ver voos anteriores"
          >
            <ChevronLeft className="w-5 h-5 text-sky-600" />
          </button>
        )}

        {/* Botão Próximo */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-2 border-2 border-sky-200 hover:border-sky-400 transition-all sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Ver próximos voos"
          >
            <ChevronRight className="w-5 h-5 text-sky-600" />
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
                ESTIMATED_PRICES[suggestion.destination.code] ||
                3000;

              return (
                <a
                  key={index}
                  href={suggestion.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-64 bg-white border-2 border-sky-200 rounded-2xl p-4 hover:border-sky-400 hover:shadow-lg transition-all group"
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
                    <Plane className="w-5 h-5 text-sky-500 transform group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Preço estimado */}
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-1">
                      A partir de
                    </p>
                    <p className="text-2xl font-bold text-sky-600">
                      R$ {estimatedPrice.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-gray-500">
                      ida e volta
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sky-600 font-semibold group-hover:text-sky-700">
                      Ver ofertas
                    </span>
                    <ExternalLink className="w-4 h-4 text-sky-500" />
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
          para o site de busca de voos.
        </p>
      </div>
    </div>
  );
}