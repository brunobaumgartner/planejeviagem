import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plane,
  Search,
  MapPin,
  Filter,
  ExternalLink,
  X,
  DollarSign,
  Globe,
  Calendar,
  Loader2,
} from "lucide-react";
import { useNavigation } from "@/app/context/NavigationContext";
import { useAuth } from "@/app/context/AuthContext";
import { getCityCode } from "@/services/travelpayouts";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const TRAVELPAYOUTS_MARKER = "698211"; // TODO: Substituir pelo seu marker real

interface FlightResult {
  origin: string;
  destination: string;
  destination_name?: string;
  price: number;
  airline: string;
  flight_number?: number;
  departure_at: string;
  return_at: string;
  expires_at: string;
}

export function FlightSearchScreen() {
  const { setCurrentScreen } = useNavigation();
  const { user } = useAuth();

  // Estados
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [originCity, setOriginCity] = useState<string>("");
  const [destinationCity, setDestinationCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [departureDate, setDepartureDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  // Obter código da cidade de origem
  const originCode = user?.homeCity ? getCityCode(user.homeCity) : "SAO";

  // Buscar voos ao montar o componente
  useEffect(() => {
    searchFlights();
  }, []);

  // Função para buscar voos na API
  const searchFlights = async (useFilters = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        origin: originCity ? getCityCode(originCity) : originCode,
        limit: useFilters ? "1000" : "100",
      });

      // Adicionar filtros apenas se useFilters for true
      if (useFilters) {
        if (destinationCity) {
          params.append("destination", getCityCode(destinationCity));
        }
        if (departureDate) {
          params.append("departure_date", departureDate);
        }
        if (returnDate) {
          params.append("return_date", returnDate);
        }
      }

      console.log("[FlightSearch] ========================================");
      console.log("[FlightSearch] Iniciando busca de voos");
      console.log("[FlightSearch] Usando filtros:", useFilters);
      console.log("[FlightSearch] Código de origem:", originCity ? getCityCode(originCity) : originCode);
      console.log("[FlightSearch] Cidade do usuário:", user?.homeCity);
      console.log("[FlightSearch] Params:", Object.fromEntries(params));

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/travelpayouts/search?${params}`;
      console.log("[FlightSearch] URL (sem domínio):", `/functions/v1/make-server-5f5857fb/travelpayouts/search?${params}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      console.log("[FlightSearch] Status da resposta:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[FlightSearch] ❌ Erro na resposta:", errorData);
        throw new Error(errorData.error || errorData.details || "Erro ao buscar voos");
      }

      const data = await response.json();
      console.log("[FlightSearch] ✅ Dados recebidos:", {
        success: data.success,
        total: data.total,
        flightsLength: data.flights?.length,
        sampleFlight: data.flights?.[0]
      });

      setFlights(data.flights || []);
      
      if (!data.flights || data.flights.length === 0) {
        console.warn("[FlightSearch] ⚠️ Nenhum voo retornado pela API");
      }
      
      console.log("[FlightSearch] ========================================");
    } catch (err) {
      console.error("[FlightSearch] ❌ Exceção:", err);
      console.error("[FlightSearch] Stack:", err instanceof Error ? err.stack : 'N/A');
      setError(err instanceof Error ? err.message : "Erro ao buscar voos");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar voos localmente (apenas preço e busca por texto agora)
  const filteredFlights = flights.filter((flight) => {
    // Filtro de busca por texto (cidade de destino)
    const matchesSearch =
      searchQuery === "" ||
      flight.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.destination_name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtro de preço (sempre local)
    const matchesPrice =
      flight.price >= priceRange[0] && flight.price <= priceRange[1];

    return matchesSearch && matchesPrice;
  });

  // Limpar filtros
  const clearFilters = () => {
    setOriginCity("");
    setDestinationCity("");
    setSearchQuery("");
    setDepartureDate("");
    setReturnDate("");
    setPriceRange([0, 10000]);
    // Buscar voos novamente sem filtros
    searchFlights(false);
  };

  // Contar filtros ativos
  const activeFiltersCount =
    (originCity ? 1 : 0) +
    (destinationCity ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (departureDate ? 1 : 0) +
    (returnDate ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  // Gerar link de afiliado
  const generateFlightLink = (flight: FlightResult) => {
    const departureDate = flight.departure_at.split("T")[0];
    const returnDate = flight.return_at.split("T")[0];
    
    return `https://www.aviasales.com/search/${flight.origin}${departureDate}${flight.destination}${returnDate}1?marker=${TRAVELPAYOUTS_MARKER}`;
  };

  // Aplicar filtros
  const applyFilters = () => {
    searchFlights(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-sky-100 sticky top-0 z-20">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setCurrentScreen("home")}
              className="p-2 hover:bg-sky-50 rounded-xl transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                ✈️ Buscar Voos
              </h1>
              {user?.homeCity && (
                <p className="text-xs text-gray-600">
                  Saindo de{" "}
                  <span className="font-semibold text-sky-600">
                    {user.homeCity}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
            />
          </div>

          {/* Botão de Filtros */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                showFilters
                  ? "bg-sky-500 text-white"
                  : "bg-white border-2 border-sky-200 text-sky-600 hover:border-sky-400"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-sky-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
                Limpar
              </button>
            )}

            <div className="flex-1 text-right">
              <span className="text-sm text-gray-600">
                {filteredFlights.length}{" "}
                {filteredFlights.length === 1 ? "voo" : "voos"}
              </span>
            </div>
          </div>

          {/* Painel de Filtros */}
          {showFilters && (
            <div className="mt-3 p-4 bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-xl space-y-4">
              {/* Filtro de Origem */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  Cidade de origem
                </label>
                <input
                  type="text"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  placeholder={user?.homeCity || "São Paulo"}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe vazio para usar: {user?.homeCity || "São Paulo"}
                </p>
              </div>

              {/* Filtro de Destino */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  Cidade de destino
                </label>
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  placeholder="Ex: Rio de Janeiro, Paris, Nova York"
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              {/* Filtro de Data de Partida */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  Data de partida (exata)
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              {/* Filtro de Data de Retorno */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  Data de retorno (exata)
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              {/* Filtro de Preço */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <DollarSign className="w-4 h-4 text-sky-600" />
                  Preço (ida e volta)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">
                        Mínimo
                      </label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([
                            Number(e.target.value),
                            priceRange[1],
                          ])
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-sky-400"
                        placeholder="R$ 0"
                        min="0"
                        max={priceRange[1]}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">
                        Máximo
                      </label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            Number(e.target.value),
                          ])
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-sky-400"
                        placeholder="R$ 10.000"
                        min={priceRange[0]}
                        max="10000"
                      />
                    </div>
                  </div>
                  {/* Atalhos de preço */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setPriceRange([0, 2000])}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-sky-300 transition-colors"
                    >
                      Até R$ 2.000
                    </button>
                    <button
                      onClick={() => setPriceRange([2000, 5000])}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-sky-300 transition-colors"
                    >
                      R$ 2.000 - R$ 5.000
                    </button>
                    <button
                      onClick={() => setPriceRange([5000, 10000])}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-sky-300 transition-colors"
                    >
                      Acima de R$ 5.000
                    </button>
                  </div>
                </div>
              </div>

              {/* Botão Aplicar Filtros */}
              <button
                onClick={applyFilters}
                disabled={loading}
                className="w-full py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Buscar Voos
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Debug Info (remover em produção) */}
        {!loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-xs space-y-1">
            <p className="font-semibold text-yellow-900 mb-1">🔍 Debug Info:</p>
            <p className="text-yellow-800">Origem: {originCode} ({user?.homeCity || 'não definida'})</p>
            <p className="text-yellow-800">Voos carregados: {flights.length}</p>
            <p className="text-yellow-800">Voos filtrados: {filteredFlights.length}</p>
            <p className="text-yellow-800">URL: /functions/v1/make-server-5f5857fb/travelpayouts/search</p>
            
            {/* Mostrar exemplo de voo e por que foi filtrado */}
            {flights.length > 0 && (
              <div className="mt-2 pt-2 border-t border-yellow-300">
                <p className="font-semibold text-yellow-900 mb-1">Exemplo de voo (primeiro):</p>
                <p className="text-yellow-800">Código destino: {flights[0].destination}</p>
                <p className="text-yellow-800">Nome destino: {flights[0].destination_name || 'não mapeado'}</p>
                <p className="text-yellow-800">Companhia: {flights[0].airline}</p>
                <p className="text-yellow-800">Preço: R$ {flights[0].price}</p>
                <p className="text-yellow-800">Data partida: {flights[0].departure_at}</p>
                <p className="text-yellow-800">Data retorno: {flights[0].return_at}</p>
                
                <p className="font-semibold text-yellow-900 mt-2 mb-1">Filtros ativos:</p>
                <p className="text-yellow-800">Origem: {originCity || (user?.homeCity || "SAO")}</p>
                <p className="text-yellow-800">Destino: {destinationCity || "Qualquer"}</p>
                <p className="text-yellow-800">Busca por texto: "{searchQuery}" (vazio = passa)</p>
                <p className="text-yellow-800">Data de partida: {departureDate || "Qualquer"}</p>
                <p className="text-yellow-800">Data de retorno: {returnDate || "Qualquer"}</p>
                <p className="text-yellow-800">Preço: R$ {priceRange[0]} - R$ {priceRange[1]}</p>
                
                <p className="font-semibold text-yellow-900 mt-2 mb-1">Testes do primeiro voo:</p>
                <p className="text-yellow-800">
                  ✓ Passa busca por texto: {
                    searchQuery === "" ||
                    flights[0].destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    flights[0].destination_name?.toLowerCase().includes(searchQuery.toLowerCase())
                      ? "SIM"
                      : "NÃO"
                  }
                </p>
                <p className="text-yellow-800">
                  ✓ Passa preço: {
                    flights[0].price >= priceRange[0] && flights[0].price <= priceRange[1]
                      ? "SIM (preço ok)"
                      : `NÃO (${flights[0].price} não está entre ${priceRange[0]} e ${priceRange[1]})`
                  }
                </p>
                <p className="text-yellow-800">
                  ✓ Passa data de partida: {
                    !departureDate || flights[0].departure_at.split("T")[0] >= departureDate
                      ? "SIM"
                      : `NÃO (voo em ${flights[0].departure_at.split("T")[0]}, filtro a partir de ${departureDate})`
                  }
                </p>
                <p className="text-yellow-800">
                  ✓ Passa data de retorno: {
                    !returnDate || flights[0].return_at.split("T")[0] <= returnDate
                      ? "SIM"
                      : `NÃO (voo em ${flights[0].return_at.split("T")[0]}, filtro até ${returnDate})`
                  }
                </p>
              </div>
            )}
            
            {error && <p className="text-red-600 font-semibold mt-1">❌ Erro: {error}</p>}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Buscando voos disponíveis...</p>
          </div>
        )}

        {/* Erro */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 font-medium mb-2">Erro ao buscar voos</p>
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button
              onClick={searchFlights}
              className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Sem resultados */}
        {!loading && !error && filteredFlights.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Nenhum voo encontrado
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {activeFiltersCount > 0
                ? "Tente ajustar os filtros para ver mais resultados"
                : "Não há voos disponíveis no momento"}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Lista de Voos */}
        {!loading && !error && filteredFlights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlights.map((flight, index) => {
              const link = generateFlightLink(flight);
              const departureDate = new Date(flight.departure_at).toLocaleDateString("pt-BR");
              const returnDate = new Date(flight.return_at).toLocaleDateString("pt-BR");

              return (
                <a
                  key={`${flight.destination}-${index}`}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-2 border-sky-200 rounded-2xl p-4 hover:border-sky-400 hover:shadow-lg transition-all group"
                >
                  {/* Destino */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {/* Nome da cidade (grande) */}
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {flight.destination_name || flight.destination}
                      </h3>
                      {/* Código do aeroporto (pequeno) */}
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        Aeroporto: {flight.destination}
                      </p>
                      {/* Companhia aérea */}
                      <p className="text-xs text-gray-600 font-medium">
                        {flight.airline}
                      </p>
                    </div>
                    <Plane className="w-5 h-5 text-sky-500 transform group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>

                  {/* Datas */}
                  <div className="bg-gray-50 rounded-lg p-2 mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Ida: {departureDate}</span>
                      <span>Volta: {returnDate}</span>
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-1">A partir de</p>
                    <p className="text-2xl font-bold text-sky-600">
                      R$ {flight.price.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-gray-500">ida e volta</p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sky-600 font-semibold group-hover:text-sky-700">
                      Ver detalhes
                    </span>
                    <ExternalLink className="w-4 h-4 text-sky-500" />
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Rodapé informativo */}
      {!loading && !error && filteredFlights.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
            <p className="text-xs text-gray-600 text-center">
              💡 Os preços são atualizados regularmente pela Travelpayouts. Clique
              em "Ver detalhes" para conferir disponibilidade e condições.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}