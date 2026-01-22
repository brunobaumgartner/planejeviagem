import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Info, Plane, Hotel, Utensils, MapPin, Car, Bus, X, CheckCircle2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { calculateTransportCost } from '@/utils/transportCalculator';
import type { TransportType, FlightClass, BusClass } from '@/types';

interface CityBudget {
  city_name: string;
  country: string;
  daily_budgets: {
    economy: number;
    medium: number;
    comfort: number;
  };
  currency?: string;
  notes?: string;
}

interface BudgetRecommendationProps {
  destination: string;
  country?: string;
  origin: string;
  startDate: string;
  endDate: string;
  transportType: TransportType;
  flightClass?: FlightClass;
  busClass?: BusClass;
  passengers: number;
  onBudgetSelect?: (amount: number, budgetType: 'economy' | 'medium' | 'comfort') => void;
  onClose?: () => void;
}

export function BudgetRecommendation({ 
  destination, 
  country, 
  origin,
  startDate, 
  endDate,
  transportType,
  flightClass,
  busClass,
  passengers,
  onBudgetSelect,
  onClose
}: BudgetRecommendationProps) {
  const [cityBudget, setCityBudget] = useState<CityBudget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBudgetType, setSelectedBudgetType] = useState<'economy' | 'medium' | 'comfort' | null>(null);
  const [transportCost, setTransportCost] = useState<number | null>(null);
  const [transportError, setTransportError] = useState<string | null>(null);

  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;

  useEffect(() => {
    fetchCityBudget();
    calculateTransport();
  }, [destination, origin, startDate, transportType, flightClass, busClass, passengers]);

  const calculateTransport = () => {
    try {
      // Validar que origem e destino têm comprimento mínimo
      if (!origin || !destination || !startDate || origin.length < 3 || destination.length < 3) {
        setTransportError(null); // Não mostrar erro durante digitação
        setTransportCost(null);
        return;
      }

      const result = calculateTransportCost({
        origin,
        destination,
        transportType,
        flightClass,
        busClass,
        passengers,
        startDate,
      });

      setTransportCost(result.cost);
      setTransportError(null);
    } catch (error: any) {
      console.log('ℹ️ Aguardando dados completos para calcular transporte');
      setTransportError(null); // Não mostrar erro durante digitação
      setTransportCost(null);
    }
  };

  const fetchCityBudget = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/budgets/${encodeURIComponent(destination)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCityBudget(data.cityBudget);
      }
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = (budgetType: 'economy' | 'medium' | 'comfort') => {
    if (!cityBudget) return 0;
    
    const dailyBudget = cityBudget.daily_budgets[budgetType];
    const accommodation = dailyBudget * days;
    
    // Estimar passagem
    const flightEstimate = transportCost || 0;
    
    return accommodation + flightEstimate;
  };

  const handleSelectBudget = (budgetType: 'economy' | 'medium' | 'comfort') => {
    setSelectedBudgetType(budgetType);
    const total = calculateTotal(budgetType);
    onBudgetSelect?.(total, budgetType);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!cityBudget) {
    return (
      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-start gap-3">
          <Info className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">
              Orçamento não disponível
            </h3>
            <p className="text-sm text-amber-700">
              Ainda não temos dados de orçamento para {destination}. 
              Use como referência valores de cidades similares.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const budgetOptions: Array<{
    type: 'economy' | 'medium' | 'comfort';
    label: string;
    icon: typeof TrendingDown;
    color: string;
    description: string;
  }> = [
    {
      type: 'economy',
      label: 'Econômico',
      icon: TrendingDown,
      color: 'emerald',
      description: 'Hostels, transporte público, refeições básicas'
    },
    {
      type: 'medium',
      label: 'Moderado',
      icon: DollarSign,
      color: 'blue',
      description: 'Hotéis 3★, mix de transporte, restaurantes locais'
    },
    {
      type: 'comfort',
      label: 'Conforto',
      icon: TrendingUp,
      color: 'purple',
      description: 'Hotéis 4-5★, táxi/uber, restaurantes premium'
    }
  ];

  // Ícone de transporte baseado no tipo
  const TransportIcon = transportType === 'flight' ? Plane : transportType === 'bus' ? Bus : Car;
  const transportLabel = 
    transportType === 'flight' ? `Avião ${flightClass === 'business' ? 'Executiva' : 'Econômica'}` :
    transportType === 'bus' ? `Ônibus ${busClass === 'sleeper' ? 'Leito' : 'Convencional'}` :
    'Carro Próprio';

  return (
    <div className="bg-white rounded-xl p-3 sm:p-6 border border-gray-200 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
            Recomendação de Orçamento
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2 sm:gap-3">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm text-blue-900 flex-1 min-w-0">
              <p className="font-medium mb-1 truncate">
                {origin} → {destination}
              </p>
              <p className="text-blue-700 text-xs sm:text-sm">
                {days} {days === 1 ? 'dia' : 'dias'} • {passengers} {passengers === 1 ? 'passageiro' : 'passageiros'}
              </p>
            </div>
          </div>
          
          {transportCost && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-blue-800 bg-blue-100 rounded-lg p-2 sm:p-3 mt-2">
              <TransportIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">{transportLabel}:</span>
              <span className="font-bold">R$ {transportCost.toLocaleString('pt-BR')}</span>
              <span className="text-blue-600 text-[10px] sm:text-xs">(total ida e volta)</span>
            </div>
          )}
          
          {transportError && (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-amber-800 bg-amber-100 rounded-lg p-2 sm:p-3 mt-2">
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
              <span className="break-words">{transportError}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {budgetOptions.map((option) => {
          const Icon = option.icon;
          const total = calculateTotal(option.type);
          const dailyAvg = cityBudget.daily_budgets[option.type];
          const isSelected = selectedBudgetType === option.type;
          
          return (
            <button
              key={option.type}
              onClick={() => handleSelectBudget(option.type)}
              className={`
                w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all
                ${isSelected 
                  ? `border-${option.color}-500 bg-${option.color}-50` 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-${option.color}-600`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{option.label}</h4>
                      {isSelected && (
                        <CheckCircle2 className={`w-4 h-4 text-${option.color}-600`} />
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-600 mb-2 line-clamp-1">
                      {option.description}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-700">
                      <span className="truncate">
                        R$ {dailyAvg.toLocaleString('pt-BR')}/dia
                      </span>
                      {transportCost && (
                        <span className="text-[10px] sm:text-xs text-gray-500">
                          + R$ {transportCost.toLocaleString('pt-BR')} transporte
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-base sm:text-lg font-bold text-${option.color}-700`}>
                    R$ {total.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    total
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Botão de confirmar */}
      {selectedBudgetType && (
        <div className="pt-2 sm:pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              const total = calculateTotal(selectedBudgetType);
              onBudgetSelect(total, selectedBudgetType);
              onClose?.();
            }}
            className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Usar este orçamento →
          </button>
        </div>
      )}

      {/* Nota sobre fontes */}
      <div className="text-[10px] sm:text-xs text-gray-500 text-center pt-2 sm:pt-3 border-t border-gray-100">
        💡 Valores calculados dinamicamente com base em dados de {cityBudget.city}
      </div>
    </div>
  );
}