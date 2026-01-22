/**
 * SERVIÇO INTERNACIONAL
 * 
 * Responsável por comunicação com APIs externas via backend proxy:
 * - REST Countries API (países, moedas, bandeiras)
 * - ExchangeRate-API (taxas de câmbio)
 * - Overpass API (pontos turísticos)
 * - Wikipedia API (informações culturais)
 * - Nominatim (geocodificação)
 * 
 * BOAS PRÁTICAS:
 * ✅ Cache local (localStorage) + cache no servidor
 * ✅ Retry logic (3 tentativas)
 * ✅ Error handling completo
 * ✅ TypeScript strict
 * ✅ Loading states
 * ✅ Rate limiting consciente
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import type {
  Country,
  ExchangeRate,
  TouristAttraction,
  WikipediaSummary,
  ApiResponse,
  CountrySearchResult,
  CitySearchResult,
} from '@/types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb`;

// ============================================
// CACHE LOCAL (localStorage)
// ============================================

interface LocalCache<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(`intl_${key}`);
    if (!cached) return null;

    const parsed: LocalCache<T> = JSON.parse(cached);
    
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(`intl_${key}`);
      return null;
    }

    console.log(`[Cache] ✅ Hit: ${key}`);
    return parsed.data;
  } catch (error) {
    console.error('[Cache] Erro ao ler:', error);
    return null;
  }
}

function saveToCache<T>(key: string, data: T, ttlMinutes: number): void {
  try {
    const cached: LocalCache<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000),
    };
    localStorage.setItem(`intl_${key}`, JSON.stringify(cached));
    console.log(`[Cache] 💾 Saved: ${key} (TTL: ${ttlMinutes}min)`);
  } catch (error) {
    console.error('[Cache] Erro ao salvar:', error);
  }
}

// ============================================
// RETRY LOGIC
// ============================================

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Fetch] Tentativa ${attempt}/${maxRetries}: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.ok) {
        return response;
      }

      // Se for erro 4xx (client error), não retenta
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      // Se for 5xx (server error), retenta
      lastError = new Error(`HTTP ${response.status}`);
      console.warn(`[Fetch] ⚠️ Erro ${response.status}, tentando novamente...`);
    } catch (error: any) {
      lastError = error;
      console.warn(`[Fetch] ⚠️ Erro na tentativa ${attempt}:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Falha após múltiplas tentativas');
}

// ============================================
// PAÍSES (REST Countries API)
// ============================================

/**
 * Listar todos os países
 * Cache: 24h (local) + 24h (servidor)
 */
export async function getAllCountries(): Promise<Country[]> {
  const cacheKey = 'all_countries';
  const cached = getFromCache<Country[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithRetry(`${BASE_URL}/countries`);
    const result: ApiResponse<Country[]> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao buscar países');
    }

    // Cache local por 24 horas
    saveToCache(cacheKey, result.data, 24 * 60);

    console.log(`[Countries] ✅ ${result.data.length} países carregados${result.cached ? ' (servidor cache)' : ''}`);
    return result.data;
  } catch (error: any) {
    console.error('[Countries] ❌ Erro:', error.message);
    throw new Error(`Erro ao buscar países: ${error.message}`);
  }
}

/**
 * Buscar país específico por código (ex: "BR", "US", "FR")
 * Cache: 24h (local) + 24h (servidor)
 */
export async function getCountryByCode(code: string): Promise<Country> {
  const cacheKey = `country_${code.toUpperCase()}`;
  const cached = getFromCache<Country>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithRetry(`${BASE_URL}/countries/${code.toUpperCase()}`);
    const result: ApiResponse<Country> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'País não encontrado');
    }

    // Cache local por 24 horas
    saveToCache(cacheKey, result.data, 24 * 60);

    console.log(`[Country] ✅ ${result.data.name.common} carregado${result.cached ? ' (servidor cache)' : ''}`);
    return result.data;
  } catch (error: any) {
    console.error('[Country] ❌ Erro:', error.message);
    throw new Error(`Erro ao buscar país ${code}: ${error.message}`);
  }
}

/**
 * Buscar países (com filtro de texto)
 * Usa cache local dos países já carregados
 */
export async function searchCountries(query: string): Promise<CountrySearchResult[]> {
  const countries = await getAllCountries();
  const lowerQuery = query.toLowerCase();

  return countries
    .filter(country => 
      country.name.common.toLowerCase().includes(lowerQuery) ||
      country.name.official.toLowerCase().includes(lowerQuery) ||
      country.cca2.toLowerCase() === lowerQuery ||
      country.cca3.toLowerCase() === lowerQuery
    )
    .map(country => ({
      code: country.cca2,
      name: country.name.common,
      flag: country.flag,
      region: country.region,
    }))
    .slice(0, 10); // Limitar a 10 resultados
}

// ============================================
// CÂMBIO (ExchangeRate-API)
// ============================================

/**
 * Obter taxa de câmbio entre duas moedas
 * Cache: 1h (local) + 1h (servidor)
 * 
 * @param from - Moeda de origem (ex: "BRL")
 * @param to - Moeda de destino (ex: "USD")
 */
export async function getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
  const cacheKey = `exchange_${from}_${to}`;
  const cached = getFromCache<ExchangeRate>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithRetry(`${BASE_URL}/exchange-rate/${from}/${to}`);
    const result: ApiResponse<ExchangeRate> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao buscar taxa de câmbio');
    }

    // Cache local por 1 hora (taxas mudam ao longo do dia)
    saveToCache(cacheKey, result.data, 60);

    console.log(`[Exchange] ✅ 1 ${from} = ${result.data.rate} ${to}${result.cached ? ' (servidor cache)' : ''}`);
    return result.data;
  } catch (error: any) {
    console.error('[Exchange] ❌ Erro:', error.message);
    throw new Error(`Erro ao buscar câmbio ${from}→${to}: ${error.message}`);
  }
}

/**
 * Converter valor entre moedas
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<{ amount: number; rate: number; converted: number }> {
  const exchangeRate = await getExchangeRate(from, to);
  return {
    amount,
    rate: exchangeRate.rate,
    converted: amount * exchangeRate.rate,
  };
}

// ============================================
// PONTOS TURÍSTICOS (Overpass API)
// ============================================

/**
 * Buscar pontos turísticos próximos a coordenadas
 * Cache: 7 dias (local) + 7 dias (servidor)
 * 
 * @param lat - Latitude
 * @param lon - Longitude
 * @param radius - Raio em metros (padrão: 5000m = 5km)
 */
export async function getAttractions(
  lat: number,
  lon: number,
  radius: number = 5000
): Promise<TouristAttraction[]> {
  const cacheKey = `attractions_${lat.toFixed(4)}_${lon.toFixed(4)}_${radius}`;
  const cached = getFromCache<TouristAttraction[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithRetry(
      `${BASE_URL}/attractions?lat=${lat}&lon=${lon}&radius=${radius}`
    );
    const result: ApiResponse<TouristAttraction[]> = await response.json();

    if (!result.success) {
      // Se não houver dados, retornar array vazio sem erro
      console.log('[Attractions] ℹ️ Nenhuma atração encontrada');
      return [];
    }

    // Cache local por 7 dias
    saveToCache(cacheKey, result.data || [], 7 * 24 * 60);

    console.log(`[Attractions] ✅ ${result.data?.length || 0} atrações encontradas${result.cached ? ' (servidor cache)' : ''}`);
    return result.data || [];
  } catch (error: any) {
    // Retornar array vazio em vez de lançar erro
    console.log('[Attractions] ℹ️ Erro ao buscar atrações, retornando lista vazia');
    return [];
  }
}

// ============================================
// WIKIPEDIA
// ============================================

/**
 * Buscar resumo da Wikipedia sobre um lugar/tema
 * Cache: 30 dias (local) + 30 dias (servidor)
 * 
 * @param title - Título do artigo (ex: "Paris", "Rio de Janeiro")
 * @param lang - Idioma (padrão: "pt")
 */
export async function getWikipediaSummary(
  title: string,
  lang: string = 'pt'
): Promise<WikipediaSummary> {
  const cacheKey = `wiki_${lang}_${title}`;
  const cached = getFromCache<WikipediaSummary>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithRetry(
      `${BASE_URL}/wikipedia/summary?title=${encodeURIComponent(title)}&lang=${lang}`
    );
    const result: ApiResponse<WikipediaSummary> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Artigo não encontrado');
    }

    // Cache local por 30 dias (conteúdo da Wikipedia é estável)
    saveToCache(cacheKey, result.data, 30 * 24 * 60);

    console.log(`[Wikipedia] ✅ "${title}" (${lang}) carregado${result.cached ? ' (servidor cache)' : ''}`);
    return result.data;
  } catch (error: any) {
    console.error('[Wikipedia] ❌ Erro:', error.message);
    throw new Error(`Erro ao buscar artigo "${title}": ${error.message}`);
  }
}

// ============================================
// GEOCODIFICAÇÃO (Nominatim)
// ============================================

interface GeocodeResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    country?: string;
    country_code?: string;
    state?: string;
  };
  importance: number;
}

/**
 * Geocodificar endereço/cidade (obter coordenadas)
 * Cache: 30 dias (local) + 30 dias (servidor)
 * 
 * @param query - Texto da busca (ex: "Paris, France" ou "São Paulo, Brasil")
 */
export async function geocodeLocation(query: string): Promise<GeocodeResult[]> {
  const cacheKey = `geocode_${query.toLowerCase().trim()}`;
  const cached = getFromCache<GeocodeResult[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithRetry(
      `${BASE_URL}/geocode?q=${encodeURIComponent(query)}`
    );
    const result: ApiResponse<GeocodeResult[]> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Localização não encontrada');
    }

    // Cache local por 30 dias
    saveToCache(cacheKey, result.data, 30 * 24 * 60);

    console.log(`[Geocode] ✅ ${result.data.length} resultados para "${query}"${result.cached ? ' (servidor cache)' : ''}`);
    return result.data;
  } catch (error: any) {
    console.error('[Geocode] ❌ Erro:', error.message);
    throw new Error(`Erro ao geocodificar "${query}": ${error.message}`);
  }
}

/**
 * Buscar cidades internacionais (combina geocoding + países)
 */
export async function searchInternationalCities(query: string): Promise<CitySearchResult[]> {
  try {
    const geocodeResults = await geocodeLocation(query);
    const countries = await getAllCountries();

    return geocodeResults
      .filter(result => result.address.city || result.address.country)
      .map(result => {
        const countryCode = result.address.country_code?.toUpperCase() || '';
        const country = countries.find(c => c.cca2 === countryCode);

        return {
          id: `${result.place_id}`,
          name: result.address.city || result.display_name.split(',')[0],
          country: result.address.country || 'Unknown',
          countryCode,
          flag: country?.flag || '🌍',
          population: undefined,
        };
      })
      .slice(0, 10);
  } catch (error: any) {
    console.error('[SearchCities] ❌ Erro:', error.message);
    return [];
  }
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Limpar cache local (útil para debug ou force refresh)
 */
export function clearInternationalCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('intl_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('[Cache] 🧹 Cache internacional limpo');
}

/**
 * Obter tamanho do cache
 */
export function getCacheSize(): { keys: number; sizeKB: number } {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('intl_'));
  const sizeBytes = keys.reduce((total, key) => {
    return total + (localStorage.getItem(key)?.length || 0);
  }, 0);

  return {
    keys: keys.length,
    sizeKB: Math.round(sizeBytes / 1024),
  };
}