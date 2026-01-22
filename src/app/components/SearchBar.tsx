import { Search, MapPin, X, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { searchCities } from "@/services/wikiService";

interface SearchBarProps {
  placeholder?: string;
  onCitySelect?: (cityName: string) => void;
}

interface CityResult {
  title: string;
  description?: string;
  thumbnail?: string;
}

export function SearchBar({ placeholder, onCitySelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar cidades na Wikipedia API
  useEffect(() => {
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Se query estiver vazio, limpar resultados
    if (!query.trim()) {
      setCities([]);
      setError(null);
      return;
    }

    // Debounce: esperar 300ms após o usuário parar de digitar
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await searchCities(query.trim());
        setCities(results);
        
        if (results.length === 0) {
          setError('Nenhuma cidade encontrada');
        }
      } catch (err) {
        console.error('Erro ao buscar cidades:', err);
        setError('Erro ao buscar. Tente novamente.');
        setCities([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
  }

  function handleCityClick(cityName: string) {
    setQuery('');
    setIsOpen(false);
    setCities([]);
    onCitySelect?.(cityName);
  }

  function handleClear() {
    setQuery('');
    setIsOpen(false);
    setCities([]);
    setError(null);
  }

  function handleFocus() {
    setIsOpen(true);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="w-full px-4 py-3 pr-12 rounded-full bg-sky-200 text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
        />
        {loading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 animate-spin" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-sky-300 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        ) : (
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
        )}
      </div>

      {/* Dropdown de Sugestões */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-sky-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-4 py-3 border-b border-sky-100">
            <p className="text-sm font-semibold text-gray-700">
              {loading ? 'Buscando...' : error ? 'Resultado' : `${cities.length} cidade(s) encontrada(s)`}
            </p>
          </div>

          {/* Lista de Cidades */}
          {loading ? (
            <div className="px-4 py-8 text-center">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600">Buscando cidades...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">{error}</p>
              <p className="text-sm text-gray-500">Tente outro nome</p>
            </div>
          ) : cities.length > 0 ? (
            <div className="py-2">
              {cities.map((city, index) => (
                <button
                  key={`${city.title}-${index}`}
                  onClick={() => handleCityClick(city.title)}
                  className="w-full px-4 py-3 hover:bg-sky-50 transition-colors flex items-center gap-3 group"
                >
                  {city.thumbnail ? (
                    <img
                      src={city.thumbnail}
                      alt={city.title}
                      className="flex-shrink-0 w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-sky-600" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 group-hover:text-sky-600">
                      {city.title}
                    </div>
                    {city.description && (
                      <div className="text-sm text-gray-500 line-clamp-1">{city.description}</div>
                    )}
                  </div>
                  <MapPin className="w-4 h-4 text-gray-400 group-hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          ) : null}

          {/* Footer */}
          <div className="bg-sky-50 px-4 py-3 border-t border-sky-100">
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span className="text-sky-600">??</span>
              Digite o nome de qualquer cidade do mundo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}