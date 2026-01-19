import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Info, Plane, Hotel, Utensils, MapPin, Car, Bus } from 'lucide-react';
import { projectId } from '/utils/supabase/info';
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
  onBudgetSelect 
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
      if (!origin || !destination || !startDate) {
        setTransportError('Dados insuficientes para calcular transporte');
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
      console.error('Erro ao calcular transporte:', error);
      setTransportError(error.message || 'Erro ao calcular transporte');
      setTransportCost(null);
    }
  };

  const fetchCityBudget = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/budgets/${encodeURIComponent(destination)}`
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
    <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="size-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">
          Recomendação de Orçamento
        </h3>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Info className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 flex-1">
              <p className="font-medium mb-1">
                {origin} → {destination}
              </p>
              <p className="text-blue-700">
                {days} {days === 1 ? 'dia' : 'dias'} • {passengers} {passengers === 1 ? 'passageiro' : 'passageiros'}
              </p>
            </div>
          </div>
          
          {transportCost && (
            <div className="flex items-center gap-2 text-sm text-blue-800 bg-blue-100 rounded-lg p-3 mt-2">
              <TransportIcon className="size-4" />
              <span className="font-medium">{transportLabel}:</span>
              <span className="font-bold">R$ {transportCost.toLocaleString('pt-BR')}</span>
              <span className="text-blue-600">(total ida e volta)</span>
            </div>
          )}
          
          {transportError && (
            <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100 rounded-lg p-3 mt-2">
              <Info className="size-4" />
              <span>{transportError}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
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
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${isSelected 
                  ? `border-${option.color}-500 bg-${option.color}-50 ring-2 ring-${option.color}-200` 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg bg-${option.color}-100`}>
                    <Icon className={`size-5 text-${option.color}-600`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{option.label}</h4>
                      {isSelected && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${option.color}-100 text-${option.color}-700`}>
                          Selecionado
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {option.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Hotel className="size-4" />
                        <span>R$ {dailyAvg}/dia</span>
                      </div>
                      {transportCost && (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <TransportIcon className="size-4" />
                          <span>R$ {transportCost.toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-sm text-gray-500 mb-1">Total estimado</div>
                  <div className={`text-2xl font-bold text-${option.color}-600`}>
                    R$ {total.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Info className="size-4 mt-0.5 flex-shrink-0" />
          <p>
            Valores calculados dinamicamente baseados na origem, destino, época do ano, tipo de transporte e número de passageiros. 
            O custo real pode variar de acordo com disponibilidade e suas escolhas finais.
          </p>
        </div>
      </div>
    </div>
  );
}