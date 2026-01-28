import { X, Globe, DollarSign, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { BudgetRecommendation } from "@/app/components/BudgetRecommendation";
import { CityAutocomplete } from "@/app/components/CityAutocomplete";
import { CurrencyConverter } from "@/app/components/CurrencyConverter";
import { CulturalGuide } from "@/app/components/CulturalGuide";
import type { TransportType, FlightClass, BusClass, Country } from "@/types";
import { searchCountries, getCountryByCode } from "@/services/internationalService";

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tripData: {
    destination: string;
    country?: string;
    origin?: string;
    startDate: string;
    endDate: string;
    budget: string;
    budgetAmount?: number;
    // Campos internacionais
    isInternational?: boolean;
    countryCode?: string;
    destinationCurrency?: string;
    exchangeRate?: number;
    budgetInLocalCurrency?: number;
    transportPreferences?: {
      type: TransportType;
      flightClass?: FlightClass;
      busClass?: BusClass;
      passengers: number;
      origin: string;
    };
    tasks: Array<{ id: string; text: string; completed: boolean }>;
  }) => void;
}

export function AddTripModal({ isOpen, onClose, onSubmit }: AddTripModalProps) {
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [originCountry, setOriginCountry] = useState("Brasil");
  const [origin, setOrigin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetAmount, setBudgetAmount] = useState<number | undefined>();
  const [showRecommendation, setShowRecommendation] = useState(false);
  
  // Estados internacionais
  const [isInternational, setIsInternational] = useState(false);
  const [destinationCountryData, setDestinationCountryData] = useState<Country | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [budgetInLocalCurrency, setBudgetInLocalCurrency] = useState<number | null>(null);
  const [showCulturalGuide, setShowCulturalGuide] = useState(false);
  const [currency, setCurrency] = useState<string | null>(null);
  
  // Preferências de transporte
  const [transportType, setTransportType] = useState<TransportType>("flight");
  const [flightClass, setFlightClass] = useState<FlightClass>("economy");
  const [busClass, setBusClass] = useState<BusClass>("conventional");
  const [passengers, setPassengers] = useState<number>(1);
  
  // Verificar se podemos mostrar recomendação
  const canShowRecommendation = origin && destination && startDate && endDate && transportType;

  // Preencher com dados da sugestão do localStorage
  useEffect(() => {
    if (isOpen) {
      const suggestionData = localStorage.getItem('trip_suggestion');
      if (suggestionData) {
        try {
          const suggestion = JSON.parse(suggestionData);
          if (suggestion.destination) {
            setDestination(suggestion.destination);
            // Extrair país do destino
            const parts = suggestion.destination.split(',').map((p: string) => p.trim());
            if (parts.length >= 2) {
              setCountry(parts[1]);
            }
          }
          if (suggestion.budget) {
            setBudget(`R$ ${suggestion.budget.toLocaleString('pt-BR')}`);
            setBudgetAmount(suggestion.budget);
          }
          if (suggestion.days) {
            // Calcular datas baseado em dias
            const today = new Date();
            const start = new Date(today);
            start.setDate(today.getDate() + 7); // Viagem daqui 1 semana
            const end = new Date(start);
            end.setDate(start.getDate() + suggestion.days);
            
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end.toISOString().split('T')[0]);
          }
          // Limpar após preencher
          localStorage.removeItem('trip_suggestion');
        } catch (error) {
          console.error('Erro ao ler sugestão:', error);
        }
      }
    }
  }, [isOpen]);

  // Detectar automaticamente se é viagem internacional
  useEffect(() => {
    const isIntl = originCountry.toLowerCase() !== country.toLowerCase();
    setIsInternational(isIntl);
    
    console.log('[AddTripModal] 🌍 Verificando viagem:');
    console.log('  - Origem:', origin, '| País origem:', originCountry);
    console.log('  - Destino:', destination, '| País destino:', country);
    console.log('  - É internacional?', isIntl);
    
    // Se for internacional, buscar dados do país de DESTINO
    if (isIntl && country) {
      console.log('[AddTripModal] ✈️ Carregando dados do país de destino:', country);
      loadCountryData(country);
    } else {
      setDestinationCountryData(null);
    }
  }, [originCountry, country]);

  // Atualizar moeda quando destinationCountryData mudar
  useEffect(() => {
    if (destinationCountryData && destinationCountryData.currencies) {
      const currencyCode = Object.keys(destinationCountryData.currencies)[0];
      console.log('[AddTripModal] 💵 Moeda do país de destino:', currencyCode);
      setCurrency(currencyCode);
    } else {
      setCurrency(null);
    }
  }, [destinationCountryData]);

  async function loadCountryData(countryName: string) {
    try {
      // Não buscar se for vazio ou muito curto
      if (!countryName || countryName.trim().length < 3) {
        return;
      }

      // Lista de estados brasileiros - não buscar como país
      const brazilianStates = [
        'acre', 'alagoas', 'amapá', 'amazonas', 'bahia', 'ceará', 
        'distrito federal', 'espírito santo', 'goiás', 'maranhão', 
        'mato grosso', 'mato grosso do sul', 'minas gerais', 'pará', 
        'paraíba', 'paraná', 'pernambuco', 'piauí', 'rio de janeiro', 
        'rio grande do norte', 'rio grande do sul', 'rondônia', 'roraima', 
        'santa catarina', 'são paulo', 'sergipe', 'tocantins'
      ];

      const normalizedCountry = countryName.toLowerCase().trim();
      
      // Se for estado brasileiro, não buscar
      if (brazilianStates.includes(normalizedCountry)) {
        console.log('[AddTripModal] ℹ️ Estado brasileiro detectado, mantendo como Brasil');
        setDestinationCountryData(null);
        return;
      }

      console.log('[AddTripModal] Buscando dados do país:', countryName);
      
      // Primeiro busca para encontrar o código do país
      const results = await searchCountries(countryName);
      
      if (results.length > 0) {
        // Agora busca os dados completos usando o código
        const fullCountryData = await getCountryByCode(results[0].code);
        console.log('[AddTripModal] ✅ Dados completos do país:', fullCountryData);
        setDestinationCountryData(fullCountryData);
      } else {
        // Silenciosamente não fazer nada se não encontrar
        console.log('[AddTripModal] ℹ️ País não encontrado, mantendo como doméstico');
        setDestinationCountryData(null);
      }
    } catch (error) {
      // Silenciosamente tratar erro
      console.log('[AddTripModal] ℹ️ Erro ao buscar país, mantendo como doméstico');
      setDestinationCountryData(null);
    }
  }

  const handleBudgetSelect = (amount: number, budgetType: string) => {
    setBudget(`R$ ${amount.toLocaleString('pt-BR')}`);
    setBudgetAmount(amount);
  };
  
  // Parsear orçamento automaticamente quando usuário digita
  useEffect(() => {
    if (budget) {
      // Remover tudo exceto números
      const numericValue = budget.replace(/[^\d]/g, '');
      const amount = parseInt(numericValue);
      
      console.log('[AddTripModal] 💰 Parsing orçamento:');
      console.log('  - Input original:', budget);
      console.log('  - Valor numérico extraído:', numericValue);
      console.log('  - Parseado como int:', amount);
      console.log('  - É válido?', amount > 0 && !isNaN(amount));
      
      if (amount > 0 && !isNaN(amount)) {
        console.log('[AddTripModal] ✅ Orçamento parseado com sucesso:', amount);
        setBudgetAmount(amount);
      } else {
        console.log('[AddTripModal] ❌ Orçamento inválido');
        setBudgetAmount(undefined);
      }
    } else {
      setBudgetAmount(undefined);
    }
  }, [budget]);
  
  // Log para debug do estado de câmbio
  useEffect(() => {
    console.log('[AddTripModal] 💱 Estado de Câmbio:');
    console.log('  - currency:', currency);
    console.log('  - budgetAmount:', budgetAmount);
    console.log('  - destinationCountryData:', destinationCountryData ? 'OK' : 'NULL');
    console.log('  - Deve mostrar conversor?', !!(currency && budgetAmount));
  }, [currency, budgetAmount, destinationCountryData]);
  
  // Extrair cidade e país do formato "Cidade, País"
  const parseLocation = (location: string) => {
    const parts = location.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      return {
        city: parts[0],
        country: parts.at(-1)
      };
    }
    return {
      city: location,
      country: "Brasil"
    };
  };
  
  // Atualizar destino e extrair país automaticamente
  const handleDestinationSelect = (value: string) => {
    setDestination(value);
    const { country: extractedCountry } = parseLocation(value);
    setCountry(extractedCountry);
  };

  // Atualizar origem e extrair país automaticamente
  const handleOriginSelect = (value: string) => {
    setOrigin(value);
    const { country: extractedCountry } = parseLocation(value);
    setOriginCountry(extractedCountry);
  };
  
  // Função auxiliar para obter apenas o nome da cidade
  const getCityName = (location: string) => {
    return parseLocation(location).city;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !origin || !startDate || !endDate || !budget) {
      alert("Por favor, preencha todos os campos obrigatórios (Destino, Origem, Datas e Orçamento)");
      return;
    }

    // Tarefas padrão (diferentes para internacional vs nacional)
    const defaultTasks = isInternational ? [
      { id: "1", text: "Verificar visto e passaporte", completed: false },
      { id: "2", text: "Pesquisar voos internacionais", completed: false },
      { id: "3", text: "Contratar seguro viagem", completed: false },
      { id: "4", text: "Reservar hotel", completed: false },
      { id: "5", text: "Planejar roteiro turístico", completed: false },
    ] : [
      { id: "1", text: "Pesquisar voos", completed: false },
      { id: "2", text: "Pesquisar hotéis", completed: false },
      { id: "3", text: "Planejar roteiro", completed: false },
    ];

    onSubmit({
      destination,
      country,
      origin,
      startDate,
      endDate,
      budget,
      budgetAmount,
      isInternational,
      countryCode: destinationCountryData?.cca2,
      destinationCurrency: currency,
      exchangeRate: exchangeRate || undefined,
      budgetInLocalCurrency: budgetInLocalCurrency || undefined,
      transportPreferences: {
        type: transportType,
        flightClass,
        busClass,
        passengers,
        origin: getCityName(origin),
      },
      tasks: defaultTasks,
    });

    // Limpar formulário
    setDestination("");
    setCountry("Brasil");
    setOriginCountry("Brasil");
    setOrigin("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    setBudgetAmount(undefined);
    setShowRecommendation(false);
    setIsInternational(false);
    setDestinationCountryData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header fixo com padding mobile-friendly */}
        <div className="sticky top-0 bg-white z-10 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-xl font-semibold">Nova Viagem</h2>
              {isInternational && (
                <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span className="hidden sm:inline">Internacional</span>
                  <span className="sm:hidden">Intl</span>
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo com padding mobile-friendly */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <CityAutocomplete
                value={origin}
                onChange={setOrigin}
                onSelect={handleOriginSelect}
                label="Origem"
                placeholder="Ex: São Paulo, Brasil"
                required
              />
            </div>

            <div>
              <CityAutocomplete
                value={destination}
                onChange={setDestination}
                onSelect={handleDestinationSelect}
                label="Destino"
                placeholder="Ex: Rio de Janeiro, Brasil"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Data de Início *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Data Final *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Orçamento *
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="R$ 3.500"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
              />
              
              {/* Botão de Recomendação de Orçamento */}
              {canShowRecommendation && (
                <div className="mt-2">
                  {!showRecommendation ? (
                    <button
                      type="button"
                      onClick={() => setShowRecommendation(true)}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-lg transition-all font-medium shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <span className="text-lg">💰</span>
                      <span className="hidden sm:inline">Calcular orçamento recomendado</span>
                      <span className="sm:hidden">Calcular orçamento</span>
                    </button>
                  ) : (
                    <BudgetRecommendation
                      origin={origin ? getCityName(origin) : "São Paulo"}
                      destination={getCityName(destination)}
                      startDate={startDate}
                      endDate={endDate}
                      transportType={transportType}
                      flightClass={flightClass}
                      busClass={busClass}
                      passengers={passengers}
                      onBudgetSelect={handleBudgetSelect}
                      onClose={() => setShowRecommendation(false)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* SEÇÃO INTERNACIONAL */}
            {isInternational && destinationCountryData && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                {/* Header Internacional */}
                <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl sm:text-4xl">{destinationCountryData.flag}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 truncate">
                        Viagem para {destinationCountryData.name.common}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="truncate">
                          <span className="font-medium">Capital:</span> {destinationCountryData.capital?.[0] || 'N/A'}
                        </div>
                        <div className="truncate">
                          <span className="font-medium">Moeda:</span> {currency ? destinationCountryData.currencies?.[currency]?.name : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversor de Moeda */}
                {currency && budgetAmount && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-indigo-600" />
                      <h4 className="text-sm font-semibold text-gray-900">Conversão de Moeda</h4>
                    </div>
                    
                    {/* Orçamento Total Convertido - Destaque */}
                    {budgetInLocalCurrency && exchangeRate && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Seu orçamento em {currency}</p>
                          <p className="text-3xl font-bold text-green-700">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: currency,
                            }).format(budgetInLocalCurrency)}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            R$ {budgetAmount.toLocaleString('pt-BR')} × {exchangeRate.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Conversor Interativo */}
                    <CurrencyConverter
                      from="BRL"
                      to={currency}
                      amount={budgetAmount}
                      onConvert={(result) => {
                        setExchangeRate(result.rate);
                        setBudgetInLocalCurrency(result.converted);
                      }}
                      compact={true}
                    />
                  </div>
                )}

                {/* Alerta de documentação */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-yellow-800">
                    <strong>⚠️ Importante:</strong> Verifique se você precisa de visto e se seu passaporte está válido para entrar em {destinationCountryData.name.common}.
                  </p>
                </div>
              </div>
            )}

            {/* Preferências de Transporte */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                🚗 Preferências de Transporte
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Transporte
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTransportType("flight")}
                      className={`px-2 sm:px-4 py-3 rounded-xl border-2 transition-all text-xs sm:text-sm ${
                        transportType === "flight"
                          ? "border-sky-500 bg-sky-100 text-sky-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      ✈️ Avião
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportType("bus")}
                      className={`px-2 sm:px-4 py-3 rounded-xl border-2 transition-all text-xs sm:text-sm ${
                        transportType === "bus"
                          ? "border-sky-500 bg-sky-100 text-sky-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      🚌 Ônibus
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportType("car")}
                      className={`px-2 sm:px-4 py-3 rounded-xl border-2 transition-all text-xs sm:text-sm ${
                        transportType === "car"
                          ? "border-sky-500 bg-sky-100 text-sky-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      🚗 Carro
                    </button>
                  </div>
                </div>

                {transportType === "flight" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Classe do Voo
                    </label>
                    <select
                      value={flightClass}
                      onChange={(e) => setFlightClass(e.target.value as FlightClass)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-base"
                    >
                      <option value="economy">Econômica</option>
                      <option value="premium_economy">Econômica Premium</option>
                      <option value="business">Executiva</option>
                      <option value="first">Primeira Classe</option>
                    </select>
                  </div>
                )}

                {transportType === "bus" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Classe do Ônibus
                    </label>
                    <select
                      value={busClass}
                      onChange={(e) => setBusClass(e.target.value as BusClass)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-base"
                    >
                      <option value="conventional">Convencional</option>
                      <option value="semi_leito">Semi-Leito</option>
                      <option value="leito">Leito</option>
                      <option value="executive">Executivo</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Passageiros
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="bg-sky-50 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-700">
                💡 <strong>Dica:</strong> Algumas tarefas básicas já serão adicionadas à sua viagem. Você pode personalizá-las depois!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-base font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:flex-1 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors text-base font-medium"
              >
                Criar Viagem
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}