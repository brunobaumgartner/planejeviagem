import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { BudgetRecommendation } from "@/app/components/BudgetRecommendation";
import { CityAutocomplete } from "@/app/components/CityAutocomplete";
import type { TransportType, FlightClass, BusClass, Trip } from "@/types";

interface EditTripModalProps {
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
    transportPreferences?: {
      type: TransportType;
      flightClass?: FlightClass;
      busClass?: BusClass;
      passengers: number;
      origin: string;
    };
  }) => void;
  trip: Trip | null;
}

export function EditTripModal({ isOpen, onClose, onSubmit, trip }: EditTripModalProps) {
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [origin, setOrigin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetAmount, setBudgetAmount] = useState<number | undefined>();
  const [showRecommendation, setShowRecommendation] = useState(false);
  
  // Preferências de transporte
  const [transportType, setTransportType] = useState<TransportType>("flight");
  const [flightClass, setFlightClass] = useState<FlightClass>("economy");
  const [busClass, setBusClass] = useState<BusClass>("conventional");
  const [passengers, setPassengers] = useState<number>(1);
  
  // Preencher campos quando trip muda
  useEffect(() => {
    if (trip) {
      setDestination(trip.destination || "");
      setCountry(trip.country || "Brasil");
      setOrigin(trip.origin || "");
      setStartDate(trip.startDate || "");
      setEndDate(trip.endDate || "");
      setBudget(trip.budget || "");
      setBudgetAmount(trip.budgetAmount);
      
      // Preencher preferências de transporte
      if (trip.transportPreferences) {
        setTransportType(trip.transportPreferences.type || "flight");
        setFlightClass(trip.transportPreferences.flightClass || "economy");
        setBusClass(trip.transportPreferences.busClass || "conventional");
        setPassengers(trip.transportPreferences.passengers || 1);
      }
    }
  }, [trip]);
  
  // Verificar se podemos mostrar recomendação
  const canShowRecommendation = destination && startDate && endDate && origin;

  const handleBudgetSelect = (amount: number, budgetType: string) => {
    setBudget(`R$ ${amount.toLocaleString('pt-BR')}`);
    setBudgetAmount(amount);
  };
  
  // Extrair cidade e país do formato "Cidade, País"
  const parseLocation = (location: string) => {
    const parts = location.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      return {
        city: parts[0],
        country: parts[1]
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

    onSubmit({
      destination,
      country,
      origin,
      startDate,
      endDate,
      budget,
      budgetAmount,
      transportPreferences: {
        type: transportType,
        flightClass,
        busClass,
        passengers,
        origin: getCityName(origin),
      },
    });

    onClose();
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Editar Viagem</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CityAutocomplete
                value={origin}
                onChange={setOrigin}
                onSelect={setOrigin}
                label="Origem"
                placeholder="Ex: São Paulo, Brasil"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orçamento *
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="R$ 3.500"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Seção de Transporte */}
          <div className="bg-sky-50 rounded-xl p-4 space-y-4">
            <h3 className="font-medium text-gray-900">🚗 Preferências de Transporte</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transporte
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransportType("flight")}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
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
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
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
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
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
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classe do Voo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFlightClass("economy")}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        flightClass === "economy"
                          ? "border-sky-500 bg-sky-100 text-sky-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Econômica
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlightClass("business")}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        flightClass === "business"
                          ? "border-sky-500 bg-sky-100 text-sky-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Executiva
                    </button>
                  </div>
                </div>
              )}

              {transportType === "bus" && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Ônibus
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBusClass("conventional")}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        busClass === "conventional"
                          ? "border-sky-500 bg-sky-100 text-sky-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Convencional
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusClass("sleeper")}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        busClass === "sleeper"
                          ? "border-sky-500 bg-sky-100 text-sky-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Leito
                    </button>
                  </div>
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Passageiros
                </label>
                <input
                  type="number"
                  min="1"
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Mostrar recomendação de orçamento */}
          {canShowRecommendation && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowRecommendation(!showRecommendation)}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                {showRecommendation ? '✕ Ocultar' : '💡 Ver recomendação de orçamento atualizada'}
              </button>

              {showRecommendation && (
                <BudgetRecommendation
                  destination={getCityName(destination)}
                  country={country}
                  origin={getCityName(origin)}
                  startDate={startDate}
                  endDate={endDate}
                  transportType={transportType}
                  flightClass={flightClass}
                  busClass={busClass}
                  passengers={passengers}
                  onBudgetSelect={handleBudgetSelect}
                />
              )}
            </div>
          )}

          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              💡 <strong>Dica:</strong> Ao atualizar as datas, o orçamento será recalculado automaticamente se você usar a recomendação.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
