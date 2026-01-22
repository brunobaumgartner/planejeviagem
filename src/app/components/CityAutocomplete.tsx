import { useState, useRef, useEffect } from "react";
import { searchCities, formatCityName, type GeocodedCity } from "@/services/geocodeService";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (city: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function CityAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Ex: São Paulo, Brasil",
  label,
  required = false,
  className = "",
}: CityAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cities, setCities] = useState<GeocodedCity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar cidades na API com debounce
  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.length < 3) {
      setCities([]);
      setShowSuggestions(false);
      return;
    }

    // Cancelar busca anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce de 200ms (reduzido para resposta mais rápida)
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchCities(inputValue);
        setCities(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('[CityAutocomplete] Erro ao buscar cidades:', error);
        setCities([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  // Selecionar uma cidade das sugestões
  const handleSelectCity = (city: GeocodedCity) => {
    const formattedName = formatCityName(city);
    onChange(formattedName);
    onSelect && onSelect(formattedName);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && '*'}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        required={required}
      />
      {showSuggestions && cities.length > 0 && (
        <div
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto rounded-xl"
          ref={suggestionsRef}
        >
          {cities.map((city, index) => {
            const formattedName = formatCityName(city);
            return (
              <div
                key={`${city.lat}-${city.lon}-${index}`}
                className="px-4 py-2.5 cursor-pointer hover:bg-sky-50 transition-colors text-sm border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelectCity(city)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📍</span>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium">{city.name}</div>
                    <div className="text-xs text-gray-500">{formattedName}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {value.length > 0 && value.length < 3 && (
        <div className="absolute z-10 mt-1 w-full bg-sky-50 border border-sky-200 shadow-sm rounded-lg px-3 py-2">
          <div className="text-xs text-sky-600">💡 Digite pelo menos 3 caracteres para buscar</div>
        </div>
      )}
      {isLoading && (
        <div className="absolute right-3 top-[38px] text-gray-400">
          <div className="animate-spin">⏳</div>
        </div>
      )}
    </div>
  );
}