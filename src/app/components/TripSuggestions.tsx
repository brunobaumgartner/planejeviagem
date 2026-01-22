import { useState, useEffect } from "react";
import { Sparkles, MapPin, Calendar, DollarSign, Loader2 } from "lucide-react";
import { projectId, publicAnonKey } from '/utils/supabase/info';

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
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar sugestões do servidor na montagem do componente
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[TripSuggestions] Iniciando busca de destinos...');
      
      // Timeout de 10 segundos (reduzido)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
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

      console.log('[TripSuggestions] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Servidor temporariamente indisponível (${response.status})`);
      }

      const data = await response.json();
      console.log('[TripSuggestions] Dados recebidos:', data);
      
      if (data.destinations && data.destinations.length > 0) {
        setSuggestions(data.destinations);
        console.log(`[TripSuggestions] ✅ ${data.destinations.length} destinos carregados da API`);
      } else {
        throw new Error('Nenhum destino disponível');
      }
    } catch (err) {
      // Verificar se é timeout ou erro de rede
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      const isNetworkError = err instanceof Error && err.message.includes('Failed to fetch');
      
      if (isTimeout) {
        console.warn('[TripSuggestions] ⏱️ Timeout (10s) - usando sugestões locais');
      } else if (isNetworkError) {
        console.warn('[TripSuggestions] 🔌 Servidor indisponível - usando sugestões locais');
      } else {
        console.warn('[TripSuggestions] ⚠️ Erro ao buscar API:', err);
      }
      
      // Fallback: sugestões locais sempre funcionam
      setSuggestions([
        {
          destination: "Rio de Janeiro, Brasil",
          duration: "5 dias",
          budget: "Consultar",
          highlights: ["Cristo Redentor", "Praias", "Pão de Açúcar"],
          emoji: "🏖️"
        },
        {
          destination: "São Paulo, Brasil",
          duration: "4 dias",
          budget: "Consultar",
          highlights: ["MASP", "Avenida Paulista", "Gastronomia"],
          emoji: "🏙️"
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
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 shadow-sm border border-sky-100">
        <div className="flex items-center justify-center gap-3 py-6 sm:py-8">
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 animate-spin" />
          <p className="text-sm sm:text-base text-gray-600">Carregando destinos...</p>
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
              <h3 className="font-semibold text-amber-900 text-sm sm:text-base">Sugestões indisponíveis</h3>
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
          💡 Valores calculados automaticamente via API. Use o calculador de orçamento para valores personalizados.
        </p>
      </div>
    </div>
  );
}