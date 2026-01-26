import { Plane, Hotel, Coffee, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface TripResult {
  destination: string;
  totalCost: number;
  breakdown: {
    flights: number;
    accommodation: number;
    dailyExpenses: number;
  };
  days: number;
  currency: string;
  emoji?: string;
}

interface TripResultsProps {
  searchType: 'budget' | 'destination';
  budget?: number;
  destination?: string;
  origin: string; // Campo de origem adicionado
  days: number;
  currency: string;
  onSelectDestination?: (destination: string) => void;
}

export function TripResults({ searchType, budget, destination, origin, days, currency, onSelectDestination }: TripResultsProps) {
  const [results, setResults] = useState<TripResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iataMap, setIataMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch('https://api.travelpayouts.com/data/pt/cities.json');
        const cities = await response.json();

        const map = new Map<string, string>();
        cities.forEach((city: any) => {
          if (city.code && city.name) {
            map.set(city.code.toUpperCase(), city.name);
          }
        });

        setIataMap(map);
      } catch (err) {
        console.error('[TripResults] Erro ao carregar cidades', err);
      }
    };

    loadCities();
  }, []);

  const resolveDestinationName = (code: string) => {
    return iataMap.get(code.toUpperCase()) || code;
  };



  useEffect(() => {
    fetchResults();
  }, [searchType, budget, destination, origin, days, currency]); // Adicionado origin nas dependências

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        searchType,
        origin, // Incluindo origem na requisição
        days: days.toString(),
        currency
      });

      if (searchType === 'budget' && budget) {
        params.append('budget', budget.toString());
      } else if (searchType === 'destination' && destination) {
        params.append('destination', destination);
      }

      console.log('[TripResults] Buscando com origem:', origin);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/trip-calculator?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar resultados');
      }

      const data = await response.json();
      console.log('[TripResults] ✅ Resposta da API:', data);
      console.log('[TripResults] Número de resultados:', data.results?.length || 0);
      
      if (data.error) {
        console.error('[TripResults] ❌ Erro retornado pela API:', data.error);
        setError(data.error);
        setResults([]);
        return;
      }
      
      setResults(data.results || []);
    } catch (err) {
      console.error('[TripResults] Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar resultados');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number | null | undefined, curr: string) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'Indisponível';
    }
    const symbols: Record<string, string> = {
      BRL: 'R$',
      USD: '$',
      EUR: '€'
    };
    return `${symbols[curr] || curr} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              {searchType === 'budget' ? 'Buscando destinos...' : 'Calculando custos...'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Consultando preços reais de voos e hospedagem
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 shadow-lg border border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Erro ao buscar resultados</h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchResults}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-amber-50 rounded-2xl p-6 shadow-lg border border-amber-200">
        <div className="text-center">
          <p className="text-lg font-medium text-amber-900 mb-2">
            Nenhum resultado encontrado
          </p>
          <p className="text-sm text-amber-700">
            {searchType === 'budget' 
              ? 'Tente aumentar o orçamento ou reduzir os dias de viagem'
              : 'Destino não encontrado. Tente outro nome ou cidade'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {searchType === 'budget' 
            ? `🌍 Destinos para ${formatCurrency(budget || 0, currency)}`
            : `💰 Custo para ${destination}`}
        </h2>
        <p className="text-sm text-gray-600">
          {results.length} {results.length === 1 ? 'opção encontrada' : 'opções encontradas'} para {days} {days === 1 ? 'dia' : 'dias'}
        </p>
      </div>

      {/* Results */}
      {results.map((result, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:border-sky-300 transition-all"
        >
          {/* Destination Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{result.emoji || '✈️'}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{resolveDestinationName(result.destination)}</h3>
                <p className="text-sm text-gray-600">{result.days} dias de viagem</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Custo Total</p>
              <p className="text-2xl font-bold text-sky-600">
                {formatCurrency(result.totalCost, result.currency)}
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">Voos (ida + volta)</p>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(result.breakdown.flights, result.currency)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hotel className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-900">Hospedagem ({result.days} {result.days === 1 ? 'noite' : 'noites'})</p>
              </div>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(result.breakdown.accommodation, result.currency)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coffee className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">Gastos diários</p>
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(result.breakdown.dailyExpenses, result.currency)}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onSelectDestination?.(result.destination)}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Planejar viagem para {result.destination}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ))}

      {/* Info Footer */}
      <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
        <p className="text-xs text-gray-600 text-center">
          💡 Valores calculados com base em preços médios. Podem variar conforme temporada e disponibilidade.
        </p>
      </div>
    </div>
  );
}