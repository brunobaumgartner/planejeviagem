// Serviço para integração com APIs gratuitas

/**
 * APIs GRATUITAS DISPONÍVEIS:
 * 
 * 1. OpenWeatherMap - Clima e temperatura
 *    https://openweathermap.org/api
 *    Limite: 1000 calls/dia (grátis)
 * 
 * 2. REST Countries - Informações de países
 *    https://restcountries.com/
 *    Sem limite, totalmente gratuito
 * 
 * 3. Exchange Rate API - Cotação de moedas
 *    https://www.exchangerate-api.com/
 *    Limite: 1500 calls/mês (grátis)
 * 
 * 4. Nominatim (OpenStreetMap) - Geocoding
 *    https://nominatim.org/
 *    Gratuito, com rate limit
 * 
 * 5. Unsplash - Imagens de alta qualidade
 *    Já integrado via unsplash_tool
 */

// ==================== CLIMA ====================

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export async function getWeather(city: string): Promise<WeatherData | null> {
  try {
    // IMPORTANTE: Substitua YOUR_API_KEY pela sua chave da OpenWeatherMap
    // Obtenha grátis em: https://openweathermap.org/api
    const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`
    );
    
    if (!response.ok) {
      throw new Error('Falha ao buscar clima');
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };
  } catch (error) {
    console.error('Erro ao buscar clima:', error);
    return null;
  }
}

// ==================== PAÍSES ====================

interface CountryInfo {
  name: string;
  capital: string;
  population: number;
  currency: string;
  currencySymbol: string;
  language: string;
  flag: string;
  region: string;
  timezone: string;
}

export async function getCountryInfo(countryName: string): Promise<CountryInfo | null> {
  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${countryName}?fullText=false`
    );
    
    if (!response.ok) {
      throw new Error('Falha ao buscar informações do país');
    }
    
    const data = await response.json();
    const country = data[0];
    
    const currency = Object.values(country.currencies)[0] as any;
    const language = Object.values(country.languages)[0] as string;
    
    return {
      name: country.name.common,
      capital: country.capital?.[0] || '',
      population: country.population,
      currency: Object.keys(country.currencies)[0],
      currencySymbol: currency.symbol,
      language: language,
      flag: country.flags.svg,
      region: country.region,
      timezone: country.timezones[0],
    };
  } catch (error) {
    console.error('Erro ao buscar informações do país:', error);
    return null;
  }
}

// ==================== CÂMBIO ====================

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdate: string;
}

export async function getExchangeRate(from: string = 'USD', to: string = 'BRL'): Promise<ExchangeRate | null> {
  try {
    // IMPORTANTE: Substitua YOUR_API_KEY pela sua chave da ExchangeRate-API
    // Obtenha grátis em: https://www.exchangerate-api.com/
    const API_KEY = 'YOUR_EXCHANGERATE_API_KEY';
    
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${from}/${to}`
    );
    
    if (!response.ok) {
      throw new Error('Falha ao buscar taxa de câmbio');
    }
    
    const data = await response.json();
    
    return {
      from: from,
      to: to,
      rate: data.conversion_rate,
      lastUpdate: data.time_last_update_utc,
    };
  } catch (error) {
    console.error('Erro ao buscar taxa de câmbio:', error);
    return null;
  }
}

// ==================== GEOCODING ====================

interface Location {
  lat: number;
  lon: number;
  displayName: string;
  country: string;
}

export async function geocodeCity(city: string): Promise<Location | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'PlanejeFacil/1.0', // Necessário para Nominatim
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Falha ao buscar localização');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      return null;
    }
    
    const location = data[0];
    
    return {
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      displayName: location.display_name,
      country: location.display_name.split(',').pop()?.trim() || '',
    };
  } catch (error) {
    console.error('Erro ao buscar localização:', error);
    return null;
  }
}

// ==================== MOCK DATA (para desenvolvimento) ====================

export const mockWeather: WeatherData = {
  temperature: 28,
  description: 'céu limpo',
  icon: '01d',
  humidity: 65,
  windSpeed: 5.2,
};

export const mockExchangeRate: ExchangeRate = {
  from: 'USD',
  to: 'BRL',
  rate: 5.45,
  lastUpdate: new Date().toISOString(),
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Converte preço de uma moeda para outra
 */
export function convertCurrency(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Formata preço em moeda local
 */
export function formatPrice(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Formata número de população
 */
export function formatPopulation(population: number): string {
  if (population >= 1000000) {
    return `${(population / 1000000).toFixed(1)}M`;
  } else if (population >= 1000) {
    return `${(population / 1000).toFixed(0)}K`;
  }
  return population.toString();
}

/**
 * Obtém URL do ícone do clima
 */
export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

// ==================== EXEMPLO DE USO ====================

/**
 * Exemplo de como usar as APIs:
 * 
 * import { getWeather, getCountryInfo, getExchangeRate } from '@/services/api';
 * 
 * // Buscar clima
 * const weather = await getWeather('Paris');
 * console.log(`Temperatura em Paris: ${weather?.temperature}°C`);
 * 
 * // Buscar informações do país
 * const country = await getCountryInfo('France');
 * console.log(`Moeda: ${country?.currency} (${country?.currencySymbol})`);
 * 
 * // Buscar taxa de câmbio
 * const rate = await getExchangeRate('EUR', 'BRL');
 * console.log(`1 EUR = ${rate?.rate} BRL`);
 */
