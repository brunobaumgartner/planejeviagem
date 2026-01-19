import { useState, useEffect } from "react";
import { 
  MapPin, Calendar, DollarSign, Users, Plane, Hotel, Car, 
  Star, Cloud, Wind, Droplets, TrendingUp, Info, X 
} from "lucide-react";
import { getWeather, getCountryInfo, getExchangeRate, formatPrice, formatPopulation } from "@/services/api";

interface PackageDetailsProps {
  destination: string;
  country: string;
  price: number;
  onClose: () => void;
}

export function PackageDetails({ destination, country, price, onClose }: PackageDetailsProps) {
  const [weather, setWeather] = useState<any>(null);
  const [countryInfo, setCountryInfo] = useState<any>(null);
  const [exchangeRate, setExchangeRate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [destination, country]);

  async function loadData() {
    setLoading(true);
    
    try {
      // Buscar dados em paralelo
      const [weatherData, countryData, rateData] = await Promise.all([
        getWeather(destination),
        getCountryInfo(country),
        getExchangeRate('BRL', 'USD'),
      ]);

      setWeather(weatherData);
      setCountryInfo(countryData);
      setExchangeRate(rateData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg">Informações da Viagem</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Destination Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-sky-500" />
              <h3 className="text-xl">{destination}, {country}</h3>
            </div>
            {countryInfo && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <img src={countryInfo.flag} alt={country} className="w-6 h-4 object-cover rounded" />
                <span>{countryInfo.capital}</span>
                <span>•</span>
                <span>{formatPopulation(countryInfo.population)} habitantes</span>
              </div>
            )}
          </div>

          {/* Weather Section */}
          {loading ? (
            <div className="bg-sky-50 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-sky-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-sky-200 rounded w-2/3"></div>
            </div>
          ) : weather ? (
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Clima Atual</h4>
                <Cloud className="w-4 h-4 text-sky-600" />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-3xl font-bold text-sky-600">
                    {weather.temperature}°C
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {weather.description}
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Droplets className="w-3 h-3" />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Wind className="w-3 h-3" />
                    <span>{weather.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
              Informações de clima não disponíveis
            </div>
          )}

          {/* Currency Section */}
          {countryInfo && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Moeda Local</h4>
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {countryInfo.currencySymbol} {countryInfo.currency}
                  </div>
                  <div className="text-sm text-gray-600">
                    {countryInfo.currency} - Moeda oficial
                  </div>
                </div>
                {exchangeRate && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Câmbio aprox.</div>
                    <div className="text-sm font-medium text-gray-700">
                      R$ 1 = ${(1 / exchangeRate.rate).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Estimativa de Custos</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Passagem aérea</span>
                <span className="font-medium">{formatPrice(price * 0.4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hospedagem</span>
                <span className="font-medium">{formatPrice(price * 0.35)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Alimentação</span>
                <span className="font-medium">{formatPrice(price * 0.15)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Passeios e extras</span>
                <span className="font-medium">{formatPrice(price * 0.1)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total estimado</span>
                  <span className="text-xl font-bold text-sky-600">
                    {formatPrice(price)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">por pessoa</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {countryInfo && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="mb-1">
                    <strong>Idioma:</strong> {countryInfo.language}
                  </p>
                  <p className="mb-1">
                    <strong>Região:</strong> {countryInfo.region}
                  </p>
                  <p>
                    <strong>Fuso horário:</strong> {countryInfo.timezone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-2 pt-2">
            <button className="w-full bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600 transition-colors">
              Adicionar ao Planejamento
            </button>
            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Personalizar Pacote
            </button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
            <p>
              ℹ️ Valores aproximados. Podem variar conforme datas, 
              disponibilidade e cotação do dia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
