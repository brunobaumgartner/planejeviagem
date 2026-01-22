/**
 * COUNTRY SELECTOR COMPONENT
 * 
 * Componente de seleção de país com busca e autocomplete.
 * Usa REST Countries API via internationalService.
 * 
 * Features:
 * ✅ Busca por nome do país
 * ✅ Mostra bandeira + nome
 * ✅ Agrupa por região (Europa, Ásia, etc)
 * ✅ Cache local (localStorage)
 * ✅ Loading states
 * ✅ Error handling
 * 
 * @example
 * <CountrySelector
 *   value="BR"
 *   onChange={(country) => console.log(country)}
 *   placeholder="Selecione um país"
 * />
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Globe, X } from 'lucide-react';
import type { Country, CountrySearchResult } from '@/types';
import { getAllCountries, searchCountries } from '@/services/internationalService';

interface CountrySelectorProps {
  value?: string; // Código do país (ex: "BR", "US")
  onChange: (country: Country | null) => void;
  placeholder?: string;
  disabled?: boolean;
  showRegion?: boolean; // Mostrar região ao lado do nome
  className?: string;
}

export function CountrySelector({
  value,
  onChange,
  placeholder = 'Buscar país...',
  disabled = false,
  showRegion = true,
  className = '',
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar todos os países no mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Atualizar país selecionado quando value mudar
  useEffect(() => {
    if (value && allCountries.length > 0) {
      const country = allCountries.find(c => c.cca2 === value);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [value, allCountries]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filtrar países quando busca mudar
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Sem busca: mostrar top 20 países mais populosos
      const top20 = [...allCountries]
        .sort((a, b) => b.population - a.population)
        .slice(0, 20);
      setFilteredCountries(top20);
    } else {
      // Com busca: filtrar por nome
      const query = searchQuery.toLowerCase();
      const filtered = allCountries.filter(country =>
        country.name.common.toLowerCase().includes(query) ||
        country.name.official.toLowerCase().includes(query) ||
        country.cca2.toLowerCase() === query ||
        country.cca3.toLowerCase() === query
      );
      setFilteredCountries(filtered.slice(0, 50)); // Limitar a 50 resultados
    }
  }, [searchQuery, allCountries]);

  async function loadCountries() {
    try {
      setLoading(true);
      setError(null);
      const countries = await getAllCountries();
      setAllCountries(countries);
      
      // Inicialmente mostrar top 20
      const top20 = [...countries]
        .sort((a, b) => b.population - a.population)
        .slice(0, 20);
      setFilteredCountries(top20);
    } catch (err: any) {
      console.error('[CountrySelector] Erro ao carregar países:', err);
      setError('Erro ao carregar países. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectCountry(country: Country) {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    onChange(country);
  }

  function handleClear() {
    setSelectedCountry(null);
    setSearchQuery('');
    onChange(null);
  }

  function handleOpen() {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // Agrupar países por região
  const groupedCountries = filteredCountries.reduce((acc, country) => {
    const region = country.region || 'Other';
    if (!acc[region]) acc[region] = [];
    acc[region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  const regions = Object.keys(groupedCountries).sort();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input/Trigger */}
      <div
        onClick={handleOpen}
        className={`
          flex items-center gap-3 px-4 py-3 bg-white border rounded-xl
          cursor-pointer transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-400'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}
        `}
      >
        {selectedCountry ? (
          <>
            <span className="text-3xl">{selectedCountry.flag}</span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{selectedCountry.name.common}</div>
              {showRegion && (
                <div className="text-sm text-gray-500">{selectedCountry.region}</div>
              )}
            </div>
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </>
        ) : (
          <>
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500">{placeholder}</span>
          </>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar país..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                Carregando países...
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-500 mb-2">❌ {error}</div>
                <button
                  onClick={loadCountries}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Tentar novamente
                </button>
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhum país encontrado para "{searchQuery}"
              </div>
            ) : (
              regions.map(region => (
                <div key={region}>
                  {/* Region Header */}
                  <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {region}
                  </div>
                  
                  {/* Countries in Region */}
                  {groupedCountries[region].map(country => (
                    <button
                      key={country.cca2}
                      onClick={() => handleSelectCountry(country)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {country.name.common}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {country.capital?.[0] || 'N/A'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {country.cca2}
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
