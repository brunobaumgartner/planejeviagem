import { useState, useEffect } from "react";
import { Sparkles, MapPin, Calendar, DollarSign, Loader2, Navigation } from "lucide-react";
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useAuth } from '@/app/context/AuthContext';
import * as geolocation from '@/services/geolocation';

interface SuggestionData {
  destination: string;
  duration: string;
  budget: string;
  highlights: string[];
  emoji: string;
}

interface TripSuggestionsProps {
  onSelectSuggestion?: (suggestion: SuggestionData) => void;
}

export function TripSuggestions({ onSelectSuggestion }: TripSuggestionsProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originCity, setOriginCity] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // Buscar cidade de origem ao montar
  useEffect(() => {
    loadOriginCity();
  }, [user]);

  // Buscar sugestões quando tiver cidade de origem
  useEffect(() => {
    if (originCity) {
      fetchSuggestions();
    }
  }, [originCity]);

  const loadOriginCity = async () => {
    // Primeiro tentar carregar do localStorage
    const savedCity = geolocation.getSavedOriginCity();
    if (savedCity) {
      console.log('[TripSuggestions] Cidade salva encontrada:', savedCity);
      setOriginCity(savedCity);
      return;
    }

    // Se não tiver cidade salva, usar São Paulo como padrão
    // NÃO solicitar geolocalização automaticamente para evitar erros de permissão
    console.log('[TripSuggestions] Nenhuma cidade salva - usando São Paulo como padrão');
    setOriginCity('São Paulo');
  };

  const requestLocation = async () => {
    setIsLoadingLocation(true);
    setLocationDenied(false);

    const cityInfo = await geolocation.getUserCity();
    
    if (cityInfo) {
      console.log('[TripSuggestions] Localização obtida:', cityInfo.fullName);
      setOriginCity(cityInfo.fullName);
      geolocation.saveOriginCity(cityInfo.fullName);
    } else {
      console.log('[TripSuggestions] Localização não obtida');
      setLocationDenied(true);
      // Usar São Paulo como fallback
      setOriginCity('São Paulo');
    }

    setIsLoadingLocation(false);
  };

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[TripSuggestions] Buscando destinos com origem:', originCity);
      
      // Timeout de 30 segundos (endpoint pode demorar devido a múltiplas consultas)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/popular-destinations`,
        { 
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Servidor temporariamente indisponível (${response.status})`);
      }

      const data = await response.json();
      
      if (data.destinations && data.destinations.length > 0) {
        setSuggestions(data.destinations);
        console.log(`[TripSuggestions] ✅ ${data.destinations.length} destinos carregados`);
      } else {
        throw new Error('Nenhum destino disponível');
      }
    } catch (err) {
      // Não logar AbortError como erro - é esperado em caso de timeout
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[TripSuggestions] ⏱️ Timeout ao buscar destinos - usando fallback');
      } else {
        console.warn('[TripSuggestions] ⚠️ Erro ao buscar:', err);
      }
      
      // Fallback com sugestões locais (não mostra erro ao usuário)
      setSuggestions([
        {
          destination: "Rio de Janeiro, Brasil",
          duration: "5 dias",
          budget: "R$ 1.000 - R$ 2.500",
          highlights: ["Cristo Redentor", "Praias", "Pão de Açúcar"],
          emoji: "🏖️"
        },
        {
          destination: "São Paulo, Brasil",
          duration: "4 dias",
          budget: "R$ 1.200 - R$ 2.800",
          highlights: ["MASP", "Avenida Paulista", "Gastronomia"],
          emoji: "🏙️"
        },
        {
          destination: "Salvador, Brasil",
          duration: "5 dias",
          budget: "R$ 900 - R$ 2.200",
          highlights: ["Pelourinho", "Praias tropicais", "Cultura"],
          emoji: "🎭"
        },
        {
          destination: "Florianópolis, Brasil",
          duration: "5 dias",
          budget: "R$ 1.100 - R$ 2.600",
          highlights: ["42 praias", "Lagoa da Conceição", "Frutos do mar"],
          emoji: "🌊"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomSuggestion = () => {
    if (suggestions.length === 0) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * suggestions.length);
      } while (newIndex === currentIndex && suggestions.length > 1);
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 300);
  };

  // Loading state
  if (isLoading || isLoadingLocation) {
    return (
      <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 shadow-sm border border-sky-100">
        <div className="flex items-center justify-center gap-3 py-6 sm:py-8">
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 animate-spin" />
          <p className="text-sm sm:text-base text-gray-600">
            {isLoadingLocation ? 'Detectando sua localização...' : 'Carregando destinos...'}
          </p>
        </div>
      </div>
    );
  }

  // Location denied state
  if (locationDenied && !originCity) {
    return (
      <div className="bg-amber-50 rounded-2xl p-4 sm:p-6 shadow-sm border border-amber-200">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Navigation className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 text-sm sm:text-base">
                Permita o acesso à localização
              </h3>
              <p className="text-xs sm:text-sm text-amber-700 mt-1">
                Para calcular preços aproximados baseados na sua origem, precisamos saber de onde você está partindo.
              </p>
            </div>
          </div>
          <button
            onClick={requestLocation}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Permitir localização
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error || suggestions.length === 0) {
    return (
      <div className="bg-amber-50 rounded-2xl p-4 sm:p-6 shadow-sm border border-amber-200">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 text-sm sm:text-base">Sugest��es indisponíveis</h3>
              <p className="text-xs sm:text-sm text-amber-700 break-words">{error || 'Tente novamente mais tarde'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError(null);
              fetchSuggestions();
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const currentSuggestion = suggestions[currentIndex];

  return (
    <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 shadow-sm border border-sky-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Inspire-se</h3>
        </div>
        <button
          onClick={getRandomSuggestion}
          disabled={isAnimating}
          className="text-xs sm:text-sm text-sky-600 hover:text-sky-700 font-medium px-2 sm:px-3 py-1.5 rounded-lg hover:bg-white/60 transition-all disabled:opacity-50"
        >
          {isAnimating ? "🔄" : <span className="hidden sm:inline">✨ Outra ideia</span>}
          {isAnimating ? "" : <span className="sm:hidden">✨ Outra</span>}
        </button>
      </div>

      {/* Origin City Display */}
      {originCity && (
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-600 bg-white/50 rounded-lg px-3 py-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>Partindo de: <strong>{originCity}</strong></span>
        </div>
      )}

      {/* Suggestion Card */}
      <div 
        className={`transition-all duration-300 ${
          isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}
      >
        {/* Destination */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl sm:text-2xl">{currentSuggestion.emoji}</span>
          <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
            {currentSuggestion.destination}
          </h4>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span className="text-gray-700">{currentSuggestion.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-gray-700 font-medium">{currentSuggestion.budget}</span>
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {currentSuggestion.highlights.map((highlight, index) => (
              <span
                key={index}
                className="text-xs px-2.5 py-1 bg-white/70 text-gray-700 rounded-full border border-sky-200"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelectSuggestion?.(currentSuggestion)}
          className="w-full bg-sky-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-sky-600 transition-colors shadow-sm"
        >
          Planejar essa viagem →
        </button>
      </div>

      {/* Indicator */}
      <div className="flex justify-center gap-1 mt-4">
        {suggestions.slice(0, 5).map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all ${
              index === currentIndex % 5
                ? 'w-6 bg-sky-500'
                : 'w-1.5 bg-sky-200'
            }`}
          />
        ))}
      </div>
      
      {/* Nota sobre orçamento */}
      <div className="mt-3 pt-3 border-t border-sky-200">
        <p className="text-xs text-gray-500 text-center">
          💡 Valores de orçamento são aproximados e podem variar.
        </p>
      </div>
    </div>
  );
}